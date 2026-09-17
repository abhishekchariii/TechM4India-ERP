import { useEffect, useState } from 'react';
import api from '../services/api';
import './Attendance.css';

interface Employee {
  id: number;
  name: string;
  position?: string;
}

interface Attendance {
  id: number;
  employeeId: number;
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: string;
  employee?: Employee | null;
}

interface AttendanceForm {
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

function Attendance() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<AttendanceForm>({
    employeeId: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'PRESENT',
  });

  const loadAttendance = async () => {
    try {
      setLoading(true);

      const response = await api.get<Attendance[]>('/attendance');

      setAttendance(response.data);
    } catch (error: any) {
      console.error('Failed to load attendance:', error);

      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to view attendance.');
      } else {
        alert('Failed to load attendance.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await api.get<Employee[]>('/employees');

      setEmployees(response.data);
    } catch (error: any) {
      console.error('Failed to load employees:', error);

      if (error.response?.status === 403) {
        alert('You do not have permission to view employees.');
      } else {
        alert('Failed to load employees.');
      }
    }
  };

  useEffect(() => {
    loadAttendance();
    loadEmployees();
  }, []);

  const resetForm = () => {
    setForm({
      employeeId: '',
      date: '',
      checkIn: '',
      checkOut: '',
      status: 'PRESENT',
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form.employeeId) {
      alert('Please select an employee.');
      return;
    }

    if (!form.date) {
      alert('Please select a date.');
      return;
    }

    if (!form.status.trim()) {
      alert('Please select attendance status.');
      return;
    }

    const payload = {
      employeeId: Number(form.employeeId),
      date: new Date(`${form.date}T00:00:00`).toISOString(),
      checkIn: form.checkIn
        ? new Date(form.checkIn).toISOString()
        : undefined,
      checkOut: form.checkOut
        ? new Date(form.checkOut).toISOString()
        : undefined,
      status: form.status,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.patch(`/attendance/${editingId}`, payload);

        alert('Attendance updated successfully.');
      } else {
        await api.post('/attendance', payload);

        alert('Attendance created successfully.');
      }

      resetForm();
      await loadAttendance();
    } catch (error: any) {
      console.error('Failed to save attendance:', error);

      if (error.response?.status === 403) {
        alert('You do not have permission to manage attendance.');
      } else if (error.response?.status === 400) {
        alert(
          error.response?.data?.message?.join?.(', ') ||
            'Please check the attendance details.',
        );
      } else {
        alert('Failed to save attendance.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record: Attendance) => {
    setEditingId(record.id);

    setForm({
      employeeId: String(record.employeeId),
      date: record.date
        ? record.date.substring(0, 10)
        : '',
      checkIn: record.checkIn
        ? record.checkIn.substring(0, 16)
        : '',
      checkOut: record.checkOut
        ? record.checkOut.substring(0, 16)
        : '',
      status: record.status,
    });

    setShowForm(true);
  };

  const handleDelete = async (record: Attendance) => {
    const employeeName =
      record.employee?.name ||
      `Employee #${record.employeeId}`;

    const confirmed = window.confirm(
      `Delete attendance record for ${employeeName}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/attendance/${record.id}`);

      alert('Attendance deleted successfully.');

      await loadAttendance();
    } catch (error: any) {
      console.error('Failed to delete attendance:', error);

      if (error.response?.status === 403) {
        alert('You do not have permission to delete attendance.');
      } else if (error.response?.status === 404) {
        alert('Attendance record was not found.');
      } else {
        alert('Failed to delete attendance.');
      }
    }
  };

  const getEmployeeName = (record: Attendance) => {
    if (record.employee?.name) {
      return record.employee.name;
    }

    const employee = employees.find(
      (item) => item.id === record.employeeId,
    );

    return employee?.name || `Employee #${record.employeeId}`;
  };

  const formatDate = (value: string) => {
    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleDateString();
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleString();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>Track employee attendance and working hours.</p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={loadAttendance}
            disabled={loading}
          >
            Refresh
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setEditingId(null);

              setForm({
                employeeId: '',
                date: '',
                checkIn: '',
                checkOut: '',
                status: 'PRESENT',
              });

              setShowForm(true);
            }}
          >
            + Add Attendance
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h2>
                {editingId !== null
                  ? 'Edit Attendance'
                  : 'Add Attendance'}
              </h2>

              <p>
                Record employee attendance information.
              </p>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
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
                    Select employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date *</label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkIn">
                  Check-in
                </label>

                <input
                  id="checkIn"
                  name="checkIn"
                  type="datetime-local"
                  value={form.checkIn}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="checkOut">
                  Check-out
                </label>

                <input
                  id="checkOut"
                  name="checkOut"
                  type="datetime-local"
                  value={form.checkOut}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">
                  Status *
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="LEAVE">Leave</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
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
                    ? 'Update Attendance'
                    : 'Create Attendance'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h2>Attendance Records</h2>

            <span>
              {attendance.length}{' '}
              {attendance.length === 1
                ? 'record'
                : 'records'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading attendance...
          </div>
        ) : attendance.length === 0 ? (
          <div className="empty-state">
            <h3>No attendance records found</h3>

            <p>
              Add an attendance record using the button above.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td>#{record.id}</td>

                    <td>
                      <strong>
                        {getEmployeeName(record)}
                      </strong>
                    </td>

                    <td>
                      {formatDate(record.date)}
                    </td>

                    <td>
                      {formatDateTime(record.checkIn)}
                    </td>

                    <td>
                      {formatDateTime(record.checkOut)}
                    </td>

                    <td>
                      <span className="status-badge">
                        {record.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEdit(record)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(record)
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

export default Attendance;