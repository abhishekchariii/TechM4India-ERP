import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './Programs.css';

interface Program {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  category?: string | null;
  duration?: string | null;
  fee?: number | null;
  status?: string | null;
  institutionId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

interface Institution {
  id: number;
  name: string;
}

interface ProgramForm {
  name: string;
  code: string;
  description: string;
  category: string;
  duration: string;
  fee: string;
  status: string;
  institutionId: string;
}

const emptyForm: ProgramForm = {
  name: '',
  code: '',
  description: '',
  category: '',
  duration: '',
  fee: '',
  status: 'ACTIVE',
  institutionId: '',
};

const statusOptions = ['ACTIVE', 'INACTIVE', 'DRAFT'];

const categoryOptions = [
  'ENGINEERING',
  'DATA SCIENCE',
  'COMPUTER SCIENCE',
  'AI & ML',
  'CYBER SECURITY',
  'MANAGEMENT',
  'MEDICAL',
  'PHARMACY',
  'LAW',
  'DEGREE',
  'DIPLOMA',
  'OTHER',
];

function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<ProgramForm>(emptyForm);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadPrograms = async () => {
    try {
      setLoading(true);

      const response =
        await api.get<Program[]>('/programs');

      setPrograms(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to view programs.');
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to load programs.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const loadInstitutions = async () => {
    try {
      const response =
        await api.get<Institution[]>('/institutions');

      setInstitutions(response.data);
    } catch (error: any) {
      console.error(
        'Failed to load institutions:',
        error,
      );
    }
  };

  useEffect(() => {
    loadPrograms();
    loadInstitutions();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
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
      alert('Program name is required.');
      return;
    }

    if (
      form.fee.trim() &&
      Number(form.fee) < 0
    ) {
      alert('Fee cannot be negative.');
      return;
    }

    if (
      form.institutionId.trim() &&
      !Number.isInteger(Number(form.institutionId))
    ) {
      alert('Institution ID must be a valid number.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        description:
          form.description.trim() || undefined,
        category:
          form.category.trim() || undefined,
        duration:
          form.duration.trim() || undefined,
        fee: form.fee.trim()
          ? Number(form.fee)
          : undefined,
        status:
          form.status.trim() || 'ACTIVE',
        institutionId:
          form.institutionId.trim()
            ? Number(form.institutionId)
            : undefined,
      };

      if (editingId !== null) {
        await api.patch(
          `/programs/${editingId}`,
          payload,
        );

        alert('Program updated successfully.');
      } else {
        await api.post('/programs', payload);

        alert('Program created successfully.');
      }

      resetForm();
      await loadPrograms();
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert(
          'You do not have permission to manage programs.',
        );
      } else if (error.response?.status === 400) {
        const message =
          error.response?.data?.message;

        alert(
          Array.isArray(message)
            ? message.join('\n')
            : message ||
                'Invalid program details.',
        );
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to save program.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (program: Program) => {
    setEditingId(program.id);

    setForm({
      name: program.name || '',
      code: program.code || '',
      description: program.description || '',
      category: program.category || '',
      duration: program.duration || '',
      fee:
        program.fee !== null &&
        program.fee !== undefined
          ? String(program.fee)
          : '',
      status: program.status || 'ACTIVE',
      institutionId:
        program.institutionId !== null &&
        program.institutionId !== undefined
          ? String(program.institutionId)
          : '',
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (
    program: Program,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${program.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/programs/${program.id}`,
      );

      alert('Program deleted successfully.');

      await loadPrograms();
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert(
          'You do not have permission to delete programs.',
        );
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to delete program.',
        );
      }
    }
  };

  const getInstitutionName = (
    institutionId?: number | null,
  ) => {
    if (
      institutionId === null ||
      institutionId === undefined
    ) {
      return '-';
    }

    const institution =
      institutions.find(
        (item) => item.id === institutionId,
      );

    return institution
      ? institution.name
      : `Institution #${institutionId}`;
  };

  const filteredPrograms = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return programs.filter((program) => {
      const matchesSearch =
        !searchValue ||
        program.name
          .toLowerCase()
          .includes(searchValue) ||
        program.code
          ?.toLowerCase()
          .includes(searchValue) ||
        program.description
          ?.toLowerCase()
          .includes(searchValue) ||
        program.category
          ?.toLowerCase()
          .includes(searchValue) ||
        program.duration
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        !statusFilter ||
        (program.status || 'ACTIVE') ===
          statusFilter;

      const matchesCategory =
        !categoryFilter ||
        (program.category || '')
          .toUpperCase() === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    programs,
    search,
    statusFilter,
    categoryFilter,
  ]);

  const activeCount = programs.filter(
    (program) =>
      (program.status || 'ACTIVE') ===
      'ACTIVE',
  ).length;

  const inactiveCount = programs.filter(
    (program) =>
      (program.status || '').toUpperCase() ===
      'INACTIVE',
  ).length;

  const draftCount = programs.filter(
    (program) =>
      (program.status || '').toUpperCase() ===
      'DRAFT',
  ).length;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
  };

  const formatFee = (
    fee?: number | null,
  ) => {
    if (
      fee === null ||
      fee === undefined
    ) {
      return '-';
    }

    return `₹${Number(fee).toLocaleString(
      'en-IN',
    )}`;
  };

  const formatDate = (
    value?: string,
  ) => {
    if (!value) {
      return '-';
    }

    return new Date(
      value,
    ).toLocaleDateString();
  };

  const getStatusClass = (
    status?: string | null,
  ) => {
    switch (
      (status || '').toUpperCase()
    ) {
      case 'ACTIVE':
        return 'status-active';

      case 'INACTIVE':
        return 'status-inactive';

      case 'DRAFT':
        return 'status-draft';

      default:
        return 'status-default';
    }
  };

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Programs</h1>

          <p>
            Manage programs, courses,
            categories, fees, and
            institutions.
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
          + Add Program
        </button>
      </div>

      {/* Summary */}
      <div className="program-summary">

        <div className="summary-card">
          <div className="summary-icon">
            📚
          </div>

          <div>
            <span>Total Programs</span>
            <strong>
              {programs.length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            ✅
          </div>

          <div>
            <span>Active</span>
            <strong>
              {activeCount}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            📝
          </div>

          <div>
            <span>Draft</span>
            <strong>
              {draftCount}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            ⏸️
          </div>

          <div>
            <span>Inactive</span>
            <strong>
              {inactiveCount}
            </strong>
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
                  ? 'Edit Program'
                  : 'Add Program'}
              </h2>

              <p className="form-subtitle">
                Enter program information
                below.
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

          <form
            onSubmit={handleSubmit}
          >
            <div className="form-grid">

              {/* Name */}
              <div className="form-group">
                <label htmlFor="name">
                  Program Name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter program name"
                  maxLength={255}
                  required
                />
              </div>

              {/* Code */}
              <div className="form-group">
                <label htmlFor="code">
                  Program Code
                </label>

                <input
                  id="code"
                  name="code"
                  type="text"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="Example: DS001"
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="category">
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">
                    Select category
                  </option>

                  {categoryOptions.map(
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

              {/* Duration */}
              <div className="form-group">
                <label htmlFor="duration">
                  Duration
                </label>

                <input
                  id="duration"
                  name="duration"
                  type="text"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 6 Months"
                />
              </div>

              {/* Fee */}
              <div className="form-group">
                <label htmlFor="fee">
                  Fee (₹)
                </label>

                <input
                  id="fee"
                  name="fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.fee}
                  onChange={handleChange}
                  placeholder="Enter program fee"
                />
              </div>

              {/* Status */}
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

              {/* Institution */}
              <div className="form-group">
                <label htmlFor="institutionId">
                  Institution
                </label>

                <select
                  id="institutionId"
                  name="institutionId"
                  value={
                    form.institutionId
                  }
                  onChange={handleChange}
                >
                  <option value="">
                    No Institution
                  </option>

                  {institutions.map(
                    (institution) => (
                      <option
                        key={institution.id}
                        value={
                          institution.id
                        }
                      >
                        {institution.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={
                    form.description
                  }
                  onChange={handleChange}
                  placeholder="Describe the program..."
                  rows={4}
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
                    ? 'Update Program'
                    : 'Create Program'}
              </button>

            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-card">

        <div className="filter-group search-filter">
          <label htmlFor="program-search">
            Search
          </label>

          <input
            id="program-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search programs, codes, categories..."
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
              setStatusFilter(
                event.target.value,
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
          <label htmlFor="category-filter">
            Category
          </label>

          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value,
              )
            }
          >
            <option value="">
              All Categories
            </option>

            {categoryOptions.map(
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
            <h2>Program List</h2>

            <p className="table-subtitle">
              View and manage registered
              programs.
            </p>
          </div>

          <span className="record-count">
            {filteredPrograms.length}
            {' '}
            program
            {filteredPrograms.length !== 1
              ? 's'
              : ''}
          </span>

        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>
              Loading programs...
            </p>
          </div>
        ) : filteredPrograms.length ===
          0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              📚
            </div>

            <h3>
              {programs.length === 0
                ? 'No programs found'
                : 'No matching programs'}
            </h3>

            <p>
              {programs.length === 0
                ? 'Add your first program using the button above.'
                : 'Try changing your search or filters.'}
            </p>

            {programs.length > 0 && (
              <button
                type="button"
                className="secondary-button"
                onClick={
                  clearFilters
                }
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
                  <th>Program</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Institution</th>
                  <th>Duration</th>
                  <th>Fee</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredPrograms.map(
                  (program) => (
                    <tr
                      key={program.id}
                    >

                      <td>
                        <span className="id-badge">
                          #{program.id}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {program.name}
                        </strong>

                        {program.description && (
                          <div className="description-preview">
                            {
                              program.description
                            }
                          </div>
                        )}
                      </td>

                      <td>
                        {program.code ||
                          '-'}
                      </td>

                      <td>
                        <span className="category-badge">
                          {program.category ||
                            'OTHER'}
                        </span>
                      </td>

                      <td>
                        {getInstitutionName(
                          program.institutionId,
                        )}
                      </td>

                      <td>
                        {program.duration ||
                          '-'}
                      </td>

                      <td>
                        {formatFee(
                          program.fee,
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            program.status,
                          )}`}
                        >
                          {program.status ||
                            'UNKNOWN'}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          program.createdAt,
                        )}
                      </td>

                      <td>
                        <div className="action-buttons">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              handleEdit(
                                program,
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
                                program,
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

export default Programs;