import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import './LeadDetails.css';

interface Lead {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  type?: string | null;
  city?: string | null;
  source?: string | null;
  status: string;
  priority: string;
  interestedProgram?: string | null;
  assignedEmployeeId?: number | null;
  estimatedValue?: number | null;
  notes?: string | null;
  nextFollowUp?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: number;
  leadId: number;
  type: string;
  description: string;
  createdAt: string;
}

interface FollowUp {
  id: number;
  leadId: number;
  followUpAt: string;
  type?: string | null;
  notes?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const activityTypes = [
  'CALL',
  'EMAIL',
  'WHATSAPP',
  'MEETING',
  'NOTE',
  'OTHER',
];

const followUpTypes = [
  'CALL',
  'EMAIL',
  'WHATSAPP',
  'MEETING',
  'OTHER',
];

const leadStatuses = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'MEETING',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
];

const leadPriorities = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
];

function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [activityForm, setActivityForm] = useState({
    type: 'CALL',
    description: '',
  });

  const [followUpForm, setFollowUpForm] = useState({
    followUpAt: '',
    type: 'CALL',
    notes: '',
    status: 'PENDING',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    city: '',
    status: 'NEW',
    priority: 'MEDIUM',
    interestedProgram: '',
    estimatedValue: '',
    notes: '',
    nextFollowUp: '',
  });

  const formatDate = (date?: string | null) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (date?: string | null) => {
    if (!date) return '—';

    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) return '—';

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const loadLead = async () => {
    if (!id) return;

    const response = await api.get<Lead>(`/leads/${id}`);
    setLead(response.data);

    setEditForm({
      name: response.data.name || '',
      email: response.data.email || '',
      phone: response.data.phone || '',
      company: response.data.company || '',
      city: response.data.city || '',
      status: response.data.status || 'NEW',
      priority: response.data.priority || 'MEDIUM',
      interestedProgram: response.data.interestedProgram || '',
      estimatedValue:
        response.data.estimatedValue !== null &&
        response.data.estimatedValue !== undefined
          ? String(response.data.estimatedValue)
          : '',
      notes: response.data.notes || '',
      nextFollowUp: response.data.nextFollowUp
        ? response.data.nextFollowUp.slice(0, 16)
        : '',
    });
  };

  const loadActivities = async () => {
    if (!id) return;

    const response = await api.get<Activity[]>(
      `/leads/${id}/activities`,
    );

    setActivities(response.data);
  };

  const loadFollowUps = async () => {
    if (!id) return;

    const response = await api.get<FollowUp[]>(
      `/leads/${id}/follow-ups`,
    );

    setFollowUps(response.data);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');

      await Promise.all([
        loadLead(),
        loadActivities(),
        loadFollowUps(),
      ]);
    } catch (err: any) {
      console.error(err);

      if (err?.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err?.response?.status === 404) {
        setError('Lead not found.');
      } else {
        setError(
          err?.response?.data?.message ||
            'Unable to load lead details.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const handleActivitySubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!id || !activityForm.description.trim()) return;

    try {
      setActionLoading(true);

      await api.post(`/leads/${id}/activities`, {
        type: activityForm.type,
        description: activityForm.description.trim(),
      });

      setActivityForm({
        type: 'CALL',
        description: '',
      });

      setShowActivityForm(false);

      await loadActivities();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          'Failed to add activity.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleFollowUpSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!id || !followUpForm.followUpAt) return;

    try {
      setActionLoading(true);

      await api.post(`/leads/${id}/follow-ups`, {
        followUpAt: new Date(
          followUpForm.followUpAt,
        ).toISOString(),
        type: followUpForm.type,
        notes: followUpForm.notes.trim() || undefined,
        status: followUpForm.status,
      });

      setFollowUpForm({
        followUpAt: '',
        type: 'CALL',
        notes: '',
        status: 'PENDING',
      });

      setShowFollowUpForm(false);

      await loadFollowUps();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          'Failed to schedule follow-up.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!id || !editForm.name.trim()) return;

    try {
      setActionLoading(true);

      await api.patch(`/leads/${id}`, {
        name: editForm.name.trim(),
        email: editForm.email.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        company: editForm.company.trim() || undefined,
        city: editForm.city.trim() || undefined,
        status: editForm.status,
        priority: editForm.priority,
        interestedProgram:
          editForm.interestedProgram.trim() || undefined,
        estimatedValue: editForm.estimatedValue
          ? Number(editForm.estimatedValue)
          : undefined,
        notes: editForm.notes.trim() || undefined,
        nextFollowUp: editForm.nextFollowUp
          ? new Date(editForm.nextFollowUp).toISOString()
          : undefined,
      });

      setShowEditForm(false);

      await loadLead();

      alert('Lead updated successfully.');
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          'Failed to update lead.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !lead) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${lead.name}"?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      await api.delete(`/leads/${id}`);

      alert('Lead deleted successfully.');

      navigate('/leads');
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          'Failed to delete lead.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    return `detail-status status-${status
      .toLowerCase()
      .replace(/\s+/g, '-')}`;
  };

  const getPriorityClass = (priority: string) => {
    return `detail-priority priority-${priority
      .toLowerCase()
      .replace(/\s+/g, '-')}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CALL':
        return '📞';
      case 'EMAIL':
        return '✉️';
      case 'WHATSAPP':
        return '💬';
      case 'MEETING':
        return '🤝';
      case 'NOTE':
        return '📝';
      default:
        return '📌';
    }
  };

  const getFollowUpIcon = (type?: string | null) => {
    switch (type) {
      case 'CALL':
        return '📞';
      case 'EMAIL':
        return '✉️';
      case 'WHATSAPP':
        return '💬';
      case 'MEETING':
        return '🤝';
      default:
        return '📅';
    }
  };

  if (loading) {
    return (
      <div className="lead-details-page">
        <div className="lead-details-loading">
          <div className="loading-spinner" />
          <p>Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="lead-details-page">
        <div className="lead-details-error">
          <div className="error-icon">⚠️</div>
          <h2>{error || 'Lead not found'}</h2>
          <button
            className="primary-button"
            onClick={() => navigate('/leads')}
          >
            ← Back to Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lead-details-page">

      {/* Header */}
      <div className="lead-details-header">
        <div className="header-left">
          <button
            className="back-button"
            onClick={() => navigate('/leads')}
          >
            ← Back to Leads
          </button>

          <div className="lead-title-area">
            <div className="lead-avatar">
              {lead.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1>{lead.name}</h1>

              <div className="lead-subtitle">
                {lead.company || 'Individual Lead'}
                {lead.city && ` • ${lead.city}`}
              </div>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="secondary-button"
            onClick={() => setShowEditForm(!showEditForm)}
          >
            ✏️ Edit
          </button>

          <button
            className="danger-button"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="lead-summary-grid">

        <div className="lead-summary-card">
          <span>Status</span>
          <strong className={getStatusClass(lead.status)}>
            {lead.status}
          </strong>
        </div>

        <div className="lead-summary-card">
          <span>Priority</span>
          <strong className={getPriorityClass(lead.priority)}>
            {lead.priority}
          </strong>
        </div>

        <div className="lead-summary-card">
          <span>Estimated Value</span>
          <strong>
            {formatCurrency(lead.estimatedValue)}
          </strong>
        </div>

        <div className="lead-summary-card">
          <span>Created</span>
          <strong>
            {formatDate(lead.createdAt)}
          </strong>
        </div>

      </div>

      <div className="lead-details-layout">

        {/* LEFT */}
        <div className="lead-details-main">

          {/* Lead Information */}
          <section className="details-card">

            <div className="card-heading">
              <div>
                <h2>Lead Information</h2>
                <p>Basic information about this lead</p>
              </div>
            </div>

            <div className="details-grid">

              <div className="detail-item">
                <span>Name</span>
                <strong>{lead.name}</strong>
              </div>

              <div className="detail-item">
                <span>Lead Type</span>
                <strong>{lead.type || '—'}</strong>
              </div>

              <div className="detail-item">
                <span>Email</span>
                <strong>
                  {lead.email ? (
                    <a href={`mailto:${lead.email}`}>
                      {lead.email}
                    </a>
                  ) : (
                    '—'
                  )}
                </strong>
              </div>

              <div className="detail-item">
                <span>Phone</span>
                <strong>
                  {lead.phone ? (
                    <a href={`tel:${lead.phone}`}>
                      {lead.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </strong>
              </div>

              <div className="detail-item">
                <span>Company</span>
                <strong>{lead.company || '—'}</strong>
              </div>

              <div className="detail-item">
                <span>City</span>
                <strong>{lead.city || '—'}</strong>
              </div>

              <div className="detail-item">
                <span>Source</span>
                <strong>{lead.source || '—'}</strong>
              </div>

              <div className="detail-item">
                <span>Interested Program</span>
                <strong>
                  {lead.interestedProgram || '—'}
                </strong>
              </div>

              <div className="detail-item">
                <span>Assigned Employee</span>
                <strong>
                  {lead.assignedEmployeeId || 'Not Assigned'}
                </strong>
              </div>

              <div className="detail-item">
                <span>Next Follow-up</span>
                <strong>
                  {formatDateTime(lead.nextFollowUp)}
                </strong>
              </div>

            </div>

            {lead.notes && (
              <div className="notes-section">
                <span>Notes</span>
                <p>{lead.notes}</p>
              </div>
            )}

          </section>

          {/* Activities */}
          <section className="details-card">

            <div className="card-heading">
              <div>
                <h2>Activity Timeline</h2>
                <p>
                  Track communication and interactions
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() =>
                  setShowActivityForm(!showActivityForm)
                }
              >
                + Add Activity
              </button>
            </div>

            {showActivityForm && (
              <form
                className="inline-form"
                onSubmit={handleActivitySubmit}
              >
                <div className="form-row">

                  <div className="form-field">
                    <label>Activity Type</label>

                    <select
                      value={activityForm.type}
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          type: e.target.value,
                        })
                      }
                    >
                      {activityTypes.map((type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field form-field-wide">
                    <label>Description</label>

                    <input
                      type="text"
                      value={activityForm.description}
                      onChange={(e) =>
                        setActivityForm({
                          ...activityForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter activity description"
                      required
                    />
                  </div>

                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() =>
                      setShowActivityForm(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={actionLoading}
                  >
                    {actionLoading
                      ? 'Saving...'
                      : 'Save Activity'}
                  </button>
                </div>
              </form>
            )}

            {activities.length === 0 ? (
              <div className="empty-section">
                <div>📝</div>
                <p>No activities recorded yet.</p>
              </div>
            ) : (
              <div className="timeline">

                {activities.map((activity) => (
                  <div
                    className="timeline-item"
                    key={activity.id}
                  >
                    <div className="timeline-icon">
                      {getActivityIcon(activity.type)}
                    </div>

                    <div className="timeline-content">
                      <div className="timeline-top">
                        <strong>
                          {activity.type}
                        </strong>

                        <span>
                          {formatDateTime(
                            activity.createdAt,
                          )}
                        </span>
                      </div>

                      <p>{activity.description}</p>
                    </div>
                  </div>
                ))}

              </div>
            )}

          </section>

        </div>

        {/* RIGHT */}
        <div className="lead-details-sidebar">

          {/* Contact Card */}
          <section className="details-card">

            <div className="card-heading">
              <div>
                <h2>Contact</h2>
                <p>Quick communication</p>
              </div>
            </div>

            <div className="contact-actions">

              {lead.phone && (
                <a
                  className="contact-action"
                  href={`tel:${lead.phone}`}
                >
                  <span>📞</span>
                  <div>
                    <strong>Call</strong>
                    <small>{lead.phone}</small>
                  </div>
                </a>
              )}

              {lead.email && (
                <a
                  className="contact-action"
                  href={`mailto:${lead.email}`}
                >
                  <span>✉️</span>
                  <div>
                    <strong>Email</strong>
                    <small>{lead.email}</small>
                  </div>
                </a>
              )}

              {!lead.phone && !lead.email && (
                <div className="no-contact">
                  No contact information available.
                </div>
              )}

            </div>

          </section>

          {/* Follow Ups */}
          <section className="details-card">

            <div className="card-heading">
              <div>
                <h2>Follow-ups</h2>
                <p>Upcoming scheduled actions</p>
              </div>

              <button
                className="primary-button small-button"
                onClick={() =>
                  setShowFollowUpForm(!showFollowUpForm)
                }
              >
                + Add
              </button>
            </div>

            {showFollowUpForm && (
              <form
                className="inline-form"
                onSubmit={handleFollowUpSubmit}
              >

                <div className="form-field">
                  <label>Date & Time</label>

                  <input
                    type="datetime-local"
                    value={followUpForm.followUpAt}
                    onChange={(e) =>
                      setFollowUpForm({
                        ...followUpForm,
                        followUpAt: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Type</label>

                  <select
                    value={followUpForm.type}
                    onChange={(e) =>
                      setFollowUpForm({
                        ...followUpForm,
                        type: e.target.value,
                      })
                    }
                  >
                    {followUpTypes.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Status</label>

                  <select
                    value={followUpForm.status}
                    onChange={(e) =>
                      setFollowUpForm({
                        ...followUpForm,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="PENDING">
                      PENDING
                    </option>
                    <option value="COMPLETED">
                      COMPLETED
                    </option>
                    <option value="CANCELLED">
                      CANCELLED
                    </option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Notes</label>

                  <textarea
                    value={followUpForm.notes}
                    onChange={(e) =>
                      setFollowUpForm({
                        ...followUpForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Follow-up notes"
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() =>
                      setShowFollowUpForm(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={actionLoading}
                  >
                    {actionLoading
                      ? 'Saving...'
                      : 'Schedule'}
                  </button>
                </div>

              </form>
            )}

            {followUps.length === 0 ? (
              <div className="empty-section">
                <div>📅</div>
                <p>No follow-ups scheduled.</p>
              </div>
            ) : (
              <div className="follow-up-list">

                {followUps.map((followUp) => (
                  <div
                    className="follow-up-item"
                    key={followUp.id}
                  >
                    <div className="follow-up-icon">
                      {getFollowUpIcon(followUp.type)}
                    </div>

                    <div className="follow-up-content">
                      <div className="follow-up-title">
                        <strong>
                          {followUp.type || 'FOLLOW-UP'}
                        </strong>

                        <span
                          className={`follow-up-status follow-${followUp.status.toLowerCase()}`}
                        >
                          {followUp.status}
                        </span>
                      </div>

                      <div className="follow-up-date">
                        {formatDateTime(
                          followUp.followUpAt,
                        )}
                      </div>

                      {followUp.notes && (
                        <p>{followUp.notes}</p>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            )}

          </section>

        </div>

      </div>

      {/* Edit Form */}
      {showEditForm && (
        <section className="details-card edit-card">

          <div className="card-heading">
            <div>
              <h2>Edit Lead</h2>
              <p>Update lead information</p>
            </div>
          </div>

          <form onSubmit={handleEditSubmit}>

            <div className="edit-grid">

              <div className="form-field">
                <label>Name *</label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Phone</label>
                <input
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Company</label>
                <input
                  value={editForm.company}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      company: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>City</label>
                <input
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      city: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Status</label>

                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value,
                    })
                  }
                >
                  {leadStatuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Priority</label>

                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      priority: e.target.value,
                    })
                  }
                >
                  {leadPriorities.map((priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Interested Program</label>
                <input
                  value={editForm.interestedProgram}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      interestedProgram: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Estimated Value</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.estimatedValue}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      estimatedValue: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field">
                <label>Next Follow-up</label>
                <input
                  type="datetime-local"
                  value={editForm.nextFollowUp}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      nextFollowUp: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-field full-width">
                <label>Notes</label>

                <textarea
                  rows={4}
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      notes: e.target.value,
                    })
                  }
                />
              </div>

            </div>

            <div className="form-actions edit-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowEditForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={actionLoading}
              >
                {actionLoading
                  ? 'Updating...'
                  : 'Save Changes'}
              </button>

            </div>

          </form>

        </section>
      )}

    </div>
  );
}

export default LeadDetails;