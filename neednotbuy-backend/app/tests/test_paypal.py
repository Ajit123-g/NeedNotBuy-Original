import asyncio

from app.services.paypal_service import get_access_token


async def main():

    token = await get_access_token()

    print("PayPal authentication successful!")

    print("Token received:", bool(token))


if __name__ == "__main__":
    asyncio.run(main())