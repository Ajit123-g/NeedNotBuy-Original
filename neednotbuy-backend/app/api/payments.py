from fastapi import APIRouter, HTTPException

from app.database.supabase_client import supabase
from app.schemas.payment import CreateOrderRequest
from app.services.paypal_service import (
    create_paypal_order,
    capture_paypal_order,
)


router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


@router.post("/create-order")
async def create_order(request: CreateOrderRequest):
    """Create a PayPal order for a pending booking."""

    # STEP 1: Get booking from Supabase
    booking_response = (
        supabase
        .table("bookings")
        .select("*")
        .eq("id", str(request.booking_id))
        .execute()
    )

    if not booking_response.data:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    booking = booking_response.data[0]

    # STEP 2: Validate booking status
    if booking["status"] != "pending":
        raise HTTPException(
            status_code=400,
            detail="Booking is not in pending status"
        )

    if booking["payment_status"] == "completed":
        raise HTTPException(
            status_code=400,
            detail="Booking is already paid"
        )

    # STEP 3: Create PayPal order
    amount = str(round(float(booking["total_amount"]), 2))

    paypal_order = await create_paypal_order(
        amount=amount,
        currency="USD",
        booking_id=str(request.booking_id)
    )

    order_id = paypal_order["id"]

    # STEP 4: Save payment record in Supabase
    payment_data = {
        "booking_id": str(request.booking_id),
        "paypal_order_id": order_id,
        "amount": amount,
        "currency": "USD",
        "status": "created",
    }

    supabase.table("payments").insert(payment_data).execute()

    # STEP 5: Return order info to frontend
    approval_url = next(
        (
            link["href"]
            for link in paypal_order.get("links", [])
            if link["rel"] == "approve"
        ),
        None,
    )

    return {
        "message": "PayPal order created successfully",
        "paypal_order_id": order_id,
        "approval_url": approval_url,
    }


@router.post("/capture-order/{order_id}")
async def capture_order(order_id: str):
    """Capture a PayPal payment and confirm the booking."""

    # STEP 1: Find payment record
    payment_response = (
        supabase
        .table("payments")
        .select("*")
        .eq("paypal_order_id", order_id)
        .execute()
    )

    if not payment_response.data:
        raise HTTPException(
            status_code=404,
            detail="Payment record not found"
        )

    payment = payment_response.data[0]

    if payment["status"] == "completed":
        raise HTTPException(
            status_code=400,
            detail="Payment already completed"
        )

    # STEP 2: Capture payment through PayPal
    paypal_response = await capture_paypal_order(order_id)

    if paypal_response.get("status") != "COMPLETED":
        raise HTTPException(
            status_code=400,
            detail="PayPal payment capture was not completed"
        )

    # STEP 3: Update payment status
    supabase.table("payments").update(
        {"status": "completed"}
    ).eq("paypal_order_id", order_id).execute()

    # STEP 4: Update booking status
    supabase.table("bookings").update({
        "status": "confirmed",
        "payment_status": "completed",
    }).eq("id", payment["booking_id"]).execute()

    return {
        "message": "Payment completed successfully",
        "order_id": order_id,
        "booking_id": payment["booking_id"],
        "payment_status": "completed",
        "booking_status": "confirmed",
    }
