from flask_restful import Resource
from flask import request

from database import Collection, db


class CollectionListResource(Resource):
    def get(self):
        user_id = request.args.get('user_id', 1)
        collections = Collection.query.filter_by(user_id=user_id).all()
        return [collection.to_dict() for collection in collections]

    def post(self):
        data = request.get_json()
        data['user_id'] = 1  # Default to Joseph's user_id
        collection = Collection(**data)
        db.session.add(collection)
        db.session.commit()
        return collection.to_dict(), 201


class CollectionResource(Resource):
    def get(self, id):
        collection = Collection.query.get(id)
        if collection:
            return collection.to_dict()
        else:
            return {"error": "Collection not found"}, 404

    def put(self, id):
        collection = Collection.query.get(id)
        if collection:
            data = request.get_json()
            collection.update(**data)
            db.session.commit()
            return collection.to_dict()
        else:
            return {"error": "Collection not found"}, 404

    def delete(self, id):
        collection = Collection.query.get(id)
        if collection:
            db.session.delete(collection)
            db.session.commit()
            return {"message": "Collection deleted"}
        else:
            return {"error": "Collection not found"}, 404
