import { useEffect, useState } from 'react';
import api from '../services/api';
import './Customers.css';

interface Customer {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const emptyForm: CustomerForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<CustomerForm>(emptyForm);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await api.get<Customer[]>('/customers');

      setCustomers(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to view customers.');
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to load customers.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
    setShowForm(false);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert('Customer name is required.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
      };

      if (editingId !== null) {
        await api.patch(`/customers/${editingId}`, payload);
        alert('Customer updated successfully.');
      } else {
        await api.post('/customers', payload);
        alert('Customer created successfully.');
      }

      resetForm();
      await loadCustomers();
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('You do not have permission to manage customers.');
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message;

        alert(
          Array.isArray(message)
            ? message.join('\n')
            : message || 'Invalid customer details.',
        );
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to save customer.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);

    setForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });

    setShowForm(true);
  };

  const handleDelete = async (customer: Customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${customer.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/customers/${customer.id}`);

      alert('Customer deleted successfully.');

      await loadCustomers();
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert('You do not have permission to delete customers.');
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to delete customer.',
        );
      }
    }
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleDateString();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your customer records and contact information.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          + Add Customer
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <h2>
              {editingId !== null
                ? 'Edit Customer'
                : 'Add Customer'}
            </h2>

            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">
                  Customer Name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  maxLength={255}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="customer@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter customer address"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Update Customer'
                    : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <h2>Customer List</h2>

          <span className="record-count">
            {customers.length} customer
            {customers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <h3>No customers found</h3>
            <p>
              Add your first customer using the button above.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>#{customer.id}</td>

                    <td>
                      <strong>{customer.name}</strong>
                    </td>

                    <td>
                      {customer.email || '-'}
                    </td>

                    <td>
                      {customer.phone || '-'}
                    </td>

                    <td>
                      {customer.address || '-'}
                    </td>

                    <td>
                      {formatDate(customer.createdAt)}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(customer)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(customer)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Customers;