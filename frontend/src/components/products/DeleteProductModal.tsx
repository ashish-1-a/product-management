import type { Product } from "../../types/product";

interface DeleteProductModalProps {
  product: Product | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteProductModal({
  product,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteProductModalProps) {
  if (!product) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="delete-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="delete-icon">!</div>

        <div className="delete-content">
          <h2 id="delete-modal-title">Delete product?</h2>

          <p>
            Are you sure you want to delete{" "}
            <strong>{product.name}</strong>?
          </p>

          <span>This action cannot be undone.</span>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="button-spinner danger-spinner" />
                Deleting...
              </>
            ) : (
              "Delete Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
