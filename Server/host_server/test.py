from pymongo import MongoClient
import certifi
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")

if not uri:
    raise RuntimeError("MONGO_URI missing")

client = MongoClient(
    uri,
    tls=True,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=5000,
)

print("Connecting...")
print(client.admin.command("ping"))
print("✅ Mongo connected")