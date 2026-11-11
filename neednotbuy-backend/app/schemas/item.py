# # 'c778fa7f-50eb-40d0-9350-8958f7efb448'
# from pydantic import BaseModel
# from typing import Optional
# from uuid import UUID


# class ItemCreate(BaseModel):
#     title: str
#     category: Optional[str] = None
#     description: Optional[str] = None

#     type: str

#     price: float = 0
#     deposit: float = 0

#     availability: bool = True

#     image_url: Optional[str] = None


# class ItemResponse(ItemCreate):
#     id: UUID


from pydantic import BaseModel
from typing import Optional


class ItemCreate(BaseModel):
    title: str
    category: Optional[str] = None
    description: Optional[str] = None
    type: str
    price: float = 0
    deposit: float = 0
    availability: bool = True
    image_url: Optional[str] = None


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    price: Optional[float] = None
    deposit: Optional[float] = None
    availability: Optional[bool] = None
    image_url: Optional[str] = None