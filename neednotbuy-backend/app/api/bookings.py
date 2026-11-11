from fastapi import APIRouter, HTTPException, Header
from typing import Optional

from app.database.supabase_client import supabase
from app.schemas.booking import BookingCreate


router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"]
)


def get_user_id_from_token(authorization: Optional[str]) -> str:
    """Extract user_id from the Supabase Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authorization token is required"
        )

    token = authorization.split(" ", 1)[1]

    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token"
            )
        return str(user_response.user.id)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials"
        )


@router.post("/", status_code=201)
def create_booking(
    booking: BookingCreate,
    authorization: Optional[str] = Header(None),
):
    """Create a new booking for an item."""

    # Extract authenticated user
    user_id = get_user_id_from_token(authorization)

    # Step 1: Verify item exists
    item_response = (
        supabase
        .table("items")
        .select("*")
        .eq("id", str(booking.item_id))
        .execute()
    )

    if not item_response.data:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    item = item_response.data[0]

    # Step 2: Check availability
    if not item["availability"]:
        raise HTTPException(
            status_code=400,
            detail="Item is not available"
        )

    # Step 3: Validate dates
    if booking.end_date <= booking.start_date:
        raise HTTPException(
            status_code=400,
            detail="End date must be after start date"
        )

    # Step 4: Calculate duration and total amount
    duration_days = (booking.end_date - booking.start_date).days
    total_amount = float(item["price"] or 0) * duration_days

    # Step 5: Insert booking record
    booking_data = {
        "user_id": user_id,
        "item_id": str(booking.item_id),
        "start_date": booking.start_date.isoformat(),
        "end_date": booking.end_date.isoformat(),
        "total_amount": total_amount,
        "status": "pending",
        "payment_status": "pending",
    }

    response = (
        supabase
        .table("bookings")
        .insert(booking_data)
        .execute()
    )

    return response.data[0]


@router.get("/my")
def get_my_bookings(authorization: Optional[str] = Header(None)):
    """Get all bookings for the currently authenticated user."""

    user_id = get_user_id_from_token(authorization)

    response = (
        supabase
        .table("bookings")
        .select("*, items(*)")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return response.data


@router.get("/user/{user_id}")
def get_user_bookings(user_id: str):
    """Get all bookings for a specific user (admin use)."""

    response = (
        supabase
        .table("bookings")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    return response.data


@router.get("/{booking_id}")
def get_booking(booking_id: str):
    """Get a single booking by ID."""

    response = (
        supabase
        .table("bookings")
        .select("*")
        .eq("id", booking_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    return response.data[0]
