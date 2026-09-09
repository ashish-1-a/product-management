import uuid

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_create_product():
    sku = f"TEST-{uuid.uuid4().hex[:8].upper()}"

    response = client.post(
        "/api/products",
        json={
            "name": "Test Product",
            "sku": sku,
            "price": 999.99,
            "status": "active",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Test Product"
    assert data["sku"] == sku
    assert data["price"] == "999.99"
    assert data["status"] == "active"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

    client.delete(f"/api/products/{data['id']}")


def test_get_product_not_found():
    product_id = uuid.uuid4()

    response = client.get(f"/api/products/{product_id}")

    assert response.status_code == 404


def test_create_product_invalid_price():
    sku = f"INVALID-{uuid.uuid4().hex[:8].upper()}"

    response = client.post(
        "/api/products",
        json={
            "name": "Invalid Product",
            "sku": sku,
            "price": -100,
            "status": "active",
        },
    )

    assert response.status_code == 422


def test_duplicate_sku():
    sku = f"DUP-{uuid.uuid4().hex[:8].upper()}"

    first_response = client.post(
        "/api/products",
        json={
            "name": "First Product",
            "sku": sku,
            "price": 100.00,
            "status": "active",
        },
    )

    assert first_response.status_code == 201

    product_id = first_response.json()["id"]

    second_response = client.post(
        "/api/products",
        json={
            "name": "Second Product",
            "sku": sku,
            "price": 200.00,
            "status": "active",
        },
    )

    assert second_response.status_code == 409

    client.delete(f"/api/products/{product_id}")


def test_update_product():
    sku = f"UPDATE-{uuid.uuid4().hex[:8].upper()}"

    create_response = client.post(
        "/api/products",
        json={
            "name": "Original Product",
            "sku": sku,
            "price": 100.00,
            "status": "active",
        },
    )

    assert create_response.status_code == 201

    product_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/products/{product_id}",
        json={
            "name": "Updated Product",
            "price": 150.00,
        },
    )

    assert update_response.status_code == 200

    data = update_response.json()

    assert data["name"] == "Updated Product"
    assert data["price"] == "150.00"
    assert data["sku"] == sku

    client.delete(f"/api/products/{product_id}")


def test_delete_product():
    sku = f"DELETE-{uuid.uuid4().hex[:8].upper()}"

    create_response = client.post(
        "/api/products",
        json={
            "name": "Delete Product",
            "sku": sku,
            "price": 500.00,
            "status": "active",
        },
    )

    assert create_response.status_code == 201

    product_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/products/{product_id}")

    assert delete_response.status_code == 204

    get_response = client.get(f"/api/products/{product_id}")

    assert get_response.status_code == 404




def test_list_products_pagination():
    product_ids = []

    for index in range(3):
        response = client.post(
            "/api/products",
            json={
                "name": f"Pagination Product {index}",
                "sku": f"PAGE-{uuid.uuid4().hex[:8].upper()}",
                "price": 100.00 + index,
                "status": "active",
            },
        )

        assert response.status_code == 201
        product_ids.append(response.json()["id"])

    response = client.get(
        "/api/products?page=1&page_size=2"
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data["items"]) == 2
    assert data["total"] >= 3
    assert data["page"] == 1
    assert data["page_size"] == 2

    for product_id in product_ids:
        client.delete(f"/api/products/{product_id}")


def test_list_products_search():
    unique_value = uuid.uuid4().hex[:8].upper()

    response = client.post(
        "/api/products",
        json={
            "name": f"Searchable {unique_value}",
            "sku": f"SEARCH-{unique_value}",
            "price": 250.00,
            "status": "active",
        },
    )

    assert response.status_code == 201

    product_id = response.json()["id"]

    response = client.get(
        f"/api/products?search={unique_value}"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] >= 1
    assert len(data["items"]) >= 1
    assert any(
        product["sku"] == f"SEARCH-{unique_value}"
        for product in data["items"]
    )

    client.delete(f"/api/products/{product_id}")


def test_list_products_status_filter():
    active_sku = f"ACTIVE-{uuid.uuid4().hex[:8].upper()}"
    inactive_sku = f"INACTIVE-{uuid.uuid4().hex[:8].upper()}"

    active_response = client.post(
        "/api/products",
        json={
            "name": "Active Filter Product",
            "sku": active_sku,
            "price": 100.00,
            "status": "active",
        },
    )

    inactive_response = client.post(
        "/api/products",
        json={
            "name": "Inactive Filter Product",
            "sku": inactive_sku,
            "price": 200.00,
            "status": "inactive",
        },
    )

    assert active_response.status_code == 201
    assert inactive_response.status_code == 201

    active_id = active_response.json()["id"]
    inactive_id = inactive_response.json()["id"]

    response = client.get(
        "/api/products?status=active"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] >= 1

    for product in data["items"]:
        assert product["status"] == "active"

    assert any(
        product["sku"] == active_sku
        for product in data["items"]
    )

    assert not any(
        product["sku"] == inactive_sku
        for product in data["items"]
    )

    client.delete(f"/api/products/{active_id}")
    client.delete(f"/api/products/{inactive_id}")
