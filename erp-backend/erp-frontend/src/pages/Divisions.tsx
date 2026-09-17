import { useEffect, useState } from 'react';
import api from '../services/api';
import './Divisions.css';

interface Organization {
  id: number;
  name: string;
}

interface Division {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  organizationId: number;
  organization?: Organization;
  departments?: unknown[];
}

export default function Divisions() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    organizationId: 1,
    isActive: true,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);

      const [divisionRes, organizationRes] = await Promise.all([
        api.get('/divisions'),
        api.get('/organizations'),
      ]);

      setDivisions(divisionRes.data);
      setOrganizations(organizationRes.data);

      if (organizationRes.data.length && !editingId) {
        setForm((f) => ({
          ...f,
          organizationId: organizationRes.data[0].id,
        }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load divisions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = {
        ...form,
        organizationId: Number(form.organizationId),
      };

      if (editingId) {
        await api.patch(`/divisions/${editingId}`, payload);
      } else {
        await api.post('/divisions', payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm({
        name: '',
        description: '',
        organizationId: organizations[0]?.id || 1,
        isActive: true,
      });

      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save division.');
    } finally {
      setSaving(false);
    }
  };

  const edit = (division: Division) => {
    setEditingId(division.id);
    setForm({
      name: division.name,
      description: division.description || '',
      organizationId: division.organizationId,
      isActive: division.isActive,
    });
    setShowForm(true);
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this division?')) return;

    try {
      await api.delete(`/divisions/${id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete division.');
    }
  };

  return (
    <div className="divisions-page">
      <div className="divisions-header">
        <div>
          <h1>Divisions</h1>
          <p>Manage company divisions.</p>
        </div>

        <button
          className="division-primary"
          onClick={() => {
            setEditingId(null);
            setForm({
              name: '',
              description: '',
              organizationId: organizations[0]?.id || 1,
              isActive: true,
            });
            setShowForm(true);
          }}
        >
          + Add Division
        </button>
      </div>

      {error && <div className="division-error">{error}</div>}

      {showForm && (
        <form className="division-form" onSubmit={submit}>
          <h2>{editingId ? 'Edit Division' : 'Add Division'}</h2>

          <label>
            Division Name *
            <input
              value={form.name}
              required
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </label>

          <label>
            Organization *
            <select
              value={form.organizationId}
              onChange={(e) =>
                setForm({
                  ...form,
                  organizationId: Number(e.target.value),
                })
              }
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </label>

          <label className="division-checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({
                  ...form,
                  isActive: e.target.checked,
                })
              }
            />
            Active
          </label>

          <div className="division-actions">
            <button
              type="button"
              className="division-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

            <button
              className="division-primary"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Update'
                  : 'Create'}
            </button>
          </div>
        </form>
      )}

      <div className="division-grid">
        {loading ? (
          <p>Loading divisions...</p>
        ) : divisions.length === 0 ? (
          <p>No divisions found.</p>
        ) : (
          divisions.map((division) => (
            <div className="division-card" key={division.id}>
              <div className="division-card-top">
                <h2>{division.name}</h2>

                <span
                  className={
                    division.isActive
                      ? 'division-status active'
                      : 'division-status inactive'
                  }
                >
                  {division.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p>
                {division.description ||
                  'No description provided.'}
              </p>

              <div className="division-info">
                <span>
                  🏢 {division.organization?.name ||
                    `Organization #${division.organizationId}`}
                </span>

                <span>
                  👥 {division.departments?.length || 0}{' '}
                  Departments
                </span>
              </div>

              <div className="division-card-actions">
                <button onClick={() => edit(division)}>
                  Edit
                </button>

                <button
                  className="danger"
                  onClick={() => remove(division.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}