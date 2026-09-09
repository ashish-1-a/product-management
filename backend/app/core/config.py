from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Product Management API"
    app_env: str = "development"
    app_debug: bool = False

    postgres_db: str = Field(default="product_db")
    postgres_user: str = Field(default="product_app")
    postgres_password: str = Field(default="change_this_password")
    postgres_host: str = Field(default="localhost")
    postgres_port: int = Field(default=5432)

    database_url: str = Field(
        default="postgresql+psycopg://product_app:change_this_password@localhost:5432/product_db"
    )

    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
