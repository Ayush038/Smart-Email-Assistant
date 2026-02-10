from bson import ObjectId
from datetime import datetime
from storage.mongo_client import get_database
from bson.errors import InvalidId


class EmailRepository:
    def __init__(self):
        self.db = get_database()
        self.collection = self.db["emails"]

    def create_email(self, email_data: dict) -> str:
        email_data["created_at"] = datetime.utcnow()
        result = self.collection.insert_one(email_data)
        return str(result.inserted_id)

    def _visibility_filter(self, user_email: str) -> dict:
        return {
            "$or": [
                {"sender": user_email},
                {"receiver": user_email},
            ]
        }

    def get_email(self, email_id: str, user_email: str) -> dict | None:
        try:
            email = self.collection.find_one({
                "_id": ObjectId(email_id),
                **self._visibility_filter(user_email),
            })

            if email:
                email["_id"] = str(email["_id"])

            return email

        except InvalidId:
            return None

    def list_emails(self, user_email: str) -> list[dict]:
        emails = []

        cursor = (
            self.collection
            .find(self._visibility_filter(user_email))
            .sort("created_at", -1)
        )

        for email in cursor:
            email["_id"] = str(email["_id"])
            emails.append(email)

        return emails

    def list_inbox(self, user_email: str) -> list[dict]:
        emails = []

        cursor = (
            self.collection
            .find({"receiver": user_email})
            .sort("created_at", -1)
        )

        for email in cursor:
            email["_id"] = str(email["_id"])
            emails.append(email)

        return emails

    def list_sent(self, user_email: str) -> list[dict]:
        emails = []

        cursor = (
            self.collection
            .find({"sender": user_email})
            .sort("created_at", -1)
        )

        for email in cursor:
            email["_id"] = str(email["_id"])
            emails.append(email)

        return emails

    def delete_email(self, email_id: str, user_email: str) -> bool:
        try:
            result = self.collection.delete_one({
                "_id": ObjectId(email_id),
                **self._visibility_filter(user_email),
            })

            return result.deleted_count > 0

        except InvalidId:
            return False

    # UPDATED: summary is now stored as a structured object
    def update_summary(
        self,
        email_id: str,
        summary: dict,
        user_email: str,
    ) -> bool:
        try:
            result = self.collection.update_one(
                {
                    "_id": ObjectId(email_id),
                    **self._visibility_filter(user_email),
                },
                {"$set": {"summary": summary}},
            )

            return result.modified_count > 0

        except InvalidId:
            return False

    def get_recent(self, user_email: str, limit: int = 10) -> list[dict]:
        emails = []

        cursor = (
            self.collection
            .find(self._visibility_filter(user_email))
            .sort("created_at", -1)
            .limit(limit)
        )

        for email in cursor:
            email["_id"] = str(email["_id"])
            emails.append(email)

        return emails

    def get_by_priority(
        self,
        user_email: str,
        min_score: float = 7.0,
        limit: int | None = None,
    ) -> list[dict]:

        query = {
            "$and": [
                self._visibility_filter(user_email),
                {"priority_score": {"$gte": min_score}},
            ]
        }

        cursor = self.collection.find(query).sort("priority_score", -1)

        if limit:
            cursor = cursor.limit(limit)

        emails = []

        for email in cursor:
            email["_id"] = str(email["_id"])
            emails.append(email)

        return emails

    def search_by_keyword(
        self,
        user_email: str,
        keyword: str,
        limit: int = 20,
    ) -> list[dict]:

        query = {
            "$and": [
                self._visibility_filter(user_email),
                {"$text": {"$search": keyword}},
            ]
        }

        cursor = (
            self.collection
            .find(query, {"score": {"$meta": "textScore"}})
            .sort([("score", {"$meta": "textScore"})])
            .limit(limit)
        )

        emails = []

        for email in cursor:
            email["_id"] = str(email["_id"])
            emails.append(email)

        return emails