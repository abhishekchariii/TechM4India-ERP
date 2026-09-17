import { useEffect, useState } from 'react';
import api from '../services/api';
import './Branches.css';

interface Organization {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  organizationId: number;
  organization?: Organization;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  name: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  phone: '',
  email: '',
  organizationId: 1,
  isActive: true,
};

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/branches');
      setBranches(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to load branches.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const openEdit = (branch: Branch) => {
    setEditingId(branch.id);

    setForm({
      name: branch.name,
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      country: branch.country || 'India',
      phone: branch.phone || '',
      email: branch.email || '',
      organizationId: branch.organizationId,
      isActive: branch.isActive,
    });

    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = {
        ...form,
        organizationId: Number(form.organizationId),
      };

      if (editingId) {
        await api.patch(
          `/branches/${editingId}`,
          payload,
        );
      } else {
        await api.post('/branches', payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadBranches();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to save branch.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this branch?',
    );

    if (!confirmed) return;

    try {
      setError('');
      await api.delete(`/branches/${id}`);
      await loadBranches();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to delete branch.',
      );
    }
  };

  return (
    <div className="branches-page">
      <div className="branches-header">
        <div>
          <h1>Branches</h1>
          <p>
            Manage company branches and their contact
            information.
          </p>
        </div>

        <button
          className="branches-primary-btn"
          onClick={openCreate}
        >
          + Add Branch
        </button>
      </div>

      {error && (
        <div className="branches-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="branches-form-card">
          <div className="branches-form-header">
            <h2>
              {editingId
                ? 'Edit Branch'
                : 'Add Branch'}
            </h2>

            <button
              className="branches-close-btn"
              onClick={() => setShowForm(false)}
              type="button"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="branches-form-grid">
              <div className="branches-field">
                <label>Branch Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Hyderabad Branch"
                />
              </div>

              <div className="branches-field">
                <label>City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Hyderabad"
                />
              </div>

              <div className="branches-field">
                <label>State</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Telangana"
                />
              </div>

              <div className="branches-field">
                <label>Country</label>
                <input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="India"
                />
              </div>

              <div className="branches-field">
                <label>Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91..."
                />
              </div>

              <div className="branches-field">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="branch@techm4india.com"
                />
              </div>

              <div className="branches-field full-width">
                <label>Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Complete branch address"
                />
              </div>

              <div className="branches-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  Active Branch
                </label>
              </div>
            </div>

            <div className="branches-form-actions">
              <button
                type="button"
                className="branches-secondary-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="branches-primary-btn"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Update Branch'
                    : 'Create Branch'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="branches-stats">
        <div className="branch-stat-card">
          <span>Total Branches</span>
          <strong>{branches.length}</strong>
        </div>

        <div className="branch-stat-card">
          <span>Active</span>
          <strong>
            {
              branches.filter(
                (branch) => branch.isActive,
              ).length
            }
          </strong>
        </div>

        <div className="branch-stat-card">
          <span>Inactive</span>
          <strong>
            {
              branches.filter(
                (branch) => !branch.isActive,
              ).length
            }
          </strong>
        </div>
      </div>

      <div className="branches-table-card">
        {loading ? (
          <div className="branches-empty">
            Loading branches...
          </div>
        ) : branches.length === 0 ? (
          <div className="branches-empty">
            <h3>No branches yet</h3>
            <p>
              Create your first company branch to
              get started.
            </p>

            <button
              className="branches-primary-btn"
              onClick={openCreate}
            >
              + Add First Branch
            </button>
          </div>
        ) : (
          <div className="branches-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Organization</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id}>
                    <td>
                      <strong>{branch.name}</strong>
                    </td>

                    <td>
                      {[branch.city, branch.state]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </td>

                    <td>
                      <div>
                        {branch.email || '—'}
                      </div>
                      <small>
                        {branch.phone || ''}
                      </small>
                    </td>

                    <td>
                      {branch.organization?.name ||
                        `Organization #${branch.organizationId}`}
                    </td>

                    <td>
                      <span
                        className={
                          branch.isActive
                            ? 'branch-status active'
                            : 'branch-status inactive'
                        }
                      >
                        {branch.isActive
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </td>

                    <td>
                      <div className="branch-actions">
                        <button
                          onClick={() =>
                            openEdit(branch)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete"
                          onClick={() =>
                            handleDelete(
                              branch.id,
                            )
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