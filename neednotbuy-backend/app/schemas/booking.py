from pydantic import BaseModel
from uuid import UUID
from datetime import date

class BookingCreate(BaseModel):
    item_id: UUID
    start_date: date
    end_date: date