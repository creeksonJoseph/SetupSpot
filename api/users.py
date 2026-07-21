from flask_restful import Resource
from flask import request
from database import db, User, Setup

class UserResource(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404
        
        # Get user's setups
        setups = Setup.query.filter_by(user_id=user_id).all()
        
        # Transform setups data
        user_setups = []
        for setup in setups:
            user_setups.append({
                "id": setup.id,
                "title": setup.name,
                "image": setup.image_url,
            })
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "setups": user_setups
        }, 200