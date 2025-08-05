from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
MONGODB_URI = os.environ.get("MONGODB_URI")

client = MongoClient(MONGODB_URI)
db = client.get_default_database()  # Or specify db name here: client["voicebot-dev"]

# Example to access a collection:
# users_collection = db["users"]
