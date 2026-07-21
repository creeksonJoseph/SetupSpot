from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

load_dotenv()

from database import db
from api import (
    SetupResource,
    SetupListResource,
    CollectionResource,
    CollectionListResource,
    FavoritesList,
    FavoritesResource,
)
from api.users import UserResource

app = Flask(__name__)

# Use NeonDB PostgreSQL when DATABASE_URL is set, otherwise fall back to local SQLite
db_url = os.getenv("DATABASE_URL", "sqlite:///database.db")
app.config["SQLALCHEMY_DATABASE_URI"] = db_url

db.init_app(app)
Migrate(app, db)
CORS(app)
api = Api(app)


@app.errorhandler(404)
def not_found(error):
    return {"message": "Not found"}, 404


api.add_resource(SetupResource, "/setups/<int:id>")
api.add_resource(SetupListResource, "/setups")
api.add_resource(CollectionResource, "/collections/<int:id>")
api.add_resource(CollectionListResource, "/collections")
api.add_resource(FavoritesResource, "/favorites")
api.add_resource(FavoritesList, "/favorites/list")
api.add_resource(UserResource, "/users/<int:user_id>")


if __name__ == "__main__":
    app.run(debug=True)
