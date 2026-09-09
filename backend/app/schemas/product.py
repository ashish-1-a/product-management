import uuid
from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class ProductBase(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="Product name",
    )
    sku: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Unique product SKU",
    )
    price: Decimal = Field(
        ...,
        ge=0,
        decimal_places=2,
        max_digits=12,
        description="Product price",
    )
    status: ProductStatus = Field(
        default=ProductStatus.ACTIVE,
        description="Product status",
    )


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    sku: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    price: Decimal | None = Field(
        default=None,
        ge=0,
        decimal_places=2,
        max_digits=12,
    )
    status: ProductStatus | None = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
