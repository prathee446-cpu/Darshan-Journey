from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    fullName: str = Field(..., example="Santhosh Devotee")
    email: EmailStr = Field(..., example="devotee@darshanjourney.com")
    phone: Optional[str] = Field(default="+91 98765 43210")
    password: str = Field(..., min_length=4)

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="devotee@darshanjourney.com")
    password: str = Field(...)

class UserResponse(BaseModel):
    id: str
    fullName: str
    email: EmailStr
    phone: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    user: UserResponse
    token: str
