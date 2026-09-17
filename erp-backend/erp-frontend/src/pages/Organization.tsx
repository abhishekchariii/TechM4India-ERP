import { useEffect, useState } from 'react';
import api from '../services/api';
import './Organization.css';

interface Organization {
  id: number;
  name: string;
  legalName?: string;
  registrationDetails?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialLinks?: string;
  divisions?: unknown[];
  branches?: unknown[];
}

const initialForm = {
  name: '',
  legalName: '',
  registrationDetails: '',
  website: '',
  email: '',
  phone: '',
  address: '',
  socialLinks: '',
};

export default function Organization() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/organizations');
      setOrganizations(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load organization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const edit = (org: Organization) => {
    setEditingId(org.id);
    setForm({
      name: org.name || '',
      legalName: org.legalName || '',
      registrationDetails: org.registrationDetails || '',
      website: org.website || '',
      email: org.email || '',
      phone: org.phone || '',
      address: org.address || '',
      socialLinks: org.socialLinks || '',
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      if (editingId) {
        await api.patch(`/organizations/${editingId}`, form);
      } else {
        await api.post('/organizations', form);
      }

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save organization.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this organization?')) return;

    try {
      await api.delete(`/organizations/${id}`);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete organization.');
    }
  };

  return (
    <div className="organization-page">
      <div className="organization-header">
        <div>
          <h1>Organization</h1>
          <p>Manage company organization information.</p>
        </div>

        <button
          className="org-primary"
          onClick={() => {
            setEditingId(null);
            setForm(initialForm);
            setShowForm(true);
          }}
        >
          + Add Organization
        </button>
      </div>

      {error && <div className="org-error">{error}</div>}

      {showForm && (
        <form className="org-form" onSubmit={submit}>
          <h2>{editingId ? 'Edit Organization' : 'Add Organization'}</h2>

          <div className="org-grid">
            <label>
              Organization Name *
              <input name="name" value={form.name} onChange={change} required />
            </label>

            <label>
              Legal Name
              <input name="legalName" value={form.legalName} onChange={change} />
            </label>

            <label>
              Website
              <input name="website" value={form.website} onChange={change} />
            </label>

            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={change} />
            </label>

            <label>
              Phone
              <input name="phone" value={form.phone} onChange={change} />
            </label>

            <label>
              Registration Details
              <input
                name="registrationDetails"
                value={form.registrationDetails}
                onChange={change}
              />
            </label>

            <label className="org-full">
              Address
              <textarea name="address" value={form.address} onChange={change} />
            </label>

            <label className="org-full">
              Social Links
              <textarea name="socialLinks" value={form.socialLinks} onChange={change} />
            </label>
          </div>

          <div className="org-actions">
            <button
              type="button"
              className="org-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>

            <button className="org-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      )}

      <div className="org-list">
        {loading ? (
          <p>Loading organization...</p>
        ) : organizations.length === 0 ? (
          <p>No organization found.</p>
        ) : (
          organizations.map((org) => (
            <div className="org-card" key={org.id}>
              <div>
                <h2>{org.name}</h2>
                <p>{org.legalName || 'No legal name provided'}</p>

                <div className="org-details">
                  <span>📧 {org.email || '—'}</span>
                  <span>📞 {org.phone || '—'}</span>
                  <span>🌐 {org.website || '—'}</span>
                  <span>📍 {org.address || '—'}</span>
                </div>

                <div className="org-counts">
                  <span>{org.divisions?.length || 0} Divisions</span>
                  <span>{org.branches?.length || 0} Branches</span>
                </div>
              </div>

              <div className="org-card-actions">
                <button onClick={() => edit(org)}>Edit</button>
                <button className="danger" onClick={() => remove(org.id)}>
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