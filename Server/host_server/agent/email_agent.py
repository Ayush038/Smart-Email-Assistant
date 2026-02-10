from fastmcp import Client
from storage.email_repository import EmailRepository
from agent.tool_registry import ToolRegistry
from agent.tool_planner import plan_tools
from services.aggrigationServices import AggregationService
from auth.user_repository import UserRepository
from bson import ObjectId
from fastapi import HTTPException
import asyncio
import os


class EmailAgent:
    def __init__(self):
        self.repo = EmailRepository()
        self.user_repo = UserRepository()
        mcp_url = os.getenv("MCP_SERVER_URL", "http://localhost:8001/mcp")
        self.client = Client(mcp_url)
        self.registry = ToolRegistry(self.client)
        self._connected = False
        self.aggregator = AggregationService(self.repo)

    async def start(self):
        if not self._connected:
            await self.client.__aenter__()
            self._connected = True
            print("[Agent] MCP connected")

    async def stop(self):
        if self._connected:
            await self.client.__aexit__(None, None, None)
            self._connected = False
            print("[Agent] MCP disconnected")

    async def process_new_email(
        self,
        email_data: dict,
        user_email: str,
    ) -> dict:

        email_data["sender"] = user_email

        receiver = email_data["receiver"]
        receiver_user = self.user_repo.get_by_email(receiver)

        if not receiver_user:
            raise HTTPException(
                status_code=404,
                detail="Recipient email does not exist",
            )

        subject = email_data["subject"]
        body = email_data["body"]

        ingestion_tools = {
            k: v
            for k, v in self.registry.list_tools().items()
            if k != "summarize_email"
        }

        plan = plan_tools(subject, body, ingestion_tools)
        if not plan:
            plan = [
                {"tool": "classify_email"},
                {"tool": "score_priority"},
            ]

        results = {}

        for step in plan:
            tool_name = step["tool"]

            if tool_name == "score_priority" and "category" not in email_data:
                continue

            args = {
                "subject": subject,
                "body": body,
            }

            if tool_name == "score_priority":
                args["category"] = email_data.get("category")

            response = await self.registry.call_tool(tool_name, **args)

            output = response.data or {}

            email_data.update(output)
            results.update(output)

        email_id = self.repo.create_email(email_data)

        return {
            "email_id": email_id,
            **results,
        }

    async def summarize_email(
        self,
        email_id: str,
        user_email: str,
    ) -> dict:

        email = self.repo.get_email(email_id, user_email)

        if not email:
            return {"error": "Email not found or access denied"}

        if email.get("summary"):
            cached = email["summary"]

            if isinstance(cached, str):
                return {
                    "email_id": email_id,
                    "summary": cached,
                    "action_items": [],
                    "intent": "unknown",
                    "entities": [],
                    "cached": True,
                }

            return {
                "email_id": email_id,
                **cached,
                "cached": True,
            }

        print("[SUMMARY] cache miss → calling MCP")

        response = await self.registry.call_tool(
            "summarize_email",
            subject=email["subject"],
            body=email["body"],
        )

        output = response.data or {}

        # ✅ Store full structured summary object
        if output and output.get("summary"):
            self.repo.update_summary(
                email_id,
                output,
                user_email,
            )

        print("[SUMMARY] completed")

        return {
            "email_id": email_id,
            **output,
            "cached": False,
        }

    async def aggregate_recent(
        self,
        user_email: str,
        limit: int = 10,
    ) -> dict:

        loop = asyncio.get_running_loop()

        return await loop.run_in_executor(
            None,
            self.aggregator.aggregate_recent,
            user_email,
            limit,
        )

    async def aggregate_urgent(
        self,
        user_email: str,
        threshold: float = 7.0,
    ) -> dict:

        loop = asyncio.get_running_loop()

        return await loop.run_in_executor(
            None,
            self.aggregator.aggregate_urgent,
            user_email,
            threshold,
        )