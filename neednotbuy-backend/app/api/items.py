from fastapi import APIRouter, HTTPException

from app.database.supabase_client import supabase
from app.schemas.item import ItemCreate, ItemUpdate


router = APIRouter(
    prefix="/api/items",
    tags=["Items"]
)


# CREATE
@router.post("/", status_code=201)
def create_item(item: ItemCreate):

    response = (
        supabase
        .table("items")
        .insert(item.model_dump())
        .execute()
    )

    return response.data[0]


# GET ALL
@router.get("/")
def get_items():

    response = (
        supabase
        .table("items")
        .select("*")
        .execute()
    )

    return response.data


# SEARCH
@router.get("/search")
def search_items(q: str):

    response = (
        supabase
        .table("items")
        .select("*")
        .ilike("title", f"%{q}%")
        .execute()
    )

    return response.data


# GET ONE
@router.get("/{item_id}")
def get_item(item_id: str):

    response = (
        supabase
        .table("items")
        .select("*")
        .eq("id", item_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    return response.data[0]


# UPDATE
@router.put("/{item_id}")
def update_item(item_id: str, item: ItemUpdate):

    update_data = item.model_dump(
        exclude_unset=True
    )

    response = (
        supabase
        .table("items")
        .update(update_data)
        .eq("id", item_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    return response.data[0]


# DELETE
@router.delete("/{item_id}")
def delete_item(item_id: str):

    response = (
        supabase
        .table("items")
        .delete()
        .eq("id", item_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )

    return {
        "message": "Item deleted successfully"
    }