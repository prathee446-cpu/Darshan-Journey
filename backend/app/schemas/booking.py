from pydantic import BaseModel, Field
from typing import Optional, List, Any

class BookingCreate(BaseModel):
    templeName: Optional[str] = "Meenakshi Amman Temple"
    templeId: Optional[str] = None
    serviceType: Optional[str] = "VIP Special Priority Darshan"
    bookingType: Optional[str] = "Priority Darshan"
    bookingDate: Optional[str] = "2026-08-15"
    timeSlot: Optional[str] = "Morning (07:00 AM)"
    devoteesCount: Optional[int] = 1
    devoteeName: str = Field(..., example="Ramanathan")
    devoteeEmail: Optional[str] = "devotee@example.com"
    devoteePhone: Optional[str] = "+91 98765 43210"
    requirements: Optional[List[str]] = []
    specialNotes: Optional[str] = ""
    totalAmount: Optional[Any] = 501

class BookingResponse(BaseModel):
    id: str
    refNumber: str
    templeName: str
    serviceType: str
    bookingDate: str
    timeSlot: str
    devoteesCount: int
    devoteeName: str
    devoteeEmail: Optional[str] = None
    devoteePhone: Optional[str] = None
    totalAmount: Any
    status: str = "CONFIRMED"
    createdAt: str

class BookingSubmitResponse(BaseModel):
    success: bool = True
    message: str = "Booking confirmed successfully!"
    booking: BookingResponse
