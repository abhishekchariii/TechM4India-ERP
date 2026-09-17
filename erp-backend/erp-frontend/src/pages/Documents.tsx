import { useEffect, useState } from 'react';
import api from '../services/api';
import './Documents.css';

interface DocumentItem {
  id: number;
  name: string;
  description?: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  uploadedBy?: number;
  createdAt: string;
}

const emptyForm = {
  name: '',
  description: '',
  fileUrl: '',
  fileType: '',
  fileSize: '',
  category: '',
};

function Documents() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to load documents.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError('Document name is required.');
      return;
    }

    if (!form.fileUrl.trim()) {
      setError('File URL is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        fileUrl: form.fileUrl.trim(),
      };

      if (form.description.trim()) {
        payload.description = form.description.trim();
      }

      if (form.fileType.trim()) {
        payload.fileType = form.fileType.trim();
      }

      if (form.fileSize !== '') {
        const fileSize = Number(form.fileSize);

        if (!Number.isInteger(fileSize) || fileSize < 0) {
          setError('File size must be a non-negative integer.');
          setSaving(false);
          return;
        }

        payload.fileSize = fileSize;
      }

      if (form.category.trim()) {
        payload.category = form.category.trim();
      }

      if (editingId !== null) {
        await api.patch(`/documents/${editingId}`, payload);
      } else {
        await api.post('/documents', payload);
      }

      resetForm();
      await loadDocuments();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to save document.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (document: DocumentItem) => {
    setEditingId(document.id);

    setForm({
      name: document.name || '',
      description: document.description || '',
      fileUrl: document.fileUrl || '',
      fileType: document.fileType || '',
      fileSize:
        document.fileSize !== undefined &&
        document.fileSize !== null
          ? String(document.fileSize)
          : '',
      category: document.category || '',
    });

    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this document?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await api.delete(`/documents/${id}`);

      if (editingId === id) {
        resetForm();
      }

      await loadDocuments();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to delete document.',
      );
    }
  };

  const formatDate = (value: string) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatSize = (size?: number) => {
    if (size === undefined || size === null) {
      return '-';
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="documents-page">
      <div className="documents-header">
        <div>
          <h1>Documents</h1>
          <p>
            Manage company documents and important files.
          </p>
        </div>

        <div className="documents-count">
          <strong>{documents.length}</strong>
          <span>Total Documents</span>
        </div>
      </div>

      {error && (
        <div className="documents-error">
          {error}
        </div>
      )}

      <div className="documents-form-card">
        <div className="section-heading">
          <div>
            <h2>
              {editingId !== null
                ? 'Edit Document'
                : 'Add Document'}
            </h2>

            <p>
              Store document metadata and its file location.
            </p>
          </div>

          {editingId !== null && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form
          className="documents-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>Document Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Company Profile"
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. HR, Finance, Legal"
              maxLength={100}
            />
          </div>

          <div className="form-group full-width">
            <label>File URL *</label>
            <input
              name="fileUrl"
              type="url"
              value={form.fileUrl}
              onChange={handleChange}
              placeholder="https://example.com/document.pdf"
            />
          </div>

          <div className="form-group">
            <label>File Type</label>
            <input
              name="fileType"
              value={form.fileType}
              onChange={handleChange}
              placeholder="e.g. application/pdf"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>File Size (bytes)</label>
            <input
              name="fileSize"
              type="number"
              min="0"
              step="1"
              value={form.fileSize}
              onChange={handleChange}
              placeholder="e.g. 245760"
            />
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the document"
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Document'
                  : 'Create Document'}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
              disabled={saving}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="documents-table-card">
        <div className="section-heading">
          <div>
            <h2>Document Repository</h2>
            <p>
              View and manage stored document records.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No documents found</h3>
            <p>
              Add your first document using the form above.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Document</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((document) => (
                  <tr key={document.id}>
                    <td>#{document.id}</td>

                    <td>
                      <div className="document-name">
                        <strong>{document.name}</strong>

                        {document.description && (
                          <span>
                            {document.description}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="category-badge">
                        {document.category || 'General'}
                      </span>
                    </td>

                    <td>
                      {document.fileType || '-'}
                    </td>

                    <td>
                      {formatSize(document.fileSize)}
                    </td>

                    <td>
                      {formatDate(document.createdAt)}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <a
                          href={document.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="view-button"
                        >
                          View
                        </a>

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEdit(document)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(document.id)
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

export default Documents;