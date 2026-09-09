import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductStatus,
    ProductUpdate,
)
from app.services.product_service import (
    DuplicateSKUError,
    ProductNotFoundError,
    ProductService,
)


router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)


@router.get(
    "",
    response_model=ProductListResponse,
)
def list_products(
    search: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
    ),
    status_filter: ProductStatus | None = Query(
        default=None,
        alias="status",
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    page_size: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * page_size

    products, total = ProductService.list_products(
        db,
        search=search,
        status=status_filter.value if status_filter else None,
        offset=offset,
        limit=page_size,
    )

    return {
        "items": products,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def get_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    try:
        return ProductService.get_product(
            db,
            product_id,
        )
    except ProductNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
):
    try:
        return ProductService.create_product(
            db,
            data,
        )
    except DuplicateSKUError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: uuid.UUID,
    data: ProductUpdate,
    db: Session = Depends(get_db),
):
    try:
        return ProductService.update_product(
            db,
            product_id,
            data,
        )
    except ProductNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except DuplicateSKUError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    try:
        ProductService.delete_product(
            db,
            product_id,
        )
    except ProductNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
