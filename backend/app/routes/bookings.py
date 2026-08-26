import time
import random
from fastapi import APIRouter, HTTPException, status
from app.schemas.booking import BookingCreate, BookingSubmitResponse, BookingResponse
from app.database import get_collection
from typing import List

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

def generate_booking_ref() -> str:
    random_num = random.randint(1000, 9999)
    return f"DJ-2026-{random_num}"

@router.post("", response_model=BookingSubmitResponse)
def create_booking(payload: BookingCreate):
    bookings_col = get_collection("bookings")
    
    ref_num = generate_booking_ref()
    created_time = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    
    booking_doc = {
        "refNumber": ref_num,
        "templeName": payload.templeName or "Meenakshi Amman Temple",
        "serviceType": payload.serviceType or "VIP Special Priority Darshan",
        "bookingType": payload.bookingType or "Priority Darshan",
        "bookingDate": payload.bookingDate or "2026-08-15",
        "timeSlot": payload.timeSlot or "Morning (07:00 AM)",
        "devoteesCount": payload.devoteesCount or 1,
        "devoteeName": payload.devoteeName,
        "devoteeEmail": payload.devoteeEmail or "devotee@example.com",
        "devoteePhone": payload.devoteePhone or "+91 98765 43210",
        "requirements": payload.requirements or [],
        "specialNotes": payload.specialNotes or "",
        "totalAmount": payload.totalAmount or 501,
        "status": "CONFIRMED",
        "createdAt": created_time
    }
    
    # Store directly in MongoDB Atlas `bookings` collection
    result = bookings_col.insert_one(booking_doc)
    booking_id = str(result.inserted_id)

    response_obj = BookingResponse(
        id=booking_id,
        refNumber=ref_num,
        templeName=booking_doc["templeName"],
        serviceType=booking_doc["serviceType"],
        bookingDate=booking_doc["bookingDate"],
        timeSlot=booking_doc["timeSlot"],
        devoteesCount=booking_doc["devoteesCount"],
        devoteeName=booking_doc["devoteeName"],
        devoteeEmail=booking_doc["devoteeEmail"],
        devoteePhone=booking_doc["devoteePhone"],
        totalAmount=booking_doc["totalAmount"],
        status="CONFIRMED",
        createdAt=created_time
    )

    return BookingSubmitResponse(
        success=True,
        message=f"🙏 Sacred Booking confirmed! Reference: {ref_num}",
        booking=response_obj
    )

@router.get("", response_model=List[BookingResponse])
def list_bookings():
    bookings_col = get_collection("bookings")
    docs = list(bookings_col.find().sort("createdAt", -1))
    
    output = []
    for d in docs:
        output.append(BookingResponse(
            id=str(d.get("_id")),
            refNumber=d.get("refNumber", "DJ-2026-0000"),
            templeName=d.get("templeName", "Temple Shrines"),
            serviceType=d.get("serviceType", "Priority Darshan"),
            bookingDate=d.get("bookingDate", ""),
            timeSlot=d.get("timeSlot", ""),
            devoteesCount=d.get("devoteesCount", 1),
            devoteeName=d.get("devoteeName", "Devotee"),
            devoteeEmail=d.get("devoteeEmail"),
            devoteePhone=d.get("devoteePhone"),
            totalAmount=d.get("totalAmount", 501),
            status=d.get("status", "CONFIRMED"),
            createdAt=d.get("createdAt", "")
        ))
    return output

@router.get("/{booking_id}/verify", response_model=dict)
def verify_booking(booking_id: str):
    bookings_col = get_collection("bookings")
    from bson.objectid import ObjectId
    try:
        doc = bookings_col.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        doc = bookings_col.find_one({"refNumber": booking_id})
        
    if not doc:
        raise HTTPException(status_code=404, detail="Booking reference not found.")
        
    return {
        "success": True,
        "verified": True,
        "booking": {
            "id": str(doc["_id"]),
            "refNumber": doc.get("refNumber"),
            "status": doc.get("status", "CONFIRMED"),
            "templeName": doc.get("templeName"),
            "devoteeName": doc.get("devoteeName")
        }
    }
