from fastapi import APIRouter

from app.api import ai, items, bookings, payments

api_router = APIRouter()

api_router.include_router(ai.router)
api_router.include_router(items.router)
api_router.include_router(bookings.router)
api_router.include_router(payments.router)
