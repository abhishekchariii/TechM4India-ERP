import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './Assets.css';

interface Asset {
  id: number;
  name: string;
  description?: string | null;
  category: string;
  serialNumber?: string | null;
  value: number;
  status?: string | null;
  location?: string | null;
  purchaseDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AssetForm {
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  value: string;
  status: string;
  location: string;
  purchaseDate: string;
}

const emptyForm: AssetForm = {
  name: '',
  description: '',
  category: '',
  serialNumber: '',
  value: '',
  status: 'AVAILABLE',
  location: '',
  purchaseDate: '',
};

const statusOptions = [
  'AVAILABLE',
  'ASSIGNED',
  'MAINTENANCE',
  'LOST',
  'RETIRED',
];

function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [form, setForm] = useState<AssetForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState('');
  const [categoryFilter, setCategoryFilter] =
    useState('');

  const handleError = (
    error: any,
    message: string,
  ) => {
    const status =
      error?.response?.status;

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

    const backendMessage =
      error?.response?.data?.message;

    if (Array.isArray(backendMessage)) {
      alert(backendMessage.join('\n'));
      return;
    }

    alert(
      backendMessage || message,
    );
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const response =
        await api.get<Asset[]>(
          '/assets',
        );

      setAssets(response.data);
    } catch (error: any) {
      handleError(
        error,
        'Failed to load assets.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >,
  ) => {
    const { name, value } =
      e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert('Asset name is required.');
      return;
    }

    if (!form.category.trim()) {
      alert('Category is required.');
      return;
    }

    if (form.value === '') {
      alert('Asset value is required.');
      return;
    }

    const numericValue =
      Number(form.value);

    if (
      !Number.isFinite(numericValue) ||
      numericValue < 0
    ) {
      alert(
        'Asset value must be a valid number greater than or equal to 0.',
      );
      return;
    }

    const payload = {
      name: form.name.trim(),

      description:
        form.description.trim() ||
        undefined,

      category:
        form.category.trim(),

      serialNumber:
        form.serialNumber.trim() ||
        undefined,

      value: numericValue,

      status:
        form.status.trim() ||
        undefined,

      location:
        form.location.trim() ||
        undefined,

      purchaseDate:
        form.purchaseDate
          ? new Date(
              `${form.purchaseDate}T00:00:00`,
            ).toISOString()
          : undefined,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.patch(
          `/assets/${editingId}`,
          payload,
        );

        alert(
          'Asset updated successfully.',
        );
      } else {
        await api.post(
          '/assets',
          payload,
        );

        alert(
          'Asset created successfully.',
        );
      }

      resetForm();
      await loadData();
    } catch (error: any) {
      handleError(
        error,
        editingId !== null
          ? 'Failed to update asset.'
          : 'Failed to create asset.',
      );
    } finally {
      setSaving(false);
    }
  };

  const edit = (asset: Asset) => {
    setEditingId(asset.id);

    setForm({
      name: asset.name || '',
      description:
        asset.description || '',
      category:
        asset.category || '',
      serialNumber:
        asset.serialNumber || '',
      value:
        asset.value !== undefined &&
        asset.value !== null
          ? String(asset.value)
          : '',
      status:
        asset.status ||
        'AVAILABLE',
      location:
        asset.location || '',
      purchaseDate:
        asset.purchaseDate
          ? new Date(
              asset.purchaseDate,
            )
              .toISOString()
              .slice(0, 10)
          : '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const remove = async (
    id: number,
  ) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this asset?',
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/assets/${id}`,
      );

      alert(
        'Asset deleted successfully.',
      );

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (error: any) {
      handleError(
        error,
        'Failed to delete asset.',
      );
    }
  };

  const filteredAssets = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return assets.filter(
      (asset) => {
        const matchesSearch =
          !searchValue ||
          asset.name
            .toLowerCase()
            .includes(searchValue) ||
          asset.category
            .toLowerCase()
            .includes(searchValue) ||
          asset.serialNumber
            ?.toLowerCase()
            .includes(searchValue) ||
          asset.location
            ?.toLowerCase()
            .includes(searchValue) ||
          asset.description
            ?.toLowerCase()
            .includes(searchValue);

        const matchesStatus =
          !statusFilter ||
          asset.status ===
            statusFilter;

        const matchesCategory =
          !categoryFilter ||
          asset.category ===
            categoryFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCategory
        );
      },
    );
  }, [
    assets,
    search,
    statusFilter,
    categoryFilter,
  ]);

  const totalValue = assets.reduce(
    (total, asset) =>
      total +
      Number(asset.value || 0),
    0,
  );

  const availableCount =
    assets.filter(
      (asset) =>
        asset.status ===
        'AVAILABLE',
    ).length;

  const assignedCount =
    assets.filter(
      (asset) =>
        asset.status ===
        'ASSIGNED',
    ).length;

  const maintenanceCount =
    assets.filter(
      (asset) =>
        asset.status ===
        'MAINTENANCE',
    ).length;

  const lostCount =
    assets.filter(
      (asset) =>
        asset.status === 'LOST',
    ).length;

  const categories = Array.from(
    new Set(
      assets
        .map(
          (asset) =>
            asset.category,
        )
        .filter(Boolean),
    ),
  ).sort();

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

  const formatDate = (
    value?: string | null,
  ) => {
    if (!value) {
      return '—';
    }

    return new Date(
      value,
    ).toLocaleDateString(
      'en-IN',
    );
  };

  const getStatusClass = (
    status?: string | null,
  ) => {
    switch (
      status?.toUpperCase()
    ) {
      case 'AVAILABLE':
        return 'available';

      case 'ASSIGNED':
        return 'assigned';

      case 'MAINTENANCE':
        return 'maintenance';

      case 'LOST':
        return 'lost';

      case 'RETIRED':
        return 'retired';

      default:
        return 'default';
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
  };

  return (
    <div className="assets-page">

      {/* HEADER */}
      <div className="assets-header">

        <div>
          <h1>
            Asset Management
          </h1>

          <p>
            Manage company assets,
            values, locations and
            status.
          </p>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            resetForm();

            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }}
        >
          + Add Asset
        </button>

      </div>

      {/* SUMMARY */}
      <div className="asset-summary">

        <div className="summary-card">
          <div className="summary-icon">
            🖥️
          </div>

          <div>
            <span>
              Total Assets
            </span>

            <strong>
              {assets.length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            ✅
          </div>

          <div>
            <span>
              Available
            </span>

            <strong>
              {availableCount}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            👤
          </div>

          <div>
            <span>
              Assigned
            </span>

            <strong>
              {assignedCount}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            💰
          </div>

          <div>
            <span>
              Total Value
            </span>

            <strong>
              {formatCurrency(
                totalValue,
              )}
            </strong>
          </div>
        </div>

      </div>

      {/* FORM */}
      <div className="asset-card">

        <div className="asset-card-header">

          <div>
            <h2>
              {editingId !== null
                ? 'Edit Asset'
                : 'Add Asset'}
            </h2>

            <p>
              {editingId !== null
                ? 'Update the selected asset.'
                : 'Enter asset details below.'}
            </p>
          </div>

          {editingId !== null && (
            <button
              type="button"
              className="secondary-btn"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}

        </div>

        <form
          className="asset-form"
          onSubmit={submit}
        >

          <div className="form-group">
            <label>
              Asset Name *
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Laptop, Projector, Chair..."
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Category *
            </label>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="IT Equipment"
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Serial Number
            </label>

            <input
              name="serialNumber"
              value={form.serialNumber}
              onChange={handleChange}
              placeholder="Serial number"
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label>
              Asset Value *
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              name="value"
              value={form.value}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {statusOptions.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="form-group">
            <label>
              Location
            </label>

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Office / Lab / Branch"
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label>
              Purchase Date
            </label>

            <input
              type="date"
              name="purchaseDate"
              value={form.purchaseDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full">
            <label>
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Asset description"
              maxLength={1000}
            />
          </div>

          <div className="form-actions">

            {editingId !== null && (
              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Clear
              </button>
            )}

            <button
              className="primary-btn"
              type="submit"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Asset'
                  : 'Add Asset'}
            </button>

          </div>

        </form>

      </div>

      {/* FILTERS */}
      <div className="asset-card filters-card">

        <div className="filter-group search-group">
          <label>
            Search
          </label>

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
            placeholder="Search asset, category, serial number..."
          />
        </div>

        <div className="filter-group">
          <label>
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value,
              )
            }
          >
            <option value="">
              All Status
            </option>

            {statusOptions.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="filter-group">
          <label>
            Category
          </label>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value,
              )
            }
          >
            <option value="">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ),
            )}
          </select>
        </div>

        <button
          type="button"
          className="secondary-btn clear-filter-btn"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

      </div>

      {/* ASSET LIST */}
      <div className="asset-card">

        <div className="asset-card-header">

          <div>
            <h2>
              Company Assets
            </h2>

            <p>
              Showing{' '}
              {filteredAssets.length}{' '}
              of {assets.length}{' '}
              assets
            </p>
          </div>

          <button
            type="button"
            className="secondary-btn"
            onClick={loadData}
          >
            ↻ Refresh
          </button>

        </div>

        {loading ? (
          <div className="empty">
            <div className="loading-spinner" />
            <p>
              Loading assets...
            </p>
          </div>
        ) : filteredAssets.length ===
          0 ? (
          <div className="empty">

            <div className="empty-icon">
              🖥️
            </div>

            <h3>
              {assets.length === 0
                ? 'No assets found'
                : 'No matching assets'}
            </h3>

            <p>
              {assets.length === 0
                ? 'Add your first asset above.'
                : 'Try changing your search or filters.'}
            </p>

            {assets.length > 0 && (
              <button
                type="button"
                className="secondary-btn"
                onClick={
                  clearFilters
                }
              >
                Clear Filters
              </button>
            )}

          </div>
        ) : (
          <div className="asset-table-wrapper">

            <table className="asset-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Serial Number</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Purchase Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredAssets.map(
                  (asset) => (
                    <tr
                      key={asset.id}
                    >

                      <td>
                        <span className="asset-id">
                          #{asset.id}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {asset.name}
                        </strong>

                        {asset.description && (
                          <small>
                            {
                              asset.description
                            }
                          </small>
                        )}
                      </td>

                      <td>
                        <span className="category-badge">
                          {
                            asset.category
                          }
                        </span>
                      </td>

                      <td>
                        {asset.serialNumber ||
                          '—'}
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            Number(
                              asset.value ||
                                0,
                            ),
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`status ${getStatusClass(
                            asset.status,
                          )}`}
                        >
                          {asset.status ||
                            '—'}
                        </span>
                      </td>

                      <td>
                        {asset.location ||
                          '—'}
                      </td>

                      <td>
                        {formatDate(
                          asset.purchaseDate,
                        )}
                      </td>

                      <td>
                        <div className="actions">

                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              edit(
                                asset,
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              remove(
                                asset.id,
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  ),
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* STATUS INFO */}
      {maintenanceCount > 0 ||
        lostCount > 0 ? (
        <div className="asset-alert">
          {maintenanceCount > 0 && (
            <span>
              🔧 {maintenanceCount}{' '}
              asset
              {maintenanceCount !== 1
                ? 's are'
                : ' is'}{' '}
              under maintenance.
            </span>
          )}

          {lostCount > 0 && (
            <span>
              ⚠️ {lostCount}{' '}
              asset
              {lostCount !== 1
                ? 's are'
                : ' is'}{' '}
              marked as lost.
            </span>
          )}
        </div>
      ) : null}

    </div>
  );
}

export default Assets;