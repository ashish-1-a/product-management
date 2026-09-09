import { useMemo, useState } from "react";
import {
  useDeleteProduct,
  useProducts,
} from "./hooks/useProducts";

import type { Product } from "./types/product";

import ProductModal from "./components/products/ProductModal";
import DeleteProductModal from "./components/products/DeleteProductModal";

import "./index.css";

function App() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "" | "active" | "inactive"
  >("");

  const [page, setPage] = useState(1);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [deleteProduct, setDeleteProduct] =
    useState<Product | null>(null);

  const [showModal, setShowModal] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const params = {
    search: search.trim() || undefined,
    status: status || undefined,
    page,
    page_size: 20,
  };

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useProducts(params);

  const deleteMutation = useDeleteProduct();

  const products = data?.items ?? [];

  const stats = useMemo(() => {
    const active = products.filter(
      (product) => product.status === "active",
    ).length;

    const inactive = products.filter(
      (product) => product.status === "inactive",
    ).length;

    const value = products.reduce(
      (sum, product) => sum + Number(product.price),
      0,
    );

    return {
      total: data?.total ?? 0,
      active,
      inactive,
      value,
    };
  }, [products, data?.total]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseProductModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeleteProduct(product);
  };

  const handleConfirmDelete = () => {
    if (!deleteProduct) {
      return;
    }

    deleteMutation.mutate(deleteProduct.id, {
      onSuccess: () => {
        setDeleteProduct(null);
        showSuccessMessage("Product deleted successfully.");
      },
    });
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setStatus(
      event.target.value as "" | "active" | "inactive",
    );

    setPage(1);
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">P</div>

          <div>
            <strong>ProductHub</strong>
            <span>Management</span>
          </div>
        </div>

        <nav>
          <div className="nav-item active">
            <span>▦</span>
            Dashboard
          </div>

          <div className="nav-item">
            <span>◫</span>
            Products
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" />
          API Connected
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PRODUCT MANAGEMENT</p>

            <h1>Dashboard</h1>

            <p className="subtitle">
              Manage your product catalog from one place.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={handleAddProduct}
          >
            <span>+</span>
            Add Product
          </button>
        </header>

        {/* Success Toast */}
        {successMessage && (
          <div
            className="success-toast"
            role="status"
            aria-live="polite"
          >
            <div className="toast-icon">✓</div>

            <div>
              <strong>Success</strong>
              <span>{successMessage}</span>
            </div>

            <button
              type="button"
              onClick={() => setSuccessMessage("")}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}

        {/* Stats */}
        <section className="stats-grid">
          <StatCard
            label="Total Products"
            value={stats.total}
            icon="◈"
            description="Products in catalog"
          />

          <StatCard
            label="Active Products"
            value={stats.active}
            icon="✓"
            description="Currently active"
            positive
          />

          <StatCard
            label="Inactive Products"
            value={stats.inactive}
            icon="◌"
            description="Currently inactive"
          />

          <StatCard
            label="Catalog Value"
            value={`₹${stats.value.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}`}
            icon="₹"
            description="Current page value"
          />
        </section>

        {/* Products */}
        <section className="content-card">
          <div className="card-header">
            <div>
              <h2>Products</h2>

              <p>
                View and manage your product inventory.
              </p>
            </div>

            {isFetching && !isLoading && (
              <span className="refresh-indicator">
                Updating...
              </span>
            )}
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={search}
                onChange={handleSearchChange}
                aria-label="Search products"
              />
            </div>

            <select
              value={status}
              onChange={handleStatusChange}
              aria-label="Filter products by status"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="state-box">
              <div className="spinner" />

              <span>Loading products...</span>
            </div>
          ) : isError ? (
            /* Error */
            <div className="state-box error-state">
              <div className="empty-icon">!</div>

              <h3>Unable to load products</h3>

              <p>
                Please check the API connection and try again.
              </p>
            </div>
          ) : products.length === 0 ? (
            /* Empty */
            <div className="state-box">
              <div className="empty-icon">◇</div>

              <h3>No products found</h3>

              <p>
                {search || status
                  ? "Try changing your search or status filter."
                  : "Add your first product to get started."}
              </p>

              {!search && !status && (
                <button
                  type="button"
                  className="primary-button empty-action"
                  onClick={handleAddProduct}
                >
                  <span>+</span>
                  Add Product
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>SKU</th>
                      <th>PRICE</th>
                      <th>STATUS</th>
                      <th className="actions-column">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <div className="product-avatar">
                              {product.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {product.name}
                              </strong>

                              <small>
                                Added{" "}
                                {new Date(
                                  product.created_at,
                                ).toLocaleDateString(
                                  "en-IN",
                                )}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="sku">
                            {product.sku}
                          </span>
                        </td>

                        <td>
                          <strong>
                            ₹
                            {Number(
                              product.price,
                            ).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`badge ${product.status}`}
                          >
                            <span />
                            {product.status}
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="icon-button"
                              title="Edit product"
                              aria-label={`Edit ${product.name}`}
                              onClick={() =>
                                handleEditProduct(product)
                              }
                            >
                              ✎
                            </button>

                            <button
                              type="button"
                              className="icon-button danger"
                              title="Delete product"
                              aria-label={`Delete ${product.name}`}
                              disabled={
                                deleteMutation.isPending
                              }
                              onClick={() =>
                                handleDeleteProduct(
                                  product,
                                )
                              }
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <span>
                  Showing {products.length} of{" "}
                  {data?.total ?? 0} products
                </span>

                <div>
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                      setPage(
                        (current) => current - 1,
                      )
                    }
                  >
                    Previous
                  </button>

                  <span className="page-number">
                    {page}
                  </span>

                  <button
                    type="button"
                    disabled={
                      products.length < 20 ||
                      page * 20 >=
                        (data?.total ?? 0)
                    }
                    onClick={() =>
                      setPage(
                        (current) => current + 1,
                      )
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Add / Edit */}
      {showModal && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseProductModal}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteProductModal
        product={deleteProduct}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function handleModalSuccess(
  message: string,
) {
  // This function is replaced below through the wrapper.
  console.log(message);
}

function StatCard({
  label,
  value,
  icon,
  description,
  positive = false,
}: {
  label: string;
  value: string | number;
  icon: string;
  description: string;
  positive?: boolean;
}) {
  return (
    <div className="stat-card">
      <div
        className={`stat-icon ${
          positive ? "positive" : ""
        }`}
      >
        {icon}
      </div>

      <div>
        <p>{label}</p>

        <h3>{value}</h3>

        <small>{description}</small>
      </div>
    </div>
  );
}

export default App;
