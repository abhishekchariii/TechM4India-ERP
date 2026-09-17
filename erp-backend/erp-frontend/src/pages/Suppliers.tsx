import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './Suppliers.css';

interface Supplier {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface SupplierForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const emptyForm: SupplierForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

function Suppliers() {
  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [form, setForm] =
    useState<SupplierForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const handleError = (
    error: any,
    fallback: string,
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

    const message =
      error?.response?.data?.message;

    if (Array.isArray(message)) {
      alert(message.join('\n'));
      return;
    }

    alert(message || fallback);
  };

  const loadSuppliers = async () => {
    try {
      setLoading(true);

      const response =
        await api.get<Supplier[]>(
          '/suppliers',
        );

      setSuppliers(response.data);
    } catch (error: any) {
      handleError(
        error,
        'Failed to load suppliers.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
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
      alert(
        'Supplier name is required.',
      );
      return;
    }

    const payload = {
      name: form.name.trim(),

      email:
        form.email.trim() ||
        undefined,

      phone:
        form.phone.trim() ||
        undefined,

      address:
        form.address.trim() ||
        undefined,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.patch(
          `/suppliers/${editingId}`,
          payload,
        );

        alert(
          'Supplier updated successfully.',
        );
      } else {
        await api.post(
          '/suppliers',
          payload,
        );

        alert(
          'Supplier created successfully.',
        );
      }

      resetForm();
      await loadSuppliers();
    } catch (error: any) {
      handleError(
        error,
        editingId !== null
          ? 'Failed to update supplier.'
          : 'Failed to create supplier.',
      );
    } finally {
      setSaving(false);
    }
  };

  const edit = (
    supplier: Supplier,
  ) => {
    setEditingId(supplier.id);

    setForm({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
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
        'Are you sure you want to delete this supplier?',
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/suppliers/${id}`,
      );

      alert(
        'Supplier deleted successfully.',
      );

      if (editingId === id) {
        resetForm();
      }

      await loadSuppliers();
    } catch (error: any) {
      handleError(
        error,
        'Failed to delete supplier.',
      );
    }
  };

  const filteredSuppliers =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      if (!searchValue) {
        return suppliers;
      }

      return suppliers.filter(
        (supplier) =>
          supplier.name
            .toLowerCase()
            .includes(searchValue) ||
          supplier.email
            ?.toLowerCase()
            .includes(searchValue) ||
          supplier.phone
            ?.toLowerCase()
            .includes(searchValue) ||
          supplier.address
            ?.toLowerCase()
            .includes(searchValue),
      );
    }, [suppliers, search]);

  const withEmailCount =
    suppliers.filter(
      (supplier) =>
        Boolean(supplier.email),
    ).length;

  const withPhoneCount =
    suppliers.filter(
      (supplier) =>
        Boolean(supplier.phone),
    ).length;

  return (
    <div className="suppliers-page">

      {/* HEADER */}
      <div className="suppliers-header">

        <div>
          <h1>
            Supplier Management
          </h1>

          <p>
            Manage company suppliers
            and their contact
            information.
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
          + Add Supplier
        </button>

      </div>

      {/* SUMMARY */}
      <div className="supplier-summary">

        <div className="summary-card">
          <div className="summary-icon">
            🏢
          </div>

          <div>
            <span>
              Total Suppliers
            </span>

            <strong>
              {suppliers.length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            📧
          </div>

          <div>
            <span>
              With Email
            </span>

            <strong>
              {withEmailCount}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            📞
          </div>

          <div>
            <span>
              With Phone
            </span>

            <strong>
              {withPhoneCount}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            🔎
          </div>

          <div>
            <span>
              Showing
            </span>

            <strong>
              {filteredSuppliers.length}
            </strong>
          </div>
        </div>

      </div>

      {/* FORM */}
      <div className="supplier-card">

        <div className="supplier-card-header">

          <div>
            <h2>
              {editingId !== null
                ? 'Edit Supplier'
                : 'Add Supplier'}
            </h2>

            <p>
              {editingId !== null
                ? 'Update the selected supplier.'
                : 'Enter supplier details below.'}
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
          className="supplier-form"
          onSubmit={submit}
        >

          <div className="form-group">
            <label>
              Supplier Name *
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter supplier name"
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="supplier@example.com"
            />
          </div>

          <div className="form-group">
            <label>
              Phone
            </label>

            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone number"
            />
          </div>

          <div className="form-group full">
            <label>
              Address
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              placeholder="Supplier address"
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
                  ? 'Update Supplier'
                  : 'Add Supplier'}
            </button>

          </div>

        </form>

      </div>

      {/* SEARCH */}
      <div className="supplier-card search-card">

        <div className="search-group">

          <label>
            Search Suppliers
          </label>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
            placeholder="Search by name, email, phone or address..."
          />

        </div>

        {search && (
          <button
            type="button"
            className="secondary-btn"
            onClick={() =>
              setSearch('')
            }
          >
            Clear Search
          </button>
        )}

      </div>

      {/* TABLE */}
      <div className="supplier-card">

        <div className="supplier-card-header">

          <div>
            <h2>
              Suppliers
            </h2>

            <p>
              Showing{' '}
              {filteredSuppliers.length}{' '}
              of {suppliers.length}{' '}
              suppliers
            </p>
          </div>

          <button
            type="button"
            className="secondary-btn"
            onClick={loadSuppliers}
          >
            ↻ Refresh
          </button>

        </div>

        {loading ? (
          <div className="empty-state">

            <div className="loading-spinner" />

            <p>
              Loading suppliers...
            </p>

          </div>
        ) : filteredSuppliers.length ===
          0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              🏢
            </div>

            <h3>
              {suppliers.length === 0
                ? 'No suppliers found'
                : 'No matching suppliers'}
            </h3>

            <p>
              {suppliers.length === 0
                ? 'Add your first supplier above.'
                : 'Try changing your search.'}
            </p>

            {suppliers.length > 0 && (
              <button
                type="button"
                className="secondary-btn"
                onClick={() =>
                  setSearch('')
                }
              >
                Clear Search
              </button>
            )}

          </div>
        ) : (
          <div className="supplier-table-wrapper">

            <table className="supplier-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Supplier</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredSuppliers.map(
                  (supplier) => (
                    <tr
                      key={supplier.id}
                    >

                      <td>
                        <span className="supplier-id">
                          #{supplier.id}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {supplier.name}
                        </strong>
                      </td>

                      <td>
                        {supplier.email ? (
                          <span className="contact-value">
                            {supplier.email}
                          </span>
                        ) : (
                          <span className="muted">
                            —
                          </span>
                        )}
                      </td>

                      <td>
                        {supplier.phone ? (
                          <span className="contact-value">
                            {supplier.phone}
                          </span>
                        ) : (
                          <span className="muted">
                            —
                          </span>
                        )}
                      </td>

                      <td>
                        {supplier.address ? (
                          <span className="address-value">
                            {supplier.address}
                          </span>
                        ) : (
                          <span className="muted">
                            —
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="supplier-actions">

                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              edit(
                                supplier,
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
                                supplier.id,
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

    </div>
  );
}

export default Suppliers;