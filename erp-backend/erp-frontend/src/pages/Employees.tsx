import { useEffect, useState } from 'react';
import api from '../services/api';
import './Employees.css';
interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  position: string;
  departmentId: number;
  department?: Department | null;
}

interface EmployeeForm {
  name: string;
  email: string;
  phone: string;
  position: string;
  departmentId: string;
}

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<EmployeeForm>({
    name: '',
    email: '',
    phone: '',
    position: '',
    departmentId: '',
  });

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const response = await api.get<Employee[]>('/employees');

      setEmployees(response.data);
    } catch (error: any) {
      console.error('Failed to load employees:', error);

      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to view employees.');
      } else {
        alert('Failed to load employees.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.get<Department[]>('/departments');

      setDepartments(response.data);
    } catch (error: any) {
      console.error('Failed to load departments:', error);

      if (error.response?.status === 403) {
        alert('You do not have permission to view departments.');
      } else {
        alert('Failed to load departments.');
      }
    }
  };

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      position: '',
      departmentId: '',
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

    if (!form.name.trim()) {
      alert('Please enter employee name.');
      return;
    }

    if (!form.email.trim()) {
      alert('Please enter employee email.');
      return;
    }

    if (!form.position.trim()) {
      alert('Please enter employee position.');
      return;
    }

    if (!form.departmentId) {
      alert('Please select a department.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      position: form.position.trim(),
      departmentId: Number(form.departmentId),
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.patch(`/employees/${editingId}`, payload);
        alert('Employee updated successfully.');
      } else {
        await api.post('/employees', payload);
        alert('Employee created successfully.');
      }

      resetForm();
      await loadEmployees();
    } catch (error: any) {
      console.error('Failed to save employee:', error);

      if (error.response?.status === 403) {
        alert('You do not have permission to manage employees.');
      } else if (error.response?.status === 400) {
        alert(
          error.response?.data?.message?.join?.(', ') ||
            'Please check the employee details.',
        );
      } else {
        alert('Failed to save employee.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);

    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone ?? '',
      position: employee.position,
      departmentId: String(employee.departmentId),
    });

    setShowForm(true);
  };

  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/employees/${employee.id}`);

      alert('Employee deleted successfully.');

      await loadEmployees();
    } catch (error: any) {
      console.error('Failed to delete employee:', error);

      if (error.response?.status === 403) {
        alert('You do not have permission to delete employees.');
      } else if (error.response?.status === 404) {
        alert('Employee was not found.');
      } else {
        alert('Failed to delete employee.');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Employees</h1>
          <p>Manage company employees and their departments.</p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={loadEmployees}
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
                name: '',
                email: '',
                phone: '',
                position: '',
                departmentId: '',
              });

              setShowForm(true);
            }}
          >
            + Add Employee
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h2>
                {editingId !== null
                  ? 'Edit Employee'
                  : 'Add Employee'}
              </h2>

              <p>
                {editingId !== null
                  ? 'Update employee information.'
                  : 'Enter the employee details below.'}
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
                <label htmlFor="name">Name *</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="employee@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>

                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="position">Position *</label>

                <input
                  id="position"
                  name="position"
                  type="text"
                  value={form.position}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="departmentId">
                  Department *
                </label>

                <select
                  id="departmentId"
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select department
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  ))}
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
                    ? 'Update Employee'
                    : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h2>Employee List</h2>
            <span>
              {employees.length}{' '}
              {employees.length === 1
                ? 'employee'
                : 'employees'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading employees...
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <h3>No employees found</h3>
            <p>
              Add your first employee using the button above.
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
                  <th>Position</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>#{employee.id}</td>

                    <td>
                      <strong>{employee.name}</strong>
                    </td>

                    <td>{employee.email}</td>

                    <td>
                      {employee.phone || '—'}
                    </td>

                    <td>{employee.position}</td>

                    <td>
                      {employee.department?.name ||
                        `Department #${employee.departmentId}`}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEdit(employee)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(employee)
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

export default Employees;