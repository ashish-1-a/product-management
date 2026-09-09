import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.models import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.product_repository import ProductRepository


class ProductNotFoundError(Exception):
    pass


class DuplicateSKUError(Exception):
    pass


class ProductService:

    @staticmethod
    def list_products(
        db: Session,
        *,
        search: str | None = None,
        status: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Product], int]:
        return ProductRepository.get_all(
            db,
            search=search,
            status=status,
            offset=offset,
            limit=limit,
        )

    @staticmethod
    def get_product(
        db: Session,
        product_id: uuid.UUID,
    ) -> Product:

        product = ProductRepository.get_by_id(db, product_id)

        if product is None:
            raise ProductNotFoundError(
                f"Product {product_id} not found"
            )

        return product

    @staticmethod
    def create_product(
        db: Session,
        data: ProductCreate,
    ) -> Product:

        existing_product = ProductRepository.get_by_sku(
            db,
            data.sku,
        )

        if existing_product:
            raise DuplicateSKUError(
                f"SKU '{data.sku}' already exists"
            )

        product = ProductRepository.create(
            db,
            name=data.name,
            sku=data.sku,
            price=data.price,
            status=data.status.value,
        )

        try:
            db.commit()
            db.refresh(product)
        except IntegrityError:
            db.rollback()
            raise DuplicateSKUError(
                f"SKU '{data.sku}' already exists"
            )

        return product

    @staticmethod
    def update_product(
        db: Session,
        product_id: uuid.UUID,
        data: ProductUpdate,
    ) -> Product:

        product = ProductService.get_product(
            db,
            product_id,
        )

        update_data = data.model_dump(
            exclude_unset=True,
            exclude_none=True,
        )

        if "sku" in update_data:
            existing_product = ProductRepository.get_by_sku(
                db,
                update_data["sku"],
            )

            if (
                existing_product
                and existing_product.id != product_id
            ):
                raise DuplicateSKUError(
                    f"SKU '{update_data['sku']}' already exists"
                )

        if "status" in update_data:
            update_data["status"] = update_data["status"].value

        ProductRepository.update(
            db,
            product,
            update_data,
        )

        try:
            db.commit()
            db.refresh(product)
        except IntegrityError:
            db.rollback()
            raise DuplicateSKUError(
                f"SKU '{update_data.get('sku', product.sku)}' already exists"
            )

        return product

    @staticmethod
    def delete_product(
        db: Session,
        product_id: uuid.UUID,
    ) -> None:

        product = ProductService.get_product(
            db,
            product_id,
        )

        ProductRepository.delete(
            db,
            product,
        )

        db.commit()
