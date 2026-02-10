from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    username: str = Field(min_length=3, max_length=30)
    full_name: str = Field(min_length=2, max_length=100)

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str):
        if not v.replace("_", "").isalnum():
            raise ValueError(
                "Username can only contain letters, numbers, and underscores"
            )
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict