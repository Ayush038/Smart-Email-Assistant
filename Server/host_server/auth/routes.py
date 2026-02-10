from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer

from .schemas import SignupRequest, LoginRequest, TokenResponse
from .security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)
from .user_repository import UserRepository

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
repo = UserRepository()


@router.post("/signup", response_model=TokenResponse)
def signup(data: SignupRequest):
    # Email uniqueness check
    if repo.get_by_email(data.email):
        raise HTTPException(400, "Email already registered")

    # Username uniqueness check
    if repo.get_by_username(data.username):
        raise HTTPException(400, "Username already taken")

    hashed = hash_password(data.password)

    result = repo.create_user(
        data.email,
        hashed,
        data.username,
        data.full_name,
    )

    user = repo.get_by_id(str(result.inserted_id))

    token = create_access_token(str(user["_id"]))

    return TokenResponse(
        access_token=token,
        user={
            "id": str(user["_id"]),
            "email": user["email"],
            "username": user["username"],
            "full_name": user["full_name"],
        },
    )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    user = repo.get_by_email(data.email)

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token(str(user["_id"]))

    return TokenResponse(
        access_token=token,
        user={
            "id": str(user["_id"]),
            "email": user["email"],
            "username": user.get("username", ""),
            "full_name": user.get("full_name", ""),
        },
    )


def get_current_user(token: str = Depends(oauth2_scheme)):
    user_id = decode_token(token)

    if not user_id:
        raise HTTPException(401, "Invalid token")

    user = repo.get_by_id(user_id)

    if not user:
        raise HTTPException(401, "User not found")

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "username": user.get("username", ""),
        "full_name": user.get("full_name", ""),
    }