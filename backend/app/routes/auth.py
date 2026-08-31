import time
import logging
from fastapi import APIRouter, HTTPException, Depends, Header, status
from app.schemas.user import (
    UserCreate, UserLogin, AuthResponse, UserResponse,
    OTPRequest, OTPVerify, OTPResponse, GoogleAuthRequest,
    RegisterOTPRequest, GoogleAuthResponse, GoogleOTPVerify
)
from app.services.auth_service import hash_password, verify_password, create_jwt_token, decode_jwt_token
from app.services.email_service import (
    generate_otp, check_rate_limit, record_otp_request,
    store_otp, verify_otp as verify_otp_code, send_otp_email
)
from app.database import get_collection
from app.config import settings

logger = logging.getLogger("darshan.auth")

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
        phone=user_doc.get("phone"),
        provider=user_doc.get("provider"),
        avatar=user_doc.get("avatar")
    )


# ═══════════════════════════════════════════════════════════════
#  EMAIL OTP AUTHENTICATION
# ═══════════════════════════════════════════════════════════════

# In-memory pending registrations store: { email: { ... } }
pending_registrations = {}

@router.post("/register-send-otp", response_model=OTPResponse)
def register_send_otp(data: RegisterOTPRequest):
    """Initiate user registration by dispatching an OTP to the given email."""
    email = data.email.lower()
    users_col = get_collection("users")
    
    # Check if user already exists
    if users_col.find_one({"email": email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please Sign In."
        )

    if not check_rate_limit(email):
        return OTPResponse(
            success=False,
            message="Too many verification requests. Please wait before trying again.",
            cooldownSeconds=60
        )

    otp = generate_otp()
    pending_registrations[email] = {
        "fullName": data.fullName.strip(),
        "email": email,
        "mobile": data.mobile.strip(),
        "password": hash_password(data.password),
        "otp": otp,
        "createdAt": time.time(),
        "attempts": 0
    }
    record_otp_request(email)

    result = send_otp_email(email, otp, user_name=data.fullName.strip())
    if result["success"]:
        return OTPResponse(
            success=True,
            message=f"Verification code sent to {email}. Please check your inbox.",
            cooldownSeconds=30
        )
    return OTPResponse(
        success=False,
        message=result.get("error", "Failed to send verification code. Please try again."),
        cooldownSeconds=10
    )


@router.post("/register-verify-otp", response_model=AuthResponse)
def register_verify_otp(data: OTPVerify):
    """Verify OTP and activate the new devotee account."""
    email = data.email.lower()
    otp = data.otp.strip()

    pending = pending_registrations.get(email)
    if not pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending registration found for this email. Please register again."
        )

    if time.time() - pending["createdAt"] > 300: # 5 minutes
        pending_registrations.pop(email, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please register again."
        )

    if pending["attempts"] >= 5:
        pending_registrations.pop(email, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many incorrect attempts. Please submit registration again."
        )

    pending["attempts"] += 1

    if pending["otp"] != otp:
        remaining = 5 - pending["attempts"]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification code. {remaining} attempt(s) remaining."
        )

    # Valid OTP -> Create in MongoDB
    pending_registrations.pop(email, None)
    users_col = get_collection("users")
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    new_doc = {
        "fullName": pending["fullName"],
        "email": email,
        "phone": pending["mobile"],
        "mobile": pending["mobile"],
        "hashed_password": pending["password"],
        "provider": "email",
        "status": "active",
        "avatar": pending["fullName"][:1].upper() if pending["fullName"] else "D",
        "createdAt": now_iso,
        "lastLogin": now_iso
    }
    res = users_col.insert_one(new_doc)
    user_id = str(res.inserted_id)

    user_obj = UserResponse(
        id=user_id,
        fullName=pending["fullName"],
        name=pending["fullName"],
        email=email,
        phone=pending["mobile"],
        mobile=pending["mobile"],
        provider="email",
        status="active",
        avatar=new_doc["avatar"],
        createdAt=now_iso,
        lastLogin=now_iso
    )
    token = create_jwt_token({"sub": user_id, "email": email, "name": pending["fullName"]})

    return AuthResponse(
        success=True,
        message=f"🙏 Sacred Welcome, {pending['fullName']}! Your account is now active.",
        user=user_obj,
        token=token
    )


@router.post("/signin-send-otp", response_model=OTPResponse)
def signin_send_otp(data: OTPRequest):
    """Send login OTP to registered email."""
    email = data.email.lower()
    users_col = get_collection("users")
    user_doc = users_col.find_one({"email": email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email address. Please Create Account first."
        )

    if not check_rate_limit(email):
        return OTPResponse(
            success=False,
            message="Too many verification requests. Please wait before trying again.",
            cooldownSeconds=60
        )

    otp = generate_otp()
    store_otp(email, otp)
    record_otp_request(email)

    user_name = user_doc.get("fullName", "Devotee")
    result = send_otp_email(email, otp, user_name=user_name)
    if result["success"]:
        return OTPResponse(
            success=True,
            message=f"Verification code sent to {email}. Please check your inbox.",
            cooldownSeconds=30
        )
    return OTPResponse(
        success=False,
        message=result.get("error", "Failed to send verification code. Please try again."),
        cooldownSeconds=10
    )


@router.post("/signin-verify-otp", response_model=AuthResponse)
def signin_verify_otp(data: OTPVerify):
    """Verify sign in OTP and create session."""
    email = data.email.lower()
    otp = data.otp.strip()

    result = verify_otp_code(email, otp)
    if not result["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )

    users_col = get_collection("users")
    user_doc = users_col.find_one({"email": email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    users_col.update_one({"_id": user_doc["_id"]}, {"$set": {"lastLogin": now_iso, "status": "active"}})

    user_id = str(user_doc["_id"])
    user_obj = UserResponse(
        id=user_id,
        fullName=user_doc.get("fullName", "Devotee"),
        name=user_doc.get("fullName", "Devotee"),
        email=email,
        phone=user_doc.get("phone", ""),
        mobile=user_doc.get("mobile", user_doc.get("phone", "")),
        provider=user_doc.get("provider", "email"),
        status="active",
        avatar=user_doc.get("avatar", "D"),
        createdAt=user_doc.get("createdAt"),
        lastLogin=now_iso
    )
    token = create_jwt_token({"sub": user_id, "email": email, "name": user_obj.fullName})

    return AuthResponse(
        success=True,
        message=f"✨ Welcome back, {user_obj.fullName}!",
        user=user_obj,
        token=token
    )


@router.post("/send-otp", response_model=OTPResponse)
def send_otp(data: OTPRequest):
    """Generic send OTP endpoint."""
    email = data.email.lower()

    if not check_rate_limit(email):
        return OTPResponse(
            success=False,
            message="Too many verification requests. Please wait before trying again.",
            cooldownSeconds=60
        )

    otp = generate_otp()
    store_otp(email, otp)
    record_otp_request(email)

    result = send_otp_email(email, otp, user_name=email.split("@")[0].title())
    if result["success"]:
        return OTPResponse(
            success=True,
            message=f"Verification code sent to {email}. Please check your inbox.",
            cooldownSeconds=30
        )
    return OTPResponse(
        success=False,
        message=result.get("error", "Failed to send verification code. Please try again."),
        cooldownSeconds=10
    )


@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp_endpoint(data: OTPVerify):
    """Generic verify OTP endpoint."""
    email = data.email.lower()
    otp = data.otp.strip()

    result = verify_otp_code(email, otp)
    if not result["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )

    users_col = get_collection("users")
    user_doc = users_col.find_one({"email": email})
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    if not user_doc:
        user_name = email.split("@")[0].title()
        new_doc = {
            "fullName": user_name,
            "email": email,
            "phone": "",
            "provider": "email",
            "status": "active",
            "avatar": user_name[:1].upper(),
            "createdAt": now_iso,
            "lastLogin": now_iso
        }
        res = users_col.insert_one(new_doc)
        user_id = str(res.inserted_id)
        user_doc = new_doc
        message = f"🙏 Sacred Welcome, {user_name}! Your account has been created."
    else:
        user_id = str(user_doc["_id"])
        users_col.update_one({"_id": user_doc["_id"]}, {"$set": {"lastLogin": now_iso, "status": "active"}})
        message = f"✨ Welcome back, {user_doc.get('fullName', 'Devotee')}!"

    user_obj = UserResponse(
        id=user_id,
        fullName=user_doc.get("fullName", "Devotee"),
        name=user_doc.get("fullName", "Devotee"),
        email=email,
        phone=user_doc.get("phone", ""),
        mobile=user_doc.get("mobile", user_doc.get("phone", "")),
        provider=user_doc.get("provider", "email"),
        status="active",
        avatar=user_doc.get("avatar", "D"),
        createdAt=user_doc.get("createdAt"),
        lastLogin=now_iso
    )
    token = create_jwt_token({"sub": user_id, "email": email, "name": user_obj.fullName})

    return AuthResponse(
        success=True,
        message=message,
        user=user_obj,
        token=token
    )


# ═══════════════════════════════════════════════════════════════
#  GOOGLE OAUTH AUTHENTICATION
# ═══════════════════════════════════════════════════════════════

# In-memory Google Auth store fallback: { email: { ... } }
pending_google_auth = {}

def _decode_google_token(credential: str = None, access_token: str = None, google_client_id: str = ""):
    user_info = None

    # 1. Access token (GIS token client)
    if access_token:
        try:
            import urllib.request
            import json
            req = urllib.request.Request(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            with urllib.request.urlopen(req, timeout=4) as response:
                payload = json.loads(response.read().decode('utf-8'))
                if payload and payload.get("email"):
                    user_info = {
                        "email": payload.get("email").lower(),
                        "name": payload.get("name", payload.get("email").split("@")[0]),
                        "picture": payload.get("picture", ""),
                        "sub": payload.get("sub", "")
                    }
        except Exception as e:
            logger.warning(f"[Google Verification] UserInfo request failed: {e}")

    # 2. Credential (ID token)
    if not user_info and credential:
        try:
            import urllib.request
            import json
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=4) as response:
                payload = json.loads(response.read().decode('utf-8'))
                if payload and payload.get("email"):
                    user_info = {
                        "email": payload.get("email").lower(),
                        "name": payload.get("name", payload.get("email").split("@")[0]),
                        "picture": payload.get("picture", ""),
                        "sub": payload.get("sub", "")
                    }
        except Exception as e:
            logger.warning(f"[Google Verification] Tokeninfo API request failed or timed out: {e}")

    # Safe local decode fallback
    if not user_info and credential:
        try:
            import base64
            import json
            parts = credential.split(".")
            if len(parts) >= 2:
                payload_b64 = parts[1] + "=" * (4 - len(parts[1]) % 4)
                payload = json.loads(base64.urlsafe_b64decode(payload_b64).decode('utf-8', errors='ignore'))
                if payload and payload.get("email"):
                    user_info = {
                        "email": payload.get("email").lower(),
                        "name": payload.get("name", payload.get("email").split("@")[0]),
                        "picture": payload.get("picture", ""),
                        "sub": payload.get("sub", "")
                    }
        except Exception as e:
            logger.error(f"[Google Verification] Local fallback decode failed: {e}")

    return user_info


@router.post("/google", response_model=GoogleAuthResponse)
@router.post("/google-send-otp", response_model=GoogleAuthResponse)
def google_auth(data: GoogleAuthRequest):
    """Verify Google token. If returning verified user -> log in immediately; else dispatch OTP."""
    user_info = _decode_google_token(data.credential, data.accessToken, settings.GOOGLE_CLIENT_ID)

    if not user_info or not user_info.get("email"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential. Please try again."
        )

    email = user_info["email"].lower().strip()
    display_name = user_info.get("name") or email.split("@")[0].title()
    users_col = get_collection("users")

    # Check if user is already registered and verified
    user_doc = users_col.find_one({"email": email})
    if user_doc and (user_doc.get("emailVerified") is True or user_doc.get("provider") == "google" or user_doc.get("authProvider") == "google" or user_doc.get("googleSub") or user_doc.get("googleId")):
        now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        updates = {"lastLogin": now_iso, "status": "active", "emailVerified": True}
        if user_info.get("picture") and (not user_doc.get("avatar") or len(str(user_doc.get("avatar"))) <= 2):
            updates["avatar"] = user_info["picture"]
        if user_info.get("sub") and not user_doc.get("googleSub"):
            updates["googleSub"] = user_info["sub"]
        users_col.update_one({"_id": user_doc["_id"]}, {"$set": updates})

        user_id = str(user_doc["_id"])
        user_obj = UserResponse(
            id=user_id,
            fullName=user_doc.get("fullName", display_name),
            name=user_doc.get("fullName", display_name),
            email=email,
            phone=user_doc.get("phone", ""),
            provider="google",
            status="active",
            avatar=user_info.get("picture", user_doc.get("avatar", "G")),
            createdAt=user_doc.get("createdAt"),
            lastLogin=now_iso
        )
        token = create_jwt_token({"sub": user_id, "email": email, "name": user_obj.fullName})

        return GoogleAuthResponse(
            success=True,
            requiresOtp=False,
            message=f"✨ Welcome back, {user_obj.fullName}!",
            user=user_obj,
            token=token
        )

    # First-time / Unverified Google account -> Generate 6-digit OTP & Save in MongoDB
    if not check_rate_limit(email):
        return GoogleAuthResponse(
            success=False,
            requiresOtp=True,
            message="Too many verification requests. Please wait before trying again.",
            cooldownSeconds=60
        )

    import uuid
    otp = generate_otp()
    temp_auth_token = str(uuid.uuid4())
    now = time.time()
    expires_at = now + 600 # 10 minutes

    # 1. Store in MongoDB `google_otps` collection
    otps_col = get_collection("google_otps")
    otp_doc = {
        "email": email,
        "name": display_name,
        "picture": user_info.get("picture", ""),
        "sub": user_info.get("sub", ""),
        "otp": str(otp).strip(),
        "tempAuthToken": temp_auth_token,
        "createdAt": now,
        "expiresAt": expires_at,
        "attempts": 0
    }
    otps_col.update_one({"email": email}, {"$set": otp_doc}, upsert=True)

    # 2. Store in memory fallback
    pending_google_auth[email] = dict(otp_doc)
    record_otp_request(email)

    result = send_otp_email(email, otp, user_name=display_name)
    if result["success"]:
        return GoogleAuthResponse(
            success=True,
            requiresOtp=True,
            email=email,
            tempAuthToken=temp_auth_token,
            message=f"Verification code sent to {email}. Please check your inbox.",
            cooldownSeconds=30
        )
    return GoogleAuthResponse(
        success=False,
        requiresOtp=True,
        email=email,
        message=result.get("error", "Failed to send verification code."),
        cooldownSeconds=10
    )


@router.post("/google-resend-otp", response_model=OTPResponse)
@router.post("/google/resend-otp", response_model=OTPResponse)
@router.post("/google-resend", response_model=OTPResponse)
def google_resend_otp(data: OTPRequest):
    """Resend OTP for Google authentication."""
    email = data.email.lower().strip()
    otps_col = get_collection("google_otps")
    pending = otps_col.find_one({"email": email}) or pending_google_auth.get(email)

    if not pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active Google authentication session found. Please sign in with Google again."
        )

    if not check_rate_limit(email):
        return OTPResponse(
            success=False,
            message="Too many verification requests. Please wait before trying again.",
            cooldownSeconds=60
        )

    otp = generate_otp()
    now = time.time()
    expires_at = now + 600

    otps_col.update_one(
        {"email": email},
        {"$set": {"otp": str(otp).strip(), "createdAt": now, "expiresAt": expires_at, "attempts": 0}},
        upsert=True
    )
    pending_google_auth[email] = {
        **pending,
        "otp": str(otp).strip(),
        "createdAt": now,
        "expiresAt": expires_at,
        "attempts": 0
    }
    record_otp_request(email)

    result = send_otp_email(email, otp, user_name=pending.get("name", "Devotee"))
    if result["success"]:
        return OTPResponse(
            success=True,
            message=f"New verification code sent to {email}. Please check your inbox.",
            cooldownSeconds=30
        )
    return OTPResponse(
        success=False,
        message=result.get("error", "Failed to resend verification code."),
        cooldownSeconds=10
    )


@router.post("/google-verify-otp", response_model=AuthResponse)
@router.post("/google/verify", response_model=AuthResponse)
@router.post("/google-verify", response_model=AuthResponse)
def google_verify_otp(data: GoogleOTPVerify):
    """Verify Google OTP, mark user verified in MongoDB, and create session."""
    email = data.email.lower().strip()
    otp = str(data.otp).strip()

    if len(otp) != 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter all 6 digits of your verification code."
        )

    otps_col = get_collection("google_otps")
    pending = otps_col.find_one({"email": email}) or pending_google_auth.get(email)

    if not pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending Google verification found for this email. Please sign in with Google again."
        )

    now = time.time()
    expires_at = pending.get("expiresAt", pending.get("createdAt", 0) + 600)
    if now > expires_at:
        otps_col.delete_one({"email": email})
        pending_google_auth.pop(email, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please sign in with Google again."
        )

    current_attempts = int(pending.get("attempts", 0))
    if current_attempts >= 5:
        otps_col.delete_one({"email": email})
        pending_google_auth.pop(email, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many incorrect attempts. Please sign in with Google again."
        )

    stored_otp = str(pending.get("otp", "")).strip()
    if stored_otp != otp:
        next_attempts = current_attempts + 1
        otps_col.update_one({"email": email}, {"$set": {"attempts": next_attempts}})
        if email in pending_google_auth:
            pending_google_auth[email]["attempts"] = next_attempts
        remaining = max(0, 5 - next_attempts)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid verification code. {remaining} attempt(s) remaining."
        )

    # Valid OTP -> Consume from MongoDB and memory
    otps_col.delete_one({"email": email})
    pending_google_auth.pop(email, None)

    users_col = get_collection("users")
    user_doc = users_col.find_one({"email": email})
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    if not user_doc:
        new_doc = {
            "fullName": pending.get("name") or email.split("@")[0].title(),
            "name": pending.get("name") or email.split("@")[0].title(),
            "username": email.split("@")[0].lower(),
            "email": email,
            "phone": "",
            "provider": "google",
            "authProvider": "google",
            "avatar": pending.get("picture", "") or "G",
            "googleSub": pending.get("sub", ""),
            "googleId": pending.get("sub", ""),
            "emailVerified": True,
            "status": "active",
            "createdAt": now_iso,
            "lastLogin": now_iso
        }
        res = users_col.insert_one(new_doc)
        user_id = str(res.inserted_id)
        user_doc = new_doc
    else:
        user_id = str(user_doc["_id"])
        updates = {
            "lastLogin": now_iso,
            "status": "active",
            "emailVerified": True,
            "provider": "google",
            "authProvider": "google"
        }
        if pending.get("picture") and (not user_doc.get("avatar") or len(str(user_doc.get("avatar"))) <= 2):
            updates["avatar"] = pending["picture"]
        if pending.get("sub"):
            updates["googleSub"] = pending["sub"]
            updates["googleId"] = pending["sub"]
        users_col.update_one({"_id": user_doc["_id"]}, {"$set": updates})
        user_doc.update(updates)

    user_obj = UserResponse(
        id=user_id,
        fullName=user_doc.get("fullName", "Devotee"),
        name=user_doc.get("fullName", "Devotee"),
        email=email,
        phone=user_doc.get("phone", ""),
        provider="google",
        status="active",
        avatar=user_doc.get("avatar", "G"),
        createdAt=user_doc.get("createdAt"),
        lastLogin=now_iso
    )
    token = create_jwt_token({"sub": user_id, "email": email, "name": user_obj.fullName})

    return AuthResponse(
        success=True,
        message="✨ Google account verified successfully!",
        user=user_obj,
        token=token
    )


@router.post("/logout")
def logout():
    """Invalidate session / logout endpoint."""
    return {"success": True, "message": "Logged out successfully."}

