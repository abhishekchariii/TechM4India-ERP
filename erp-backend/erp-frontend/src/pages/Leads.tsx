import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Leads.css';

interface Lead {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  city?: string | null;
  type?: string | null;
  source?: string | null;
  status?: string | null;
  priority?: string | null;
  interestedProgram?: string | null;
  assignedEmployeeId?: number | null;
  estimatedValue?: number | null;
  notes?: string | null;
  nextFollowUp?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface LeadResponse {
  data: Lead[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface LeadForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  type: string;
  source: string;
  status: string;
  priority: string;
  interestedProgram: string;
  assignedEmployeeId: string;
  estimatedValue: string;
  notes: string;
  nextFollowUp: string;
}

const emptyForm: LeadForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  city: '',
  type: 'OTHER',
  source: 'DIRECT',
  status: 'NEW',
  priority: 'MEDIUM',
  interestedProgram: '',
  assignedEmployeeId: '',
  estimatedValue: '',
  notes: '',
  nextFollowUp: '',
};

const statuses = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'MEETING',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
];

const priorities = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
];

const leadTypes = [
  'STUDENT',
  'SCHOOL',
  'COLLEGE',
  'UNIVERSITY',
  'CORPORATE',
  'GOVERNMENT',
  'CSR',
  'PARTNER',
  'VENDOR',
  'OTHER',
];

const sources = [
  'WEBSITE',
  'REFERRAL',
  'LINKEDIN',
  'INSTAGRAM',
  'WHATSAPP',
  'EVENT',
  'COLLEGE_OUTREACH',
  'SCHOOL_OUTREACH',
  'ADVERTISEMENT',
  'DIRECT',
  'OTHER',
];

function Leads() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<LeadForm>(emptyForm);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [page, setPage] = useState(1);
  const limit = 10;

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // =========================================================
  // LOAD LEADS
  // =========================================================

  const loadLeads = async () => {
    try {
      setLoading(true);

      const response = await api.get<LeadResponse>('/leads', {
        params: {
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          type: typeFilter || undefined,
          page,
          limit,
        },
      });

      setLeads(response.data.data);
      setTotal(response.data.meta.total);
      setTotalPages(response.data.meta.totalPages);
    } catch (error: any) {
      console.error('Failed to load leads:', error);

      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to view leads.');
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to load leads.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [
    page,
    search,
    statusFilter,
    priorityFilter,
    typeFilter,
  ]);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert('Lead name is required.');
      return;
    }

    if (
      form.estimatedValue &&
      Number.isNaN(Number(form.estimatedValue))
    ) {
      alert('Estimated value must be a valid number.');
      return;
    }

    if (
      form.assignedEmployeeId &&
      Number.isNaN(Number(form.assignedEmployeeId))
    ) {
      alert('Assigned Employee ID must be a valid number.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined,
        city: form.city.trim() || undefined,
        type: form.type,
        source: form.source,
        status: form.status,
        priority: form.priority,
        interestedProgram:
          form.interestedProgram.trim() || undefined,
        assignedEmployeeId: form.assignedEmployeeId.trim()
          ? Number(form.assignedEmployeeId)
          : undefined,
        estimatedValue: form.estimatedValue.trim()
          ? Number(form.estimatedValue)
          : undefined,
        notes: form.notes.trim() || undefined,
        nextFollowUp:
          form.nextFollowUp || undefined,
      };

      if (editingId !== null) {
        await api.patch(
          `/leads/${editingId}`,
          payload,
        );

        alert('Lead updated successfully.');
      } else {
        await api.post('/leads', payload);

        alert('Lead created successfully.');
      }

      resetForm();
      setPage(1);

      await loadLeads();
    } catch (error: any) {
      console.error('Failed to save lead:', error);

      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        alert(
          'You do not have permission to manage leads.',
        );
      } else if (error.response?.status === 400) {
        const message = error.response?.data?.message;

        alert(
          Array.isArray(message)
            ? message.join('\n')
            : message || 'Invalid lead details.',
        );
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to save lead.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (lead: Lead) => {
    setEditingId(lead.id);

    setForm({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      city: lead.city || '',
      type: lead.type || 'OTHER',
      source: lead.source || 'DIRECT',
      status: lead.status || 'NEW',
      priority: lead.priority || 'MEDIUM',
      interestedProgram:
        lead.interestedProgram || '',
      assignedEmployeeId:
        lead.assignedEmployeeId !== null &&
        lead.assignedEmployeeId !== undefined
          ? String(lead.assignedEmployeeId)
          : '',
      estimatedValue:
        lead.estimatedValue !== null &&
        lead.estimatedValue !== undefined
          ? String(lead.estimatedValue)
          : '',
      notes: lead.notes || '',
      nextFollowUp: lead.nextFollowUp
        ? new Date(lead.nextFollowUp)
            .toISOString()
            .slice(0, 16)
        : '',
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (lead: Lead) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${lead.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/leads/${lead.id}`);

      alert('Lead deleted successfully.');

      if (leads.length === 1 && page > 1) {
        setPage((previous) => previous - 1);
      } else {
        await loadLeads();
      }
    } catch (error: any) {
      console.error('Failed to delete lead:', error);

      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        alert(
          'You do not have permission to delete leads.',
        );
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to delete lead.',
        );
      }
    }
  };

  // =========================================================
  // FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setTypeFilter('');
    setPage(1);
  };

  // =========================================================
  // FORMATTERS
  // =========================================================

  const formatDateTime = (
    value?: string | null,
  ) => {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleString('en-IN');
  };

  const formatCurrency = (
    value?: number | null,
  ) => {
    if (
      value === null ||
      value === undefined
    ) {
      return '-';
    }

    return `₹${value.toLocaleString('en-IN')}`;
  };

  // =========================================================
  // BADGE CLASSES
  // =========================================================

  const getStatusClass = (
    status?: string | null,
  ) => {
    return `status-${(
      status || 'unknown'
    ).toLowerCase()}`;
  };

  const getPriorityClass = (
    priority?: string | null,
  ) => {
    return `priority-${(
      priority || 'medium'
    ).toLowerCase()}`;
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const newLeads = leads.filter(
    (lead) => lead.status === 'NEW',
  ).length;

  const qualifiedLeads = leads.filter(
    (lead) => lead.status === 'QUALIFIED',
  ).length;

  const wonLeads = leads.filter(
    (lead) => lead.status === 'WON',
  ).length;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="page-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page-header">

        <div>
          <h1>CRM Leads</h1>

          <p>
            Track, manage and convert your sales
            opportunities.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setEditingId(null);
            setForm({ ...emptyForm });
            setShowForm(true);

            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }}
        >
          + Add Lead
        </button>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="crm-summary">

        <div className="crm-card">

          <div className="crm-card-info">
            <p>Total Leads</p>
            <h3>{total}</h3>
          </div>

          <div className="crm-card-icon">
            👥
          </div>

        </div>

        <div className="crm-card">

          <div className="crm-card-info">
            <p>New Leads</p>
            <h3>{newLeads}</h3>
          </div>

          <div className="crm-card-icon">
            🆕
          </div>

        </div>

        <div className="crm-card">

          <div className="crm-card-info">
            <p>Qualified</p>
            <h3>{qualifiedLeads}</h3>
          </div>

          <div className="crm-card-icon">
            🎯
          </div>

        </div>

        <div className="crm-card">

          <div className="crm-card-info">
            <p>Won</p>
            <h3>{wonLeads}</h3>
          </div>

          <div className="crm-card-icon">
            🏆
          </div>

        </div>

      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="filters-card">

        <div className="filter-group search-filter">

          <label htmlFor="search">
            Search
          </label>

          <input
            id="search"
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, company, email, phone..."
          />

        </div>

        <div className="filter-group">

          <label htmlFor="statusFilter">
            Status
          </label>

          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">
              All Status
            </option>

            {statuses.map((status) => (
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

          <label htmlFor="priorityFilter">
            Priority
          </label>

          <select
            id="priorityFilter"
            value={priorityFilter}
            onChange={(event) => {
              setPriorityFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">
              All Priorities
            </option>

            {priorities.map((priority) => (
              <option
                key={priority}
                value={priority}
              >
                {priority}
              </option>
            ))}
          </select>

        </div>

        <div className="filter-group">

          <label htmlFor="typeFilter">
            Lead Type
          </label>

          <select
            id="typeFilter"
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">
              All Types
            </option>

            {leadTypes.map((type) => (
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
          className="secondary-button filter-clear"
          onClick={clearFilters}
        >
          Clear
        </button>

      </div>

      {/* =====================================================
          FORM
      ===================================================== */}

      {showForm && (
        <div className="form-card">

          <div className="form-card-header">

            <div>
              <h2>
                {editingId !== null
                  ? 'Edit Lead'
                  : 'Add Lead'}
              </h2>

              <p>
                Enter the lead information below.
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
                  Lead Name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter lead name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="company">
                  Company / Organization
                </label>

                <input
                  id="company"
                  name="company"
                  type="text"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company name"
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
                  placeholder="lead@example.com"
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
                  placeholder="Phone number"
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
                  placeholder="Hyderabad"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">
                  Lead Type
                </label>

                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  {leadTypes.map((type) => (
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
                <label htmlFor="source">
                  Lead Source
                </label>

                <select
                  id="source"
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                >
                  {sources.map((source) => (
                    <option
                      key={source}
                      value={source}
                    >
                      {source}
                    </option>
                  ))}
                </select>
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
                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">
                  Priority
                </label>

                <select
                  id="priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  {priorities.map((priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="interestedProgram">
                  Interested Program
                </label>

                <input
                  id="interestedProgram"
                  name="interestedProgram"
                  type="text"
                  value={form.interestedProgram}
                  onChange={handleChange}
                  placeholder="Data Science"
                />
              </div>

              <div className="form-group">
                <label htmlFor="assignedEmployeeId">
                  Assigned Employee ID
                </label>

                <input
                  id="assignedEmployeeId"
                  name="assignedEmployeeId"
                  type="number"
                  min="1"
                  value={form.assignedEmployeeId}
                  onChange={handleChange}
                  placeholder="Employee ID"
                />
              </div>

              <div className="form-group">
                <label htmlFor="estimatedValue">
                  Estimated Value
                </label>

                <input
                  id="estimatedValue"
                  name="estimatedValue"
                  type="number"
                  min="0"
                  value={form.estimatedValue}
                  onChange={handleChange}
                  placeholder="75000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="nextFollowUp">
                  Next Follow-up
                </label>

                <input
                  id="nextFollowUp"
                  name="nextFollowUp"
                  type="datetime-local"
                  value={form.nextFollowUp}
                  onChange={handleChange}
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
                  placeholder="Add notes about this lead..."
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
                    ? 'Update Lead'
                    : 'Create Lead'}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="table-card">

        <div className="table-header">

          <div>
            <h2>Lead List</h2>

            <span className="record-count">
              {total} total lead
              {total !== 1 ? 's' : ''}
            </span>
          </div>

        </div>

        {loading ? (
          <div className="loading-state">
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">

            <h3>No leads found</h3>

            <p>
              Try changing your filters or add a
              new lead.
            </p>

          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Value</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {leads.map((lead) => (
                  <tr key={lead.id}>

                    <td>
                      <strong>
                        #{lead.id}
                      </strong>
                    </td>

                    <td>

                      <strong>
                        {lead.name}
                      </strong>

                      {lead.company && (
                        <div className="lead-company">
                          {lead.company}
                        </div>
                      )}

                      {lead.city && (
                        <div className="lead-city">
                          📍 {lead.city}
                        </div>
                      )}

                    </td>

                    <td>
                      <div>
                        {lead.email || '-'}
                      </div>

                      <div>
                        {lead.phone || '-'}
                      </div>
                    </td>

                    <td>
                      {lead.type || '-'}
                    </td>

                    <td>
                      {lead.source || '-'}
                    </td>

                    <td>

                      <span
                        className={`status-badge ${getStatusClass(
                          lead.status,
                        )}`}
                      >
                        {lead.status || 'UNKNOWN'}
                      </span>

                    </td>

                    <td>

                      <span
                        className={`priority-badge ${getPriorityClass(
                          lead.priority,
                        )}`}
                      >
                        {lead.priority || 'MEDIUM'}
                      </span>

                    </td>

                    <td>
                      {formatCurrency(
                        lead.estimatedValue,
                      )}
                    </td>

                    <td>
                      {formatDateTime(
                        lead.nextFollowUp,
                      )}
                    </td>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <td>

                      <div className="action-buttons">

                        {/* VIEW DETAILS */}
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            navigate(`/leads/${lead.id}`)
                          }
                          title="View Lead Details"
                        >
                          View
                        </button>

                        {/* EDIT */}
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEdit(lead)
                          }
                        >
                          Edit
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(lead)
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

        {/* ===================================================
            PAGINATION
        =================================================== */}

        {!loading && totalPages > 1 && (
          <div className="pagination">

            <button
              className="secondary-button"
              disabled={page === 1}
              onClick={() =>
                setPage((previous) =>
                  Math.max(1, previous - 1),
                )
              }
            >
              ← Previous
            </button>

            <span>
              Page <strong>{page}</strong> of{' '}
              <strong>{totalPages}</strong>
            </span>

            <button
              className="secondary-button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((previous) =>
                  Math.min(
                    totalPages,
                    previous + 1,
                  ),
                )
              }
            >
              Next →
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default Leads;