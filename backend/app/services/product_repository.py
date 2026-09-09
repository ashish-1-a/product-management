import uuid
from decimal import Decimal

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.db.models import Product


class ProductRepository:

    @staticmethod
    def get_all(
        db: Session,
        *,
        search: str | None = None,
        status: str | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Product], int]:

        query = select(Product)

        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Product.name.ilike(search_pattern),
                    Product.sku.ilike(search_pattern),
                )
            )

        if status:
            query = query.where(Product.status == status)

        count_query = select(func.count()).select_from(query.subquery())
        total = db.scalar(count_query) or 0

        query = (
            query
            .order_by(Product.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        products = list(db.scalars(query).all())

        return products, total

    @staticmethod
    def get_by_id(
        db: Session,
        product_id: uuid.UUID,
    ) -> Product | None:
        return db.get(Product, product_id)

    @staticmethod
    def get_by_sku(
        db: Session,
        sku: str,
    ) -> Product | None:
        query = select(Product).where(Product.sku == sku)
        return db.scalar(query)

    @staticmethod
    def create(
        db: Session,
        *,
        name: str,
        sku: str,
        price: Decimal,
        status: str,
    ) -> Product:

        product = Product(
            name=name,
            sku=sku,
            price=price,
            status=status,
        )

        db.add(product)
        db.flush()
        db.refresh(product)

        return product

    @staticmethod
    def update(
        db: Session,
        product: Product,
        data: dict,
    ) -> Product:

        for field, value in data.items():
            setattr(product, field, value)

        db.flush()
        db.refresh(product)

        return product

    @staticmethod
    def delete(
        db: Session,
        product: Product,
    ) -> None:

        db.delete(product)
        db.flush()
