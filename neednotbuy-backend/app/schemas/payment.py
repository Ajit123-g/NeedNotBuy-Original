from pydantic import BaseModel
from uuid import UUID


class CreateOrderRequest(BaseModel):
    """Request body sent from the frontend to create a PayPal order."""
    booking_id: UUID


class CreateOrderResponse(BaseModel):
    """Response returned after creating a PayPal order."""
    booking_id: UUID
    paypal_order_id: str
    status: str
