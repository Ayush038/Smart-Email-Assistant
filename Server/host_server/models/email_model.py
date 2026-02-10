from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from enum import Enum


class EmailCategory(str, Enum):
    WORK = "Work"
    PERSONAL = "Personal"
    FINANCE = "Finance"
    PROMOTIONS = "Promotions"
    UPDATES = "Updates"
    SPAM = "Spam"


class EmailSummary(BaseModel):
    summary: str
    action_items: list[str] = []
    intent: str = "unknown"
    entities: list[str] = []


class EmailCreate(BaseModel):
    receiver: EmailStr
    subject: str
    body: str


class EmailResponse(EmailCreate):
    id: str
    created_at: datetime

    category: Optional[EmailCategory] = None
    priority_score: Optional[float] = None

    summary: Optional[EmailSummary] = None

    urgency: Optional[str] = None
    factors: Optional[list[str]] = None
    action_items: Optional[list[str]] = None
    intent: Optional[str] = None
    entities: Optional[list[str]] = None