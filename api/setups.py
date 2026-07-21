from flask_restful import Resource
from werkzeug.utils import secure_filename
from supabase import create_client, Client
import uuid
import os
import json

from dotenv import load_dotenv
from flask import request

from database import db, Setup, Item

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class SetupResource(Resource):
    """Handles single setup operations (GET, PUT, DELETE)."""

    def get(self, id):
        setup = Setup.query.get(id)
        if setup:
            # We need a proper serialization function that also includes associated items
            # and deserializes annotations for a complete response.
            return self._serialize_setup(setup)
        return {"message": "not found"}, 404

    def delete(self, id):
        setup = Setup.query.get(id)
        if setup:
            db.session.delete(setup)
            db.session.commit()
            return {"message": "Setup deleted"}, 200
        return {"message": "Setup not found"}, 404

    @staticmethod
    def _serialize_setup(setup):
        """Helper to serialize a Setup model, including deserialized annotations."""
        data = setup.to_dict(rules=("-items",))  # Exclude default item list

        # Deserialize the annotations string back into a Python list
        try:
            annotations_data = (
                json.loads(setup.annotations) if setup.annotations else []
            )
        except json.JSONDecodeError:
            annotations_data = []  # Handle corrupted JSON

        # Fetch all associated items
        items_map = {item.id: item.to_dict() for item in setup.items}

        # Combine items with positional data from annotations
        annotated_items = []
        for ann in annotations_data:
            item_id = ann.get("item_id")
            if item_id in items_map:
                item_details = items_map[item_id]
                annotated_items.append(
                    {
                        "id": item_id,
                        "name": item_details["name"],
                        "price": item_details["price"],
                        "link": item_details["link"],
                        "x": ann["x"],
                        "y": ann["y"],
                    }
                )

        data["items"] = annotated_items
        # The 'annotations' field in the final response is now the combined 'items' list
        del data["annotations"]
        return data


class SetupListResource(Resource):
    """Handles collection setups operations (GET, POST)."""

    def get(self):
        from database import Favorite
        setups = Setup.query.all()
        user_id = request.args.get('user_id', 1)  # Default to user 1 (Joseph)

        # Get user's favorites
        favorites = Favorite.query.filter_by(user_id=user_id).all()
        favorite_setup_ids = {fav.setup_id for fav in favorites}

        result = []
        for setup in setups:
            setup_dict = setup.to_dict()
            # Transform to match frontend expectations
            setup_dict["title"] = setup_dict.pop("name")
            setup_dict["image"] = setup_dict.pop("image_url")
            setup_dict["author"] = f"@{setup.user.username}"
            setup_dict["isFavorited"] = setup.id in favorite_setup_ids
            result.append(setup_dict)
        return result

    def post(self):
        # We need to handle multipart form data for file upload AND JSON data for annotations
        # Flask-Restful's request.get_json() often fails when request.files is present.

        # 1. Image and Setup Name Validation/Extraction
        if "file" not in request.files:
            return {"error": "No image file provided."}, 400

        file = request.files["file"]

        # Ensure we have the necessary JSON payload (annotations/items)
        try:
            payload = json.loads(request.form["data"])
            setup_name = payload.get("setup_name")
            items_data = payload.get("items", [])
            # NOTE: We are assuming user_id is hardcoded to 1 for this demonstration
            # In production, this would come from an authentication token.
            user_id = 1

            if not setup_name:
                return {"error": "Setup name is required."}, 400

        except (KeyError, json.JSONDecodeError):
            return {
                "error": "Invalid or missing JSON payload in 'data' form field."
            }, 400

        # 2. Upload image to Supabase Storage
        original_filename = secure_filename(file.filename)
        file_extension = os.path.splitext(original_filename)[1]
        unique_filename = f"setups/{uuid.uuid4()}{file_extension}"
        file_bytes = file.read()

        try:
            supabase.storage.from_("images").upload(
                file=file_bytes,
                path=unique_filename,
                file_options={"content-type": file.mimetype},
            )
            url = supabase.storage.from_("images").get_public_url(unique_filename)
        except Exception as e:
            print(f"Supabase Upload Error: {e}")
            return {"error": f"Image upload failed: {e}"}, 500

        # 3. Create Setup Record (Setup 1/2)
        setup = Setup(
            name=setup_name,
            image_url=url,
            # annotations field is set later in Step 5
            user_id=user_id,
        )
        db.session.add(setup)
        db.session.commit()  # Commit now to get the setup.id

        # 4. Create Items and Map IDs
        # This list will hold the clean data needed for the Setup.annotations JSON
        annotation_metadata = []

        for item_data in items_data:
            # Convert price to float, handling potential string formatting issues
            try:
                price_str = (
                    str(item_data.get("price", "0")).replace("$", "").replace(",", "")
                )
                price_float = float(price_str)
            except ValueError:
                price_float = 0.0  # Default to 0 if parsing fails

            new_item = Item(
                name=item_data.get("name", "Unnamed Item"),
                description="",  # Description is not captured in the current frontend
                price=price_float,
                image_url="",  # Item image URL is not captured in the current frontend
                link=item_data.get("link"),
                setup_id=setup.id,
                user_id=user_id,
            )
            db.session.add(new_item)
            db.session.flush()  # Flush to get the Item.id without a full commit

            # Map the new Item.id to the client's positional data (x, y)
            annotation_metadata.append(
                {
                    "item_id": new_item.id,
                    "x": item_data.get("x"),
                    "y": item_data.get("y"),
                }
            )

        # Commit all new items
        db.session.commit()

        # 5. Update Setup with Final Annotations (Setup 2/2)
        try:
            setup.annotations = json.dumps(annotation_metadata)
            db.session.commit()
        except Exception as e:
            # If the final update fails, log error and attempt rollback
            print(f"Failed to update annotations for Setup {setup.id}: {e}")
            db.session.rollback()
            return {"error": "Failed to finalize setup annotations."}, 500

        # Return the fully serialized object
        return SetupResource._serialize_setup(setup=setup), 201
