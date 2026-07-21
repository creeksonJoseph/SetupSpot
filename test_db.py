from main import app
from database import db, User, Setup, Item, Collection, Favorite

with app.app_context():
    # Test basic queries
    users = User.query.all()
    print(f"Users: {len(users)}")
    
    setups = Setup.query.all()
    print(f"Setups: {len(setups)}")
    
    items = Item.query.all()
    print(f"Items: {len(items)}")
    
    collections = Collection.query.all()
    print(f"Collections: {len(collections)}")
    
    favorites = Favorite.query.all()
    print(f"Favorites: {len(favorites)}")
    
    # Test serialization
    if users:
        user = users[0]
        print(f"User serialization: {user.to_dict()}")
    
    if setups:
        setup = setups[0]
        print(f"Setup serialization: {setup.to_dict()}")