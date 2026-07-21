from flask_restful import Resource
from flask import request

from database import db, Favorite


class FavoritesResource(Resource):
    def get(self):
        user_id = request.args.get("user_id")
        if not user_id:
            return {"message": "User ID is required"}, 400

        favorites = Favorite.query.filter_by(user_id=user_id).all()
        return [favorite.to_dict() for favorite in favorites], 200

    def post(self):
        data = request.get_json()
        if not data or "user_id" not in data or "setup_id" not in data:
            return {"message": "Invalid request"}, 400

        user_id = data["user_id"]
        setup_id = data["setup_id"]

        # Check if already favorited
        existing = Favorite.query.filter_by(user_id=user_id, setup_id=setup_id).first()
        if existing:
            return {"message": "Already favorited"}, 400

        favorite = Favorite(user_id=user_id, setup_id=setup_id)
        db.session.add(favorite)
        db.session.commit()

        return favorite.to_dict(), 201

    def delete(self):
        data = request.get_json()
        if not data or "user_id" not in data or "setup_id" not in data:
            return {"message": "Invalid request"}, 400

        user_id = data["user_id"]
        setup_id = data["setup_id"]

        favorite = Favorite.query.filter_by(user_id=user_id, setup_id=setup_id).first()
        if not favorite:
            return {"message": "Favorite not found"}, 404

        db.session.delete(favorite)
        db.session.commit()

        return {"message": "Favorite deleted"}, 200

    def patch(self):
        data = request.get_json()
        if not data or "user_id" not in data or "spot_id" not in data:
            return {"message": "Invalid request"}, 400

        user_id = data["user_id"]
        spot_id = data["spot_id"]

        favorite = Favorite.query.filter_by(user_id=user_id, spot_id=spot_id).first()
        if not favorite:
            return {"message": "Favorite not found"}, 404

        favorite.is_favorite = not favorite.is_favorite
        db.session.commit()

        return favorite.to_dict(), 200


class FavoritesList(Resource):
    def get(self):
        user_id = request.args.get("user_id")
        if not user_id:
            return {"message": "Invalid request"}, 400

        favorites = Favorite.query.filter_by(user_id=user_id).all()
        return [favorite.setup.to_dict() for favorite in favorites], 200
