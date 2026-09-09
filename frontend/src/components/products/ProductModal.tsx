import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import {
  useCreateProduct,
  useUpdateProduct,
} from "../../hooks/useProducts";

import type { Product } from "../../types/product";

const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(150, "Product name must be 150 characters or less"),

  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(100, "SKU must be 100 characters or less"),

  price: z
    .string()
    .trim()
    .min(1, "Price is required")
    .refine(
      (value) => !Number.isNaN(Number(value)),
      "Price must be a valid number",
    )
    .refine(
      (value) => Number(value) >= 0,
      "Price cannot be negative",
    )
    .refine(
      (value) => /^\d+(\.\d{1,2})?$/.test(value),
      "Maximum 2 decimal places allowed",
    ),

  status: z.enum(["active", "inactive"]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const detail = error.response?.data?.detail;

    if (statusCode === 409) {
      return typeof detail === "string"
        ? detail
        : "This SKU already exists.";
    }

    if (statusCode === 422) {
      return "Please check the product details.";
    }

    if (typeof detail === "string") {
      return detail;
    }
  }

  return "Something went wrong. Please try again.";
}

export default function ProductModal({
  product,
  onClose,
  onSuccess,
}: ProductModalProps) {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const isEditing = Boolean(product);

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      price: product?.price ?? "",
      status: product?.status ?? "active",
    },
  });

  useEffect(() => {
    reset({
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      price: product?.price ?? "",
      status: product?.status ?? "active",
    });
  }, [product, reset]);

  const onSubmit = (data: ProductFormData) => {
    const payload = {
      name: data.name.trim(),
      sku: data.sku.trim(),
      price: Number(data.price),
      status: data.status,
    };

    if (product) {
      updateMutation.mutate(
        {
          id: product.id,
          payload,
        },
        {
          onSuccess: () => {
            onSuccess("Product updated successfully.");
          },
        },
      );

      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        onSuccess("Product created successfully.");
      },
    });
  };

  const mutationError =
    createMutation.error || updateMutation.error;

  return (
    <div
      className="modal-overlay"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="modal product-form-modal"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">
              {isEditing ? "UPDATE PRODUCT" : "NEW PRODUCT"}
            </p>

            <h2 id="product-modal-title">
              {isEditing ? "Edit Product" : "Add Product"}
            </h2>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <p className="modal-description">
          {isEditing
            ? "Update the product information below."
            : "Add a new product to your catalog."}
        </p>

        {mutationError && (
          <div className="form-error-banner" role="alert">
            {getApiErrorMessage(mutationError)}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="form-group">
            <label htmlFor="product-name">
              Product Name <span>*</span>
            </label>

            <input
              id="product-name"
              type="text"
              placeholder="e.g. MacBook Pro"
              {...register("name")}
              className={errors.name ? "input-error" : ""}
              disabled={isSubmitting}
              autoFocus
            />

            {errors.name && (
              <small className="field-error">
                {errors.name.message}
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="product-sku">
              SKU <span>*</span>
            </label>

            <input
              id="product-sku"
              type="text"
              placeholder="e.g. MBP-001"
              {...register("sku")}
              className={errors.sku ? "input-error" : ""}
              disabled={isSubmitting}
            />

            {errors.sku && (
              <small className="field-error">
                {errors.sku.message}
              </small>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="product-price">
                Price <span>*</span>
              </label>

              <div className="price-input">
                <span>₹</span>

                <input
                  id="product-price"
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...register("price")}
                  className={errors.price ? "input-error" : ""}
                  disabled={isSubmitting}
                />
              </div>

              {errors.price && (
                <small className="field-error">
                  {errors.price.message}
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="product-status">
                Status <span>*</span>
              </label>

              <select
                id="product-status"
                {...register("status")}
                disabled={isSubmitting}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="button-spinner" />

                  {isEditing
                    ? "Updating..."
                    : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
