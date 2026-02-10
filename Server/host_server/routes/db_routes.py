from fastapi import APIRouter, Depends
from storage.email_repository import EmailRepository
from models.email_model import EmailCreate
from dependency import agent
from auth.routes import get_current_user

router = APIRouter(prefix="/emails", tags=["Emails"])
repo = EmailRepository()


@router.post("/")
async def create_email(
    email: EmailCreate,
    user=Depends(get_current_user),
):
    return await agent.process_new_email(
        email.model_dump(),
        user["email"],
    )


@router.get("/")
def list_emails(user=Depends(get_current_user)):
    return repo.list_emails(user["email"])


@router.get("/inbox")
def inbox(user=Depends(get_current_user)):
    return repo.list_inbox(user["email"])


@router.get("/sent")
def sent(user=Depends(get_current_user)):
    return repo.list_sent(user["email"])


@router.get("/{email_id}")
def get_email(
    email_id: str,
    user=Depends(get_current_user),
):
    email = repo.get_email(email_id, user["email"])
    return email or {"error": "Email not found"}


@router.delete("/{email_id}")
def delete_email(
    email_id: str,
    user=Depends(get_current_user),
):
    success = repo.delete_email(email_id, user["email"])
    return {"deleted": success}


@router.post("/{email_id}/summarize")
async def summarize_email(
    email_id: str,
    user=Depends(get_current_user),
):
    return await agent.summarize_email(
        email_id,
        user["email"],
    )

@router.get("/aggregate/recent")
async def aggregate_recent(
    limit: int = 10,
    user=Depends(get_current_user),
):
    return await agent.aggregate_recent(
        user["email"],
        limit,
    )


@router.get("/aggregate/urgent")
async def aggregate_urgent(
    threshold: float = 7.0,
    user=Depends(get_current_user),
):
    return await agent.aggregate_urgent(
        user["email"],
        threshold,
    )