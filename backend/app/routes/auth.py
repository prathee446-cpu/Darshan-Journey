import time
from fastapi import APIRouter, HTTPException, Depends, Header, status
from app.schemas.user import UserCreate, UserLogin, AuthResponse, UserResponse
from app.services.auth_service import hash_password, verify_password, create_jwt_token, decode_jwt_token
from app.database import get_collection

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponse)
def register(user_data: UserCreate):
    users_col = get_collection("users")
    
    # Check if user with email already exists
    existing_user = users_col.find_one({"email": user_data.email.lower()})
    if existing_user:
        # If user exists, log in seamlessly or raise error
        user_id = str(existing_user.get("_id"))
        user_obj = UserResponse(
            id=user_id,
            fullName=existing_user.get("fullName", user_data.fullName),
            email=existing_user.get("email"),
            phone=existing_user.get("phone", user_data.phone)
        )
        token = create_jwt_token({"sub": user_id, "email": existing_user.get("email")})
        return AuthResponse(
            success=True,
            message=f"Welcome back, {user_obj.fullName}! Account registered.",
            user=user_obj,
            token=token
        )

    # Insert new user into MongoDB Atlas `users` collection
    hashed_pwd = hash_password(user_data.password)
    user_doc = {
        "fullName": user_data.fullName,
        "email": user_data.email.lower(),
        "phone": user_data.phone,
        "hashed_password": hashed_pwd,
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    result = users_col.insert_one(user_doc)
    user_id = str(result.inserted_id)

    user_obj = UserResponse(
        id=user_id,
        fullName=user_data.fullName,
        email=user_data.email.lower(),
        phone=user_data.phone
    )
    token = create_jwt_token({"sub": user_id, "email": user_data.email.lower()})

    return AuthResponse(
        success=True,
        message=f"🙏 Sacred Welcome, {user_data.fullName}! Your account has been registered.",
        user=user_obj,
        token=token
    )

@router.post("/login", response_model=AuthResponse)
def login(login_data: UserLogin):
    users_col = get_collection("users")
    
    # Find user by email in MongoDB Atlas
    user_doc = users_col.find_one({"email": login_data.email.lower()})
    
    if not user_doc:
        # If user not registered in DB yet, create a devotee account
        hashed_pwd = hash_password(login_data.password)
        new_doc = {
            "fullName": "Devotee",
            "email": login_data.email.lower(),
            "phone": "+91 98765 43210",
            "hashed_password": hashed_pwd,
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        res = users_col.insert_one(new_doc)
        user_doc = new_doc
        user_id = str(res.inserted_id)
    else:
        user_id = str(user_doc["_id"])
        # Verify password if hashed_password is present
        if "hashed_password" in user_doc:
            if not verify_password(login_data.password, user_doc["hashed_password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials. Please verify email and password."
                )

    user_obj = UserResponse(
        id=user_id,
        fullName=user_doc.get("fullName", "Devotee"),
        email=user_doc.get("email"),
        phone=user_doc.get("phone", "+91 98765 43210")
    )
    token = create_jwt_token({"sub": user_id, "email": user_doc.get("email")})

    return AuthResponse(
        success=True,
        message="✨ Signed in successfully! Continuing your spiritual journey...",
        user=user_obj,
        token=token
    )

@router.get("/me", response_model=UserResponse)
def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Bearer token required")
    
    token = authorization.split(" ")[1]
    decoded = decode_jwt_token(token)
    if not decoded or "sub" not in decoded:
        raise HTTPException(status_code=401, detail="Invalid token")

    users_col = get_collection("users")
    from bson.objectid import ObjectId
    try:
        user_doc = users_col.find_one({"_id": ObjectId(decoded["sub"])})
    except Exception:
        user_doc = users_col.find_one({"email": decoded.get("email")})

    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=str(user_doc["_id"]),
        fullName=user_doc.get("fullName", "Devotee"),
        email=user_doc.get("email"),
        phone=user_doc.get("phone")
    )
