import { useEffect, useState } from 'react';
import api from '../services/api';
import './Departments.css';

interface Department {
  id: number;
  name: string;
}

function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadDepartments = async () => {
    try {
      setLoading(true);

      const response = await api.get<Department[]>('/departments');

      setDepartments(response.data);
    } catch (error: any) {
      console.error('Failed to load departments:', error);

      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to view departments.');
      } else {
        alert('Failed to load departments.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const resetForm = () => {
    setName('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      alert('Please enter department name.');
      return;
    }

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.patch(`/departments/${editingId}`, {
          name: name.trim(),
        });

        alert('Department updated successfully.');
      } else {
        await api.post('/departments', {
          name: name.trim(),
        });

        alert('Department created successfully.');
      }

      resetForm();
      await loadDepartments();
    } catch (error: any) {
      console.error('Failed to save department:', error);

      if (error.response?.status === 403) {
        alert('You do not have permission to manage departments.');
      } else if (error.response?.status === 400) {
        alert(
          error.response?.data?.message?.join?.(', ') ||
            'Please check the department name.',
        );
      } else {
        alert('Failed to save department.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingId(department.id);
    setName(department.name);
    setShowForm(true);
  };

  const handleDelete = async (department: Department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${department.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/departments/${department.id}`);

      alert('Department deleted successfully.');

      await loadDepartments();
    } catch (error: any) {
      console.error('Failed to delete department:', error);

      if (error.response?.status === 403) {
        alert('You do not have permission to delete departments.');
      } else if (error.response?.status === 404) {
        alert('Department was not found.');
      } else {
        alert(
          'Failed to delete department. It may still be assigned to employees.',
        );
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Departments</h1>
          <p>Manage company departments.</p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={loadDepartments}
            disabled={loading}
          >
            Refresh
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setEditingId(null);
              setName('');
              setShowForm(true);
            }}
          >
            + Add Department
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-card-header">
            <div>
              <h2>
                {editingId !== null
                  ? 'Edit Department'
                  : 'Add Department'}
              </h2>

              <p>
                {editingId !== null
                  ? 'Update the department name.'
                  : 'Enter the department name.'}
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
            <div className="form-group">
              <label htmlFor="department-name">
                Department Name *
              </label>

              <input
                id="department-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter department name"
                required
              />
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
                    ? 'Update Department'
                    : 'Create Department'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-card-header">
          <div>
            <h2>Department List</h2>

            <span>
              {departments.length}{' '}
              {departments.length === 1
                ? 'department'
                : 'departments'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading departments...
          </div>
        ) : departments.length === 0 ? (
          <div className="empty-state">
            <h3>No departments found</h3>

            <p>
              Add your first department using the button above.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Department Name</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {departments.map((department) => (
                  <tr key={department.id}>
                    <td>#{department.id}</td>

                    <td>
                      <strong>{department.name}</strong>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEdit(department)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(department)
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

export default Departments;