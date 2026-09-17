import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './Institutions.css';

interface Institution {
  id: number;
  name: string;
  code?: string | null;
  type?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  website?: string | null;
  contactName?: string | null;
  status?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface InstitutionForm {
  name: string;
  code: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  website: string;
  contactName: string;
  status: string;
  notes: string;
}

const emptyForm: InstitutionForm = {
  name: '',
  code: '',
  type: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  website: '',
  contactName: '',
  status: 'ACTIVE',
  notes: '',
};

const institutionTypes = [
  'SCHOOL',
  'COLLEGE',
  'UNIVERSITY',
  'ENGINEERING',
  'MEDICAL',
  'PHARMACY',
  'LAW',
  'DEGREE',
  'DIPLOMA',
  'OTHER',
];

const statusOptions = ['ACTIVE', 'INACTIVE'];

function Institutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<InstitutionForm>(emptyForm);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const loadInstitutions = async () => {
    try {
      setLoading(true);

      const response = await api.get<Institution[]>('/institutions');

      setInstitutions(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to view institutions.');
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to load institutions.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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
    setShowForm(false);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert('Institution name is required.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        type: form.type.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        website: form.website.trim() || undefined,
        contactName: form.contactName.trim() || undefined,
        status: form.status.trim() || 'ACTIVE',
        notes: form.notes.trim() || undefined,
      };

      if (editingId !== null) {
        await api.patch(
          `/institutions/${editingId}`,
          payload,
        );

        alert('Institution updated successfully.');
      } else {
        await api.post('/institutions', payload);

        alert('Institution created successfully.');
      }

      resetForm();
      await loadInstitutions();
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert(
          'You do not have permission to manage institutions.',
        );
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message;

        alert(
          Array.isArray(message)
            ? message.join('\n')
            : message || 'Invalid institution details.',
        );
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to save institution.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (institution: Institution) => {
    setEditingId(institution.id);

    setForm({
      name: institution.name || '',
      code: institution.code || '',
      type: institution.type || '',
      email: institution.email || '',
      phone: institution.phone || '',
      address: institution.address || '',
      city: institution.city || '',
      state: institution.state || '',
      website: institution.website || '',
      contactName: institution.contactName || '',
      status: institution.status || 'ACTIVE',
      notes: institution.notes || '',
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (
    institution: Institution,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${institution.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/institutions/${institution.id}`,
      );

      alert('Institution deleted successfully.');

      await loadInstitutions();
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert(
          'You do not have permission to delete institutions.',
        );
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to delete institution.',
        );
      }
    }
  };

  const filteredInstitutions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return institutions.filter((institution) => {
      const matchesSearch =
        !searchValue ||
        institution.name
          .toLowerCase()
          .includes(searchValue) ||
        institution.code
          ?.toLowerCase()
          .includes(searchValue) ||
        institution.type
          ?.toLowerCase()
          .includes(searchValue) ||
        institution.contactName
          ?.toLowerCase()
          .includes(searchValue) ||
        institution.email
          ?.toLowerCase()
          .includes(searchValue) ||
        institution.phone
          ?.toLowerCase()
          .includes(searchValue) ||
        institution.city
          ?.toLowerCase()
          .includes(searchValue) ||
        institution.state
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        !statusFilter ||
        (institution.status || 'ACTIVE') === statusFilter;

      const matchesType =
        !typeFilter ||
        (institution.type || '').toUpperCase() === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    institutions,
    search,
    statusFilter,
    typeFilter,
  ]);

  const activeCount = institutions.filter(
    (institution) =>
      (institution.status || 'ACTIVE') === 'ACTIVE',
  ).length;

  const inactiveCount = institutions.filter(
    (institution) =>
      (institution.status || '').toUpperCase() === 'INACTIVE',
  ).length;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleDateString();
  };

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Institutions</h1>
          <p>
            Manage educational institutions and their
            contact information.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          + Add Institution
        </button>
      </div>

      {/* Summary */}
      <div className="institution-summary">

        <div className="summary-card">
          <div className="summary-icon">🏫</div>
          <div>
            <span>Total Institutions</span>
            <strong>{institutions.length}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div>
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">⏸️</div>
          <div>
            <span>Inactive</span>
            <strong>{inactiveCount}</strong>
          </div>
        </div>

      </div>

      {/* Form */}
      {showForm && (
        <div className="form-card">

          <div className="form-card-header">
            <div>
              <h2>
                {editingId !== null
                  ? 'Edit Institution'
                  : 'Add Institution'}
              </h2>

              <p className="form-subtitle">
                Enter institution information below.
              </p>
            </div>

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
                  Institution Name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter institution name"
                  maxLength={255}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="code">
                  Institution Code
                </label>

                <input
                  id="code"
                  name="code"
                  type="text"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="Example: INST001"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">
                  Institution Type
                </label>

                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="">
                    Select type
                  </option>

                  {institutionTypes.map((type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contactName">
                  Contact Name
                </label>

                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  value={form.contactName}
                  onChange={handleChange}
                  placeholder="Enter contact person"
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
                  placeholder="institution@example.com"
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

              <div className="form-group">
                <label htmlFor="city">
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">
                  State
                </label>

                <input
                  id="state"
                  name="state"
                  type="text"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">
                  Website
                </label>

                <input
                  id="website"
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  {statusOptions.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
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
                  placeholder="Enter institution address"
                  rows={3}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="notes">
                  Notes
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Additional notes"
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
                    ? 'Update Institution'
                    : 'Create Institution'}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-card">

        <div className="filter-group search-filter">
          <label htmlFor="institution-search">
            Search
          </label>

          <input
            id="institution-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search name, code, city, contact..."
          />
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">
            Status
          </label>

          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="">All Status</option>

            {statusOptions.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="type-filter">
            Type
          </label>

          <select
            id="type-filter"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
          >
            <option value="">All Types</option>

            {institutionTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="filter-clear"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

      </div>

      {/* Table */}
      <div className="table-card">

        <div className="table-header">
          <div>
            <h2>Institution List</h2>
            <p className="table-subtitle">
              View and manage registered institutions.
            </p>
          </div>

          <span className="record-count">
            {filteredInstitutions.length}
            {' '}
            institution
            {filteredInstitutions.length !== 1
              ? 's'
              : ''}
          </span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading institutions...</p>
          </div>
        ) : filteredInstitutions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏫</div>

            <h3>
              {institutions.length === 0
                ? 'No institutions found'
                : 'No matching institutions'}
            </h3>

            <p>
              {institutions.length === 0
                ? 'Add your first institution using the button above.'
                : 'Try changing your search or filters.'}
            </p>

            {institutions.length > 0 && (
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

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Institution</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Website</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInstitutions.map(
                  (institution) => (
                    <tr key={institution.id}>

                      <td>
                        <span className="id-badge">
                          #{institution.id}
                        </span>
                      </td>

                      <td>
                        <div className="institution-name">
                          <strong>
                            {institution.name}
                          </strong>

                          {institution.address && (
                            <div className="address-preview">
                              {institution.address}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        {institution.code || '-'}
                      </td>

                      <td>
                        <span className="type-badge">
                          {institution.type || 'OTHER'}
                        </span>
                      </td>

                      <td>
                        {institution.contactName || '-'}
                      </td>

                      <td>
                        {institution.email || '-'}
                      </td>

                      <td>
                        {institution.phone || '-'}
                      </td>

                      <td>
                        <div className="location-cell">
                          {institution.city && (
                            <span>
                              {institution.city}
                            </span>
                          )}

                          {institution.state && (
                            <small>
                              {institution.state}
                            </small>
                          )}

                          {!institution.city &&
                            !institution.state &&
                            '-'}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            (institution.status ||
                              'ACTIVE'
                            ).toLowerCase()
                          }`}
                        >
                          {institution.status ||
                            'ACTIVE'}
                        </span>
                      </td>

                      <td>
                        {institution.website ? (
                          <a
                            href={
                              institution.website.startsWith(
                                'http://',
                              ) ||
                              institution.website.startsWith(
                                'https://',
                              )
                                ? institution.website
                                : `https://${institution.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="website-link"
                          >
                            Visit
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td>
                        {formatDate(
                          institution.createdAt,
                        )}
                      </td>

                      <td>
                        <div className="action-buttons">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              handleEdit(
                                institution,
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
                                institution,
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

export default Institutions;