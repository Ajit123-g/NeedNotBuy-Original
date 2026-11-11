import httpx

from fastapi import HTTPException

from app.core.config import settings


# ==========================================
# 1. GET PAYPAL ACCESS TOKEN
# ==========================================

async def get_access_token() -> str:

    url = f"{settings.paypal_base_url}/v1/oauth2/token"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:

            response = await client.post(
                url,

                auth=(
                    settings.paypal_client_id,
                    settings.paypal_client_secret
                ),

                data={
                    "grant_type": "client_credentials"
                },

                headers={
                    "Accept": "application/json",
                    "Accept-Language": "en_US"
                }
            )

            response.raise_for_status()

            data = response.json()

            return data["access_token"]

    except httpx.HTTPStatusError as exc:

        raise HTTPException(
            status_code=502,
            detail="PayPal authentication failed."
        ) from exc

    except httpx.RequestError as exc:

        raise HTTPException(
            status_code=503,
            detail="Unable to connect to PayPal."
        ) from exc


# ==========================================
# 2. CREATE PAYPAL ORDER
# ==========================================

async def create_paypal_order(
    amount: str,
    currency: str,
    booking_id: str
):

    access_token = await get_access_token()

    url = (
        f"{settings.paypal_base_url}"
        "/v2/checkout/orders"
    )

    payload = {
        "intent": "CAPTURE",

        "purchase_units": [
            {
                "reference_id": booking_id,

                "custom_id": booking_id,

                "amount": {
                    "currency_code": currency,
                    "value": amount
                }
            }
        ],

        "application_context": {
            "brand_name": "NeedNotBuy",

            "user_action": "PAY_NOW"
        }
    }

    headers = {
        "Authorization": f"Bearer {access_token}",

        "Content-Type": "application/json",

        "PayPal-Request-Id": f"neednotbuy-{booking_id}"
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:

            response = await client.post(
                url,
                json=payload,
                headers=headers
            )

            response.raise_for_status()

            return response.json()

    except httpx.HTTPStatusError as exc:

        raise HTTPException(
            status_code=502,
            detail="PayPal order creation failed."
        ) from exc

    except httpx.RequestError as exc:

        raise HTTPException(
            status_code=503,
            detail="Unable to connect to PayPal."
        ) from exc


# ==========================================
# 3. CAPTURE PAYPAL ORDER
# ==========================================

async def capture_paypal_order(
    order_id: str
):

    access_token = await get_access_token()

    url = (
        f"{settings.paypal_base_url}"
        f"/v2/checkout/orders/{order_id}/capture"
    )

    headers = {
        "Authorization": f"Bearer {access_token}",

        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:

            response = await client.post(
                url,
                headers=headers
            )

            response.raise_for_status()

            return response.json()

    except httpx.HTTPStatusError as exc:

        raise HTTPException(
            status_code=502,
            detail="PayPal payment capture failed."
        ) from exc

    except httpx.RequestError as exc:

        raise HTTPException(
            status_code=503,
            detail="Unable to connect to PayPal."
        ) from exc