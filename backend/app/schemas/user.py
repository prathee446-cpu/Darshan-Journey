from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserCreate(BaseModel):
    fullName: str = Field(..., example="Santhosh Devotee")
    email: EmailStr = Field(..., example="devotee@darshanjourney.com")
    phone: Optional[str] = Field(default="")
    password: str = Field(..., min_length=6)

class RegisterOTPRequest(BaseModel):
    fullName: str = Field(..., min_length=2)
    email: EmailStr
    mobile: str = Field(..., min_length=7)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="devotee@darshanjourney.com")
    password: str = Field(...)

class UserResponse(BaseModel):
    id: str
    fullName: str
    name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    mobile: Optional[str] = None
    address: Optional[str] = None
    emergencyContact: Optional[str] = None
    provider: Optional[str] = None
    status: Optional[str] = "active"
    avatar: Optional[str] = None
    createdAt: Optional[str] = None
    lastLogin: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    user: UserResponse
    token: str

# ─── OTP Authentication Schemas ───

class OTPRequest(BaseModel):
    email: EmailStr = Field(..., example="devotee@gmail.com")

class OTPVerify(BaseModel):
    email: EmailStr = Field(..., example="devotee@gmail.com")
    otp: str = Field(..., min_length=6, max_length=6)

class OTPResponse(BaseModel):
    success: bool
    message: str
    cooldownSeconds: Optional[int] = None

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = Field(default=None, description="Google ID token (JWT) from GIS callback")
    accessToken: Optional[str] = Field(default=None, description="Google OAuth 2.0 Access Token from GIS token client")

class GoogleAuthResponse(BaseModel):
    success: bool = True
    requiresOtp: Optional[bool] = False
    email: Optional[str] = None
    tempAuthToken: Optional[str] = None
    message: Optional[str] = None
    cooldownSeconds: Optional[int] = None
    user: Optional[UserResponse] = None
    token: Optional[str] = None

class GoogleOTPVerify(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    tempAuthToken: Optional[str] = None


