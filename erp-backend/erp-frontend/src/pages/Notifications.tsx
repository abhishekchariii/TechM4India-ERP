import { useEffect, useState } from 'react';
import api from '../services/api';
import './Notifications.css';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  userId?: number;
  createdAt: string;
}

const emptyForm = {
  title: '',
  message: '',
  type: 'INFO',
  userId: '',
  isRead: false,
};

function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Failed to load notifications.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === 'isRead'
          ? value === 'true'
          : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Notification title is required.');
      return;
    }

    if (!form.message.trim()) {
      setError('Notification message is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        isRead: form.isRead,
      };

      if (form.userId.trim()) {
        const userId = Number(form.userId);

        if (!Number.isInteger(userId) || userId < 1) {
          setError('User ID must be a positive integer.');
          setSaving(false);
          return;
        }

        payload.userId = userId;
      }

      if (editingId !== null) {
        await api.patch(
          `/notifications/${editingId}`,
          payload,
        );
      } else {
        await api.post('/notifications', payload);
      }

      resetForm();
      await loadNotifications();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to save notification.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (
    notification: NotificationItem,
  ) => {
    setEditingId(notification.id);

    setForm({
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'INFO',
      userId:
        notification.userId !== undefined &&
        notification.userId !== null
          ? String(notification.userId)
          : '',
      isRead: notification.isRead,
    });

    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const toggleRead = async (
    notification: NotificationItem,
  ) => {
    try {
      setError('');

      await api.patch(
        `/notifications/${notification.id}`,
        {
          isRead: !notification.isRead,
        },
      );

      await loadNotifications();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to update notification.',
      );
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this notification?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await api.delete(`/notifications/${id}`);

      if (editingId === id) {
        resetForm();
      }

      await loadNotifications();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to delete notification.',
      );
    }
  };

  const formatDate = (value: string) => {
    if (!value) return '-';

    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = notifications.filter(
    (item) => !item.isRead,
  ).length;

  const readCount = notifications.filter(
    (item) => item.isRead,
  ).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>
            Manage operational alerts and company notifications.
          </p>
        </div>

        <div className="notification-stats">
          <div className="notification-stat">
            <strong>{notifications.length}</strong>
            <span>Total</span>
          </div>

          <div className="notification-stat unread">
            <strong>{unreadCount}</strong>
            <span>Unread</span>
          </div>

          <div className="notification-stat read">
            <strong>{readCount}</strong>
            <span>Read</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="notifications-error">
          {error}
        </div>
      )}

      <div className="notifications-form-card">
        <div className="section-heading">
          <div>
            <h2>
              {editingId !== null
                ? 'Edit Notification'
                : 'Create Notification'}
            </h2>
            <p>
              Create an operational message for ERP users.
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
          className="notifications-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Monthly Review Meeting"
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="INFO">INFO</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="REMINDER">REMINDER</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Message *</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Enter the notification message..."
              rows={4}
              maxLength={2000}
            />
          </div>

          <div className="form-group">
            <label>User ID</label>
            <input
              name="userId"
              type="number"
              min="1"
              step="1"
              value={form.userId}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label>Read Status</label>
            <select
              name="isRead"
              value={String(form.isRead)}
              onChange={handleChange}
            >
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
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
                  ? 'Update Notification'
                  : 'Create Notification'}
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

      <div className="notifications-table-card">
        <div className="section-heading">
          <div>
            <h2>Notification Center</h2>
            <p>
              View and manage system notifications.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications found</h3>
            <p>
              Create your first notification using the form above.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="notifications-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Notification</th>
                  <th>Type</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {notifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className={
                      notification.isRead
                        ? ''
                        : 'unread-row'
                    }
                  >
                    <td>#{notification.id}</td>

                    <td>
                      <div className="notification-content">
                        <strong>
                          {notification.title}
                        </strong>
                        <span>
                          {notification.message}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`type-badge type-${notification.type.toLowerCase()}`}
                      >
                        {notification.type}
                      </span>
                    </td>

                    <td>
                      {notification.userId
                        ? `User #${notification.userId}`
                        : 'All Users'}
                    </td>

                    <td>
                      <span
                        className={
                          notification.isRead
                            ? 'status-badge read-status'
                            : 'status-badge unread-status'
                        }
                      >
                        {notification.isRead
                          ? 'Read'
                          : 'Unread'}
                      </span>
                    </td>

                    <td>
                      {formatDate(
                        notification.createdAt,
                      )}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="read-button"
                          onClick={() =>
                            toggleRead(notification)
                          }
                        >
                          {notification.isRead
                            ? 'Unread'
                            : 'Mark Read'}
                        </button>

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEdit(notification)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDelete(notification.id)
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

export default Notifications;