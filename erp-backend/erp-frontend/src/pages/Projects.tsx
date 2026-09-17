import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './Projects.css';

interface Employee {
  id: number;
  name: string;
  position?: string | null;
}

interface Project {
  id: number;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  employees?: Employee[];
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

const emptyForm: ProjectForm = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'PLANNING',
};

const statusOptions = [
  'PLANNING',
  'IN_PROGRESS',
  'COMPLETED',
  'ON_HOLD',
];

function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<ProjectForm>(emptyForm);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);

      const response =
        await api.get<Project[]>('/projects');

      setProjects(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to view projects.');
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to load projects.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
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
      alert('Project name is required.');
      return;
    }

    if (!form.startDate) {
      alert('Start date is required.');
      return;
    }

    if (
      form.endDate &&
      new Date(form.endDate) <
        new Date(form.startDate)
    ) {
      alert(
        'End date cannot be before the start date.',
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        description:
          form.description.trim() || undefined,
        startDate: new Date(
          `${form.startDate}T00:00:00`,
        ).toISOString(),
        endDate: form.endDate
          ? new Date(
              `${form.endDate}T00:00:00`,
            ).toISOString()
          : undefined,
        status: form.status,
      };

      if (editingId !== null) {
        await api.patch(
          `/projects/${editingId}`,
          payload,
        );

        alert('Project updated successfully.');
      } else {
        await api.post(
          '/projects',
          payload,
        );

        alert('Project created successfully.');
      }

      resetForm();
      await loadProjects();
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert(
          'You do not have permission to manage projects.',
        );
      } else if (error.response?.status === 400) {
        const message =
          error.response?.data?.message;

        alert(
          Array.isArray(message)
            ? message.join('\n')
            : message ||
                'Invalid project details.',
        );
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to save project.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);

    setForm({
      name: project.name || '',
      description: project.description || '',
      startDate: project.startDate
        ? project.startDate.substring(0, 10)
        : '',
      endDate: project.endDate
        ? project.endDate.substring(0, 10)
        : '',
      status: project.status || 'PLANNING',
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (
    project: Project,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/projects/${project.id}`,
      );

      alert('Project deleted successfully.');

      await loadProjects();
    } catch (error: any) {
      if (error.response?.status === 403) {
        alert(
          'You do not have permission to delete projects.',
        );
      } else {
        alert(
          error.response?.data?.message ||
            'Failed to delete project.',
        );
      }
    }
  };

  const formatDate = (
    value?: string | null,
  ) => {
    if (!value) {
      return '-';
    }

    return new Date(
      value,
    ).toLocaleDateString('en-IN');
  };

  const getStatusClass = (
    status?: string,
  ) => {
    switch (
      (status || '').toUpperCase()
    ) {
      case 'PLANNING':
        return 'status-planning';

      case 'IN_PROGRESS':
        return 'status-progress';

      case 'COMPLETED':
        return 'status-completed';

      case 'ON_HOLD':
        return 'status-hold';

      default:
        return 'status-default';
    }
  };

  const getStatusLabel = (
    status?: string,
  ) => {
    switch (
      (status || '').toUpperCase()
    ) {
      case 'IN_PROGRESS':
        return 'In Progress';

      case 'ON_HOLD':
        return 'On Hold';

      case 'PLANNING':
        return 'Planning';

      case 'COMPLETED':
        return 'Completed';

      default:
        return status || 'Unknown';
    }
  };

  const filteredProjects = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !searchValue ||
        project.name
          .toLowerCase()
          .includes(searchValue) ||
        project.description
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        !statusFilter ||
        project.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    projects,
    search,
    statusFilter,
  ]);

  const planningCount = projects.filter(
    (project) =>
      project.status === 'PLANNING',
  ).length;

  const progressCount = projects.filter(
    (project) =>
      project.status === 'IN_PROGRESS',
  ).length;

  const completedCount = projects.filter(
    (project) =>
      project.status === 'COMPLETED',
  ).length;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Projects</h1>

          <p>
            Manage internal, R&amp;D, and client
            projects, timelines, status, and teams.
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
          + Add Project
        </button>
      </div>

      {/* Summary */}
      <div className="project-summary">

        <div className="summary-card">
          <div className="summary-icon">
            📁
          </div>

          <div>
            <span>Total Projects</span>
            <strong>
              {projects.length}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            📋
          </div>

          <div>
            <span>Planning</span>
            <strong>
              {planningCount}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            🔄
          </div>

          <div>
            <span>In Progress</span>
            <strong>
              {progressCount}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            ✅
          </div>

          <div>
            <span>Completed</span>
            <strong>
              {completedCount}
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
                  ? 'Edit Project'
                  : 'Add Project'}
              </h2>

              <p className="form-subtitle">
                Enter project information below.
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
                  Project Name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  maxLength={255}
                  required
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
                  {statusOptions.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {getStatusLabel(status)}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startDate">
                  Start Date *
                </label>

                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">
                  End Date
                </label>

                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  min={form.startDate || undefined}
                  value={form.endDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the project..."
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
                    ? 'Update Project'
                    : 'Create Project'}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-card">

        <div className="filter-group search-filter">
          <label htmlFor="project-search">
            Search
          </label>

          <input
            id="project-search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search project name or description..."
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
            <option value="">
              All Status
            </option>

            {statusOptions.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {getStatusLabel(status)}
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
            <h2>Project List</h2>

            <p className="table-subtitle">
              View and manage all projects.
            </p>
          </div>

          <span className="record-count">
            {filteredProjects.length}
            {' '}
            project
            {filteredProjects.length !== 1
              ? 's'
              : ''}
          </span>

        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />

            <p>
              Loading projects...
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              📁
            </div>

            <h3>
              {projects.length === 0
                ? 'No projects found'
                : 'No matching projects'}
            </h3>

            <p>
              {projects.length === 0
                ? 'Add your first project using the button above.'
                : 'Try changing your search or filters.'}
            </p>

            {projects.length > 0 && (
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
                  <th>Project</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Team</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredProjects.map(
                  (project) => (
                    <tr
                      key={project.id}
                    >

                      <td>
                        <span className="id-badge">
                          #{project.id}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {project.name}
                        </strong>

                        {project.description && (
                          <div className="description-preview">
                            {project.description}
                          </div>
                        )}
                      </td>

                      <td>
                        {formatDate(
                          project.startDate,
                        )}
                      </td>

                      <td>
                        {formatDate(
                          project.endDate,
                        )}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            project.status,
                          )}`}
                        >
                          {getStatusLabel(
                            project.status,
                          )}
                        </span>
                      </td>

                      <td>
                        {project.employees &&
                        project.employees.length >
                          0 ? (
                          <div className="team-list">

                            {project.employees
                              .slice(0, 3)
                              .map(
                                (
                                  employee,
                                ) => (
                                  <span
                                    key={
                                      employee.id
                                    }
                                    className="team-member"
                                  >
                                    {
                                      employee.name
                                    }
                                  </span>
                                ),
                              )}

                            {project.employees
                              .length > 3 && (
                              <span className="team-more">
                                +
                                {project
                                  .employees
                                  .length -
                                  3}{' '}
                                more
                              </span>
                            )}

                          </div>
                        ) : (
                          <span className="no-team">
                            No team assigned
                          </span>
                        )}
                      </td>

                      <td>
                        {formatDate(
                          project.createdAt,
                        )}
                      </td>

                      <td>
                        <div className="action-buttons">

                          <button
                            type="button"
                            className="edit-button"
                            onClick={() =>
                              handleEdit(
                                project,
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
                                project,
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

export default Projects;