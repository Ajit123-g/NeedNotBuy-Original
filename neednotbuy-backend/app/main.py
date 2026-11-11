from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.ai import router as ai_router
from app.api.items import router as items_router
from app.api.bookings import router as bookings_router
from app.api.payments import router as payments_router


app = FastAPI(
    title="NeedNotBuy API",
    version="1.0.0",
    description="AI-powered platform to find smarter alternatives before purchasing."
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(ai_router)
app.include_router(items_router)
app.include_router(bookings_router)
app.include_router(payments_router)


@app.get("/")
async def root():
    return {"message": "NeedNotBuy backend is running"}
