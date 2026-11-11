from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    supabase_url: str
    supabase_key: str

    MISTRAL_API_KEY: str

    paypal_client_id: str
    paypal_client_secret: str
    paypal_base_url: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )


settings = Settings()