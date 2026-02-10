from pymongo import MongoClient
import os
from bson import ObjectId

client = MongoClient(os.getenv("MONGO_URI"))
db = client["email_assistant"]
users = db["users"]

users.create_index("email", unique=True)

users.create_index(
    "username",
    unique=True,
    partialFilterExpression={"username": {"$type": "string"}},
)


class UserRepository:
    def create_user(
        self,
        email: str,
        hashed_password: str,
        username: str,
        full_name: str,
    ):
        return users.insert_one({
            "email": email.lower(),
            "password": hashed_password,
            "username": username.lower(),
            "full_name": full_name,
        })

    def get_by_email(self, email: str):
        return users.find_one({"email": email.lower()})

    def get_by_username(self, username: str):
        return users.find_one({"username": username.lower()})

    def get_by_id(self, user_id: str):
        return users.find_one({"_id": ObjectId(user_id)})