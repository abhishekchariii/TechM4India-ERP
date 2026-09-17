import { FormEvent, useEffect, useState } from 'react';
import api from '../services/api';
import './Leave.css';

type Employee = {
  id: number;
  name: string;
};

type LeaveRequest = {
  id: number;
  employeeId: number;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason?: string | null;
  status: string;
  approvedBy?: number | null;
  approvedAt?: string | null;
  createdAt: string;
  employee: Employee;
};

type LeaveForm = {
  employeeId: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
};

const initialForm: LeaveForm = {
  employeeId: '',
  startDate: '',
  endDate: '',
  leaveType: 'CASUAL',
  reason: '',
};

function Leave() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<LeaveForm>(initialForm);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [leaveResponse, employeeResponse] = await Promise.all([
        api.get('/leave'),
        api.get('/employees'),
      ]);

      setLeaves(leaveResponse.data);
      setEmployees(employeeResponse.data);
    } catch (err: any) {
      console.error('Failed to load leave data:', err);
      setError(
        err?.response?.data?.message ||
          'Unable to load leave data.',
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
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        employeeId: Number(form.employeeId),
        startDate: form.startDate,
        endDate: form.endDate,
        leaveType: form.leaveType,
        reason: form.reason || undefined,
      };

      if (editingId !== null) {
        await api.patch(`/leave/${editingId}`, payload);
        setSuccess('Leave request updated successfully.');
      } else {
        await api.post('/leave', payload);
        setSuccess('Leave request created successfully.');
      }

      resetForm();
      await loadData();
    } catch (err: any) {
      console.error('Failed to save leave:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to save leave request.',
      );
    } finally {
      setSaving(false);
    }
  };

  const edit = (leave: LeaveRequest) => {
    setEditingId(leave.id);

    setForm({
      employeeId: String(leave.employeeId),
      startDate: leave.startDate.slice(0, 10),
      endDate: leave.endDate.slice(0, 10),
      leaveType: leave.leaveType,
      reason: leave.reason || '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const updateStatus = async (
    id: number,
    status: 'APPROVED' | 'REJECTED',
  ) => {
    try {
      setError('');
      setSuccess('');

      await api.patch(`/leave/${id}`, {
        status,
      });

      setSuccess(`Leave request ${status.toLowerCase()}.`);
      await loadData();
    } catch (err: any) {
      console.error('Failed to update leave status:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to update leave status.',
      );
    }
  };

  const remove = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this leave request?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      await api.delete(`/leave/${id}`);

      setSuccess('Leave request deleted successfully.');

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (err: any) {
      console.error('Failed to delete leave:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to delete leave request.',
      );
    }
  };

  const filteredLeaves =
    statusFilter === 'ALL'
      ? leaves
      : leaves.filter(
          (leave) => leave.status === statusFilter,
        );

  const pendingCount = leaves.filter(
    (leave) => leave.status === 'PENDING',
  ).length;

  const approvedCount = leaves.filter(
    (leave) => leave.status === 'APPROVED',
  ).length;

  const rejectedCount = leaves.filter(
    (leave) => leave.status === 'REJECTED',
  ).length;

  return (
    <div className="leave-page">
      <div className="leave-header">
        <div>
          <h1>Leave Management</h1>
          <p>
            Manage employee leave requests, approvals and
            leave records.
          </p>
        </div>

        <button
          type="button"
          className="leave-refresh"
          onClick={loadData}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="leave-summary">
        <div className="leave-summary-card">
          <span>Total Requests</span>
          <strong>{leaves.length}</strong>
        </div>

        <div className="leave-summary-card pending">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className="leave-summary-card approved">
          <span>Approved</span>
          <strong>{approvedCount}</strong>
        </div>

        <div className="leave-summary-card rejected">
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
        </div>
      </div>

      {success && (
        <div className="leave-success">
          {success}
        </div>
      )}

      {error && (
        <div className="leave-error">
          {error}
        </div>
      )}

      <div className="leave-card">
        <div className="leave-card-header">
          <div>
            <h2>
              {editingId !== null
                ? 'Edit Leave Request'
                : 'Create Leave Request'}
            </h2>

            <p>
              Enter the employee and leave details below.
            </p>
          </div>

          {editingId !== null && (
            <button
              type="button"
              className="secondary-btn"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form className="leave-form" onSubmit={submit}>
          <div>
            <label htmlFor="employeeId">
              Employee *
            </label>

            <select
              id="employeeId"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Employee
              </option>

              {employees.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.name} — #{employee.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="leaveType">
              Leave Type *
            </label>

            <select
              id="leaveType"
              name="leaveType"
              value={form.leaveType}
              onChange={handleChange}
              required
            >
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="ANNUAL">Annual Leave</option>
              <option value="PERSONAL">Personal Leave</option>
              <option value="MATERNITY">Maternity Leave</option>
              <option value="PATERNITY">Paternity Leave</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate">
              Start Date *
            </label>

            <input
              id="startDate"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="endDate">
              End Date *
            </label>

            <input
              id="endDate"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="full-width">
            <label htmlFor="reason">
              Reason
            </label>

            <textarea
              id="reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Enter reason for leave..."
              rows={3}
            />
          </div>

          <div className="leave-form-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Leave'
                  : 'Create Leave'}
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={resetForm}
              disabled={saving}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="leave-card">
        <div className="leave-card-header">
          <div>
            <h2>Leave Requests</h2>
            <p>
              Review and manage employee leave requests.
            </p>
          </div>

          <select
            className="leave-filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="leave-empty">
            Loading leave requests...
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="leave-empty">
            No leave requests found.
          </div>
        ) : (
          <div className="leave-table-wrapper">
            <table className="leave-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>#{leave.id}</td>

                    <td>
                      <strong>
                        {leave.employee?.name ||
                          `Employee #${leave.employeeId}`}
                      </strong>
                    </td>

                    <td>
                      {leave.leaveType}
                    </td>

                    <td>
                      {new Date(
                        leave.startDate,
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {new Date(
                        leave.endDate,
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {leave.reason || '—'}
                    </td>

                    <td>
                      <span
                        className={`leave-status ${leave.status.toLowerCase()}`}
                      >
                        {leave.status}
                      </span>
                    </td>

                    <td>
                      <div className="leave-actions">
                        <button
                          type="button"
                          className="edit-btn"
                          onClick={() => edit(leave)}
                        >
                          Edit
                        </button>

                        {leave.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              className="approve-btn"
                              onClick={() =>
                                updateStatus(
                                  leave.id,
                                  'APPROVED',
                                )
                              }
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              className="reject-btn"
                              onClick={() =>
                                updateStatus(
                                  leave.id,
                                  'REJECTED',
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() =>
                            remove(leave.id)
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

export default Leave;