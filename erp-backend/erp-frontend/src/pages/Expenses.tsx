import { useEffect, useState } from 'react';
import api from '../services/api';
import './Expenses.css';

interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  category: string;
  expenseDate: string;
  status: string;
}

interface ExpenseForm {
  title: string;
  description: string;
  amount: string;
  category: string;
  expenseDate: string;
  status: string;
}

const emptyForm: ExpenseForm = {
  title: '',
  description: '',
  amount: '',
  category: '',
  expenseDate: new Date()
    .toISOString()
    .slice(0, 10),
  status: 'PENDING',
};

function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] =
    useState<ExpenseForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleError = (
    error: any,
    fallback: string,
  ) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }

    if (status === 403) {
      alert(
        'You do not have permission to perform this action.',
      );
      return;
    }

    const message =
      error?.response?.data?.message;

    if (Array.isArray(message)) {
      alert(message.join('\n'));
      return;
    }

    alert(message || fallback);
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const response =
        await api.get('/expenses');

      setExpenses(response.data);
    } catch (error: any) {
      handleError(
        error,
        'Failed to load expenses.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      ...emptyForm,
      expenseDate: new Date()
        .toISOString()
        .slice(0, 10),
    });

    setEditingId(null);
  };

  const submit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert('Expense title is required.');
      return;
    }

    if (!form.category.trim()) {
      alert('Expense category is required.');
      return;
    }

    const amount = Number(form.amount);

    if (
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      alert(
        'Expense amount must be greater than 0.',
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description:
          form.description.trim() ||
          undefined,
        amount,
        category: form.category.trim(),
        expenseDate: form.expenseDate
          ? new Date(
              `${form.expenseDate}T00:00:00`,
            ).toISOString()
          : undefined,
        status: form.status,
      };

      if (editingId !== null) {
        await api.patch(
          `/expenses/${editingId}`,
          payload,
        );

        alert(
          'Expense updated successfully.',
        );
      } else {
        await api.post(
          '/expenses',
          payload,
        );

        alert(
          'Expense created successfully.',
        );
      }

      resetForm();
      await loadExpenses();
    } catch (error: any) {
      handleError(
        error,
        editingId !== null
          ? 'Failed to update expense.'
          : 'Failed to create expense.',
      );
    } finally {
      setSaving(false);
    }
  };

  const edit = (expense: Expense) => {
    setEditingId(expense.id);

    setForm({
      title: expense.title,
      description:
        expense.description || '',
      amount: String(expense.amount),
      category: expense.category,
      expenseDate: expense.expenseDate
        ? new Date(
            expense.expenseDate,
          )
            .toISOString()
            .slice(0, 10)
        : '',
      status: expense.status,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const remove = async (
    id: number,
  ) => {
    if (
      !window.confirm(
        'Delete this expense?',
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/expenses/${id}`,
      );

      alert(
        'Expense deleted successfully.',
      );

      if (editingId === id) {
        resetForm();
      }

      await loadExpenses();
    } catch (error: any) {
      handleError(
        error,
        'Failed to delete expense.',
      );
    }
  };

  const totalExpenses =
    expenses.reduce(
      (sum, expense) =>
        sum +
        Number(expense.amount || 0),
      0,
    );

  const pendingAmount =
    expenses
      .filter(
        (expense) =>
          expense.status === 'PENDING',
      )
      .reduce(
        (sum, expense) =>
          sum +
          Number(expense.amount || 0),
        0,
      );

  const approvedAmount =
    expenses
      .filter(
        (expense) =>
          expense.status === 'APPROVED',
      )
      .reduce(
        (sum, expense) =>
          sum +
          Number(expense.amount || 0),
        0,
      );

  const statusClass = (
    status: string,
  ) =>
    status
      .toLowerCase()
      .replace(/\s+/g, '-');

  return (
    <div className="expenses-page">

      <div className="expenses-header">

        <div>
          <h1>Expenses</h1>

          <p>
            Track company expenses,
            categories and approval status.
          </p>
        </div>

        <div className="expense-stats">

          <div className="expense-stat">
            <span>Total Records</span>
            <strong>
              {expenses.length}
            </strong>
          </div>

          <div className="expense-stat">
            <span>Total Expenses</span>
            <strong>
              ₹
              {totalExpenses.toLocaleString(
                'en-IN',
              )}
            </strong>
          </div>

          <div className="expense-stat">
            <span>Pending</span>
            <strong>
              ₹
              {pendingAmount.toLocaleString(
                'en-IN',
              )}
            </strong>
          </div>

          <div className="expense-stat">
            <span>Approved</span>
            <strong>
              ₹
              {approvedAmount.toLocaleString(
                'en-IN',
              )}
            </strong>
          </div>

        </div>
      </div>

      <div className="expense-card">

        <div className="expense-card-header">

          <div>
            <h2>
              {editingId !== null
                ? 'Edit Expense'
                : 'Add Expense'}
            </h2>
          </div>

          {editingId !== null && (
            <button
              type="button"
              className="secondary-btn"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}

        </div>

        <form
          className="expense-form"
          onSubmit={submit}
        >

          <div>
            <label>Title *</label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Office electricity bill"
              required
            />
          </div>

          <div>
            <label>Amount *</label>

            <input
              type="number"
              name="amount"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="5000"
              required
            />
          </div>

          <div>
            <label>Category *</label>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Travel, Office, Utilities..."
              required
            />
          </div>

          <div>
            <label>Expense Date</label>

            <input
              type="date"
              name="expenseDate"
              value={form.expenseDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Status</label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="PENDING">
                PENDING
              </option>

              <option value="APPROVED">
                APPROVED
              </option>

              <option value="REJECTED">
                REJECTED
              </option>

              <option value="PAID">
                PAID
              </option>
            </select>
          </div>

          <div className="expense-description">

            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Expense details..."
            />

          </div>

          <div className="expense-form-actions">

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Expense'
                  : 'Add Expense'}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Clear
              </button>
            )}

          </div>

        </form>

      </div>

      <div className="expense-card">

        <div className="expense-card-header">

          <h2>Expense Records</h2>

          <button
            type="button"
            className="secondary-btn"
            onClick={loadExpenses}
          >
            Refresh
          </button>

        </div>

        {loading ? (
          <div className="empty-state">
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            No expenses found.
          </div>
        ) : (
          <div className="expense-table-wrapper">

            <table className="expense-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {expenses.map(
                  (expense) => (
                    <tr
                      key={expense.id}
                    >

                      <td>
                        #{expense.id}
                      </td>

                      <td>
                        <strong>
                          {expense.title}
                        </strong>

                        {expense.description && (
                          <small>
                            {
                              expense.description
                            }
                          </small>
                        )}
                      </td>

                      <td>
                        {expense.category}
                      </td>

                      <td>
                        <strong>
                          ₹
                          {Number(
                            expense.amount,
                          ).toLocaleString(
                            'en-IN',
                          )}
                        </strong>
                      </td>

                      <td>
                        {expense.expenseDate
                          ? new Date(
                              expense.expenseDate,
                            ).toLocaleDateString(
                              'en-IN',
                            )
                          : '—'}
                      </td>

                      <td>
                        <span
                          className={`expense-status ${statusClass(
                            expense.status,
                          )}`}
                        >
                          {expense.status}
                        </span>
                      </td>

                      <td>

                        <div className="expense-actions">

                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              edit(
                                expense,
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              remove(
                                expense.id,
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

export default Expenses;