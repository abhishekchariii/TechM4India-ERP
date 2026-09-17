import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './Inventory.css';

interface InventoryItem {
  id: number;
  name: string;
  description?: string | null;
  quantity?: number | null;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

interface InventoryForm {
  name: string;
  description: string;
  quantity: string;
  price: string;
}

const emptyForm: InventoryForm = {
  name: '',
  description: '',
  quantity: '',
  price: '',
};

function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [form, setForm] = useState<InventoryForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] =
    useState('');

  const handleApiError = (
    error: any,
    fallback: string,
  ) => {
    const status = error?.response?.status;

    if (status === 401) {
      alert(
        'Session expired. Please login again.',
      );

      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    if (status === 403) {
      alert(
        'You do not have permission to perform this action.',
      );
      return;
    }

    if (status === 409) {
      alert(
        error?.response?.data?.message ||
          'This record conflicts with existing data.',
      );
      return;
    }

    if (status === 400) {
      const message =
        error?.response?.data?.message;

      alert(
        Array.isArray(message)
          ? message.join('\n')
          : message ||
              'Please check the entered data.',
      );

      return;
    }

    alert(
      error?.response?.data?.message ||
        fallback,
    );
  };

  const loadItems = async () => {
    try {
      setLoading(true);

      const response =
        await api.get<InventoryItem[]>(
          '/inventory',
        );

      setItems(response.data);
    } catch (error: any) {
      handleApiError(
        error,
        'Failed to load inventory.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert('Item name is required.');
      return;
    }

    const quantity =
      form.quantity === ''
        ? undefined
        : Number(form.quantity);

    const price = Number(form.price);

    if (
      quantity !== undefined &&
      (!Number.isInteger(quantity) ||
        quantity < 0)
    ) {
      alert(
        'Quantity must be a whole number greater than or equal to 0.',
      );
      return;
    }

    if (
      form.price === '' ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      alert(
        'Price must be a number greater than or equal to 0.',
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      description:
        form.description.trim() || undefined,
      quantity,
      price,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.patch(
          `/inventory/${editingId}`,
          payload,
        );

        alert(
          'Inventory item updated successfully.',
        );
      } else {
        await api.post(
          '/inventory',
          payload,
        );

        alert(
          'Inventory item created successfully.',
        );
      }

      resetForm();
      await loadItems();
    } catch (error: any) {
      handleApiError(
        error,
        editingId !== null
          ? 'Failed to update inventory item.'
          : 'Failed to create inventory item.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (
    item: InventoryItem,
  ) => {
    setEditingId(item.id);

    setForm({
      name: item.name,
      description:
        item.description || '',
      quantity:
        item.quantity === null ||
        item.quantity === undefined
          ? ''
          : String(item.quantity),
      price: String(item.price),
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (
    id: number,
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this inventory item?',
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/inventory/${id}`,
      );

      alert(
        'Inventory item deleted successfully.',
      );

      if (editingId === id) {
        resetForm();
      }

      await loadItems();
    } catch (error: any) {
      handleApiError(
        error,
        'Failed to delete inventory item.',
      );
    }
  };

  const filteredItems = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return items.filter((item) => {
      const quantity =
        Number(item.quantity ?? 0);

      const matchesSearch =
        !searchValue ||
        item.name
          .toLowerCase()
          .includes(searchValue) ||
        item.description
          ?.toLowerCase()
          .includes(searchValue);

      let matchesStock = true;

      if (stockFilter === 'IN_STOCK') {
        matchesStock = quantity > 5;
      }

      if (stockFilter === 'LOW') {
        matchesStock =
          quantity > 0 && quantity <= 5;
      }

      if (stockFilter === 'OUT_OF_STOCK') {
        matchesStock = quantity === 0;
      }

      return (
        matchesSearch && matchesStock
      );
    });
  }, [
    items,
    search,
    stockFilter,
  ]);

  const totalUnits = items.reduce(
    (total, item) =>
      total + Number(item.quantity ?? 0),
    0,
  );

  const totalStockValue = items.reduce(
    (total, item) =>
      total +
      Number(item.quantity ?? 0) *
        Number(item.price),
    0,
  );

  const lowStockCount = items.filter(
    (item) => {
      const quantity =
        Number(item.quantity ?? 0);

      return quantity > 0 && quantity <= 5;
    },
  ).length;

  const outOfStockCount = items.filter(
    (item) =>
      Number(item.quantity ?? 0) === 0,
  ).length;

  const formatCurrency = (
    value: number,
  ) => {
    return `₹${value.toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
  };

  const clearFilters = () => {
    setSearch('');
    setStockFilter('');
  };

  const formQuantity =
    Number(form.quantity || 0);

  const formPrice =
    Number(form.price || 0);

  const formStockValue =
    Number.isFinite(formQuantity) &&
    Number.isFinite(formPrice)
      ? formQuantity * formPrice
      : 0;

  return (
    <div className="inventory-page">

      {/* HEADER */}
      <div className="inventory-header">
        <div>
          <h1>
            Inventory Management
          </h1>

          <p>
            Manage stock items,
            quantities and pricing.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            resetForm();

            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }}
        >
          + Add Item
        </button>
      </div>

      {/* SUMMARY */}
      <div className="inventory-summary">

        <div className="summary-card">
          <div className="summary-icon">
            📦
          </div>

          <div>
            <span>
              Total Items
            </span>

            <strong>
              {items.length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            🔢
          </div>

          <div>
            <span>
              Total Units
            </span>

            <strong>
              {totalUnits}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            ⚠️
          </div>

          <div>
            <span>
              Low Stock
            </span>

            <strong>
              {lowStockCount}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            💰
          </div>

          <div>
            <span>
              Stock Value
            </span>

            <strong>
              {formatCurrency(
                totalStockValue,
              )}
            </strong>
          </div>
        </div>

      </div>

      {/* FORM */}
      <div className="inventory-card">

        <div className="card-title">

          <div>
            <h2>
              {editingId !== null
                ? 'Edit Inventory Item'
                : 'Add Inventory Item'}
            </h2>

            <p>
              {editingId !== null
                ? 'Update the selected inventory item.'
                : 'Add a new item to your inventory.'}
            </p>
          </div>

          {editingId !== null && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}

        </div>

        <form
          className="inventory-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label htmlFor="name">
              Item Name *
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter item name"
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">
              Quantity
            </label>

            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={handleChange}
              placeholder="0"
            />

            <small>
              Optional. Defaults to 0
              when not provided.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="price">
              Price *
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Stock Value
            </label>

            <input
              type="text"
              value={formatCurrency(
                formStockValue,
              )}
              readOnly
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter item description"
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="form-actions">

            {editingId !== null && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Clear
              </button>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Item'
                  : 'Add Item'}
            </button>

          </div>

        </form>
      </div>

      {/* FILTERS */}
      <div className="inventory-card filters-card">

        <div className="filter-group search-group">
          <label htmlFor="inventory-search">
            Search
          </label>

          <input
            id="inventory-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search item or description..."
          />
        </div>

        <div className="filter-group">
          <label htmlFor="stock-filter">
            Stock Status
          </label>

          <select
            id="stock-filter"
            value={stockFilter}
            onChange={(event) =>
              setStockFilter(
                event.target.value,
              )
            }
          >
            <option value="">
              All Stock
            </option>

            <option value="IN_STOCK">
              In Stock
            </option>

            <option value="LOW">
              Low Stock
            </option>

            <option value="OUT_OF_STOCK">
              Out of Stock
            </option>
          </select>
        </div>

        <button
          type="button"
          className="secondary-button clear-filter-button"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

      </div>

      {/* TABLE */}
      <div className="inventory-card">

        <div className="card-title">

          <div>
            <h2>
              Inventory Items
            </h2>

            <p>
              Showing{' '}
              {filteredItems.length}{' '}
              of {items.length} items
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadItems}
          >
            ↻ Refresh
          </button>

        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>
              Loading inventory...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              📦
            </div>

            <h3>
              {items.length === 0
                ? 'No inventory items found'
                : 'No matching items'}
            </h3>

            <p>
              {items.length === 0
                ? 'Add your first inventory item above.'
                : 'Try changing your search or filters.'}
            </p>

            {items.length > 0 && (
              <button
                type="button"
                className="secondary-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (
          <div className="table-wrapper">

            <table className="inventory-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Stock Value</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredItems.map(
                  (item) => {
                    const quantity =
                      Number(
                        item.quantity ?? 0,
                      );

                    const price =
                      Number(item.price);

                    const stockValue =
                      quantity * price;

                    const isOutOfStock =
                      quantity === 0;

                    const isLowStock =
                      quantity > 0 &&
                      quantity <= 5;

                    return (
                      <tr
                        key={item.id}
                      >

                        <td>
                          <span className="item-id">
                            #{item.id}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {item.name}
                          </strong>
                        </td>

                        <td>
                          {item.description ? (
                            <span className="description-text">
                              {
                                item.description
                              }
                            </span>
                          ) : (
                            <span className="muted">
                              No description
                            </span>
                          )}
                        </td>

                        <td>
                          <strong>
                            {quantity}
                          </strong>
                        </td>

                        <td>
                          {formatCurrency(
                            price,
                          )}
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              stockValue,
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`stock-badge ${
                              isOutOfStock
                                ? 'out'
                                : isLowStock
                                  ? 'low'
                                  : 'good'
                            }`}
                          >
                            {isOutOfStock
                              ? 'Out of Stock'
                              : isLowStock
                                ? 'Low Stock'
                                : 'In Stock'}
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">

                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                handleEdit(
                                  item,
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                handleDelete(
                                  item.id,
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  },
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* OUT OF STOCK INFO */}
      {outOfStockCount > 0 && (
        <div className="inventory-alert">
          ⚠️ {outOfStockCount}{' '}
          item
          {outOfStockCount !== 1
            ? 's are'
            : ' is'}{' '}
          currently out of stock.
        </div>
      )}

    </div>
  );
}

export default Inventory;