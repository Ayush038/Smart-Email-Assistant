from pymongo import MongoClient
from dotenv import load_dotenv
import certifi
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI not found in .env")

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000,
)

db = client[DATABASE_NAME]


def get_database():
    return db