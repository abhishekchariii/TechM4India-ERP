import { useEffect, useState } from 'react';
import api from '../services/api';
import './Payroll.css';

interface Employee {
  id: number;
  name: string;
}

interface Payroll {
  id: number;
  employeeId: number;
  basicSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  month: string;
  employee?: Employee;
}

interface PayrollForm {
  employeeId: string;
  basicSalary: string;
  bonus: string;
  deductions: string;
  month: string;
}

const emptyForm: PayrollForm = {
  employeeId: '',
  basicSalary: '',
  bonus: '0',
  deductions: '0',
  month: '',
};

function Payroll() {
  const [payrolls, setPayrolls] =
    useState<Payroll[]>([]);

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [form, setForm] =
    useState<PayrollForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const handleError = (
    error: any,
    fallback: string,
  ) => {
    const status =
      error?.response?.status;

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

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        payrollRes,
        employeesRes,
      ] = await Promise.all([
        api.get('/payroll'),
        api.get('/employees'),
      ]);

      setPayrolls(payrollRes.data);
      setEmployees(employeesRes.data);
    } catch (error: any) {
      handleError(
        error,
        'Failed to load payroll data.',
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
      HTMLInputElement |
        HTMLSelectElement
    >,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!form.employeeId) {
      alert('Please select an employee.');
      return;
    }

    if (!form.month.trim()) {
      alert('Payroll month is required.');
      return;
    }

    const basicSalary =
      Number(form.basicSalary);

    const bonus =
      form.bonus === ''
        ? 0
        : Number(form.bonus);

    const deductions =
      form.deductions === ''
        ? 0
        : Number(form.deductions);

    if (
      Number.isNaN(basicSalary) ||
      basicSalary < 0
    ) {
      alert(
        'Please enter a valid basic salary.',
      );
      return;
    }

    if (
      Number.isNaN(bonus) ||
      bonus < 0
    ) {
      alert(
        'Bonus cannot be negative.',
      );
      return;
    }

    if (
      Number.isNaN(deductions) ||
      deductions < 0
    ) {
      alert(
        'Deductions cannot be negative.',
      );
      return;
    }

    if (
      basicSalary +
        bonus -
        deductions <
      0
    ) {
      alert(
        'Deductions cannot exceed basic salary plus bonus.',
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        employeeId:
          Number(form.employeeId),
        basicSalary,
        bonus,
        deductions,
        month: form.month.trim(),
      };

      if (editingId !== null) {
        await api.patch(
          `/payroll/${editingId}`,
          payload,
        );

        alert(
          'Payroll record updated successfully.',
        );
      } else {
        await api.post(
          '/payroll',
          payload,
        );

        alert(
          'Payroll record created successfully.',
        );
      }

      resetForm();
      await loadData();
    } catch (error: any) {
      handleError(
        error,
        editingId !== null
          ? 'Failed to update payroll.'
          : 'Failed to create payroll.',
      );
    } finally {
      setSaving(false);
    }
  };

  const edit = (
    payroll: Payroll,
  ) => {
    setEditingId(payroll.id);

    setForm({
      employeeId: String(
        payroll.employeeId,
      ),
      basicSalary: String(
        payroll.basicSalary,
      ),
      bonus: String(
        payroll.bonus || 0,
      ),
      deductions: String(
        payroll.deductions || 0,
      ),
      month: payroll.month,
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
        'Delete this payroll record?',
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/payroll/${id}`,
      );

      alert(
        'Payroll record deleted successfully.',
      );

      if (editingId === id) {
        resetForm();
      }

      await loadData();
    } catch (error: any) {
      handleError(
        error,
        'Failed to delete payroll record.',
      );
    }
  };

  const employeeName = (
    payroll: Payroll,
  ) => {
    return (
      payroll.employee?.name ||
      employees.find(
        (employee) =>
          employee.id ===
          payroll.employeeId,
      )?.name ||
      `Employee #${payroll.employeeId}`
    );
  };

  const totalBasic =
    payrolls.reduce(
      (sum, payroll) =>
        sum +
        Number(
          payroll.basicSalary || 0,
        ),
      0,
    );

  const totalBonus =
    payrolls.reduce(
      (sum, payroll) =>
        sum +
        Number(payroll.bonus || 0),
      0,
    );

  const totalDeductions =
    payrolls.reduce(
      (sum, payroll) =>
        sum +
        Number(
          payroll.deductions || 0,
        ),
      0,
    );

  const totalNet =
    payrolls.reduce(
      (sum, payroll) =>
        sum +
        Number(
          payroll.netSalary || 0,
        ),
      0,
    );

  const previewNet =
    Number(form.basicSalary || 0) +
    Number(form.bonus || 0) -
    Number(form.deductions || 0);

  return (
    <div className="payroll-page">

      <div className="payroll-header">

        <div>
          <h1>Payroll</h1>

          <p>
            Manage employee salary records
            and monthly payroll calculations.
          </p>
        </div>

        <div className="payroll-stats">

          <div className="payroll-stat">
            <span>Records</span>
            <strong>
              {payrolls.length}
            </strong>
          </div>

          <div className="payroll-stat">
            <span>Basic Salary</span>
            <strong>
              ₹
              {totalBasic.toLocaleString(
                'en-IN',
              )}
            </strong>
          </div>

          <div className="payroll-stat">
            <span>Deductions</span>
            <strong>
              ₹
              {totalDeductions.toLocaleString(
                'en-IN',
              )}
            </strong>
          </div>

          <div className="payroll-stat">
            <span>Net Payroll</span>
            <strong>
              ₹
              {totalNet.toLocaleString(
                'en-IN',
              )}
            </strong>
          </div>

        </div>
      </div>

      <div className="payroll-card">

        <div className="payroll-card-header">

          <div>
            <h2>
              {editingId !== null
                ? 'Edit Payroll'
                : 'Create Payroll'}
            </h2>

            <p>
              Net salary is calculated
              automatically.
            </p>
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
          className="payroll-form"
          onSubmit={submit}
        >

          <div>
            <label>
              Employee *
            </label>

            <select
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              required
            >
              <option value="">
                Select Employee
              </option>

              {employees.map(
                (employee) => (
                  <option
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.name}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label>
              Basic Salary *
            </label>

            <input
              type="number"
              name="basicSalary"
              min="0"
              step="0.01"
              value={
                form.basicSalary
              }
              onChange={handleChange}
              placeholder="25000"
              required
            />
          </div>

          <div>
            <label>
              Bonus
            </label>

            <input
              type="number"
              name="bonus"
              min="0"
              step="0.01"
              value={form.bonus}
              onChange={handleChange}
              placeholder="1000"
            />
          </div>

          <div>
            <label>
              Deductions
            </label>

            <input
              type="number"
              name="deductions"
              min="0"
              step="0.01"
              value={
                form.deductions
              }
              onChange={handleChange}
              placeholder="500"
            />
          </div>

          <div>
            <label>
              Month *
            </label>

            <input
              type="text"
              name="month"
              value={form.month}
              onChange={handleChange}
              placeholder="September 2026"
              required
            />
          </div>

          <div className="net-preview">

            <span>
              Calculated Net Salary
            </span>

            <strong>
              ₹
              {previewNet.toLocaleString(
                'en-IN',
              )}
            </strong>

            <small>
              Basic + Bonus − Deductions
            </small>

          </div>

          <div className="payroll-form-actions">

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Payroll'
                  : 'Create Payroll'}
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

      <div className="payroll-card">

        <div className="payroll-card-header">

          <div>
            <h2>
              Payroll Records
            </h2>

            <p>
              Employee salary history and
              calculated net salaries.
            </p>
          </div>

          <button
            type="button"
            className="secondary-btn"
            onClick={loadData}
          >
            Refresh
          </button>

        </div>

        {loading ? (
          <div className="empty-state">
            Loading payroll...
          </div>
        ) : payrolls.length === 0 ? (
          <div className="empty-state">
            No payroll records found.
          </div>
        ) : (
          <div className="payroll-table-wrapper">

            <table className="payroll-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Basic</th>
                  <th>Bonus</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {payrolls.map(
                  (payroll) => (
                    <tr
                      key={payroll.id}
                    >

                      <td>
                        #{payroll.id}
                      </td>

                      <td>
                        <strong>
                          {employeeName(
                            payroll,
                          )}
                        </strong>
                      </td>

                      <td>
                        {payroll.month}
                      </td>

                      <td>
                        ₹
                        {Number(
                          payroll.basicSalary,
                        ).toLocaleString(
                          'en-IN',
                        )}
                      </td>

                      <td>
                        ₹
                        {Number(
                          payroll.bonus || 0,
                        ).toLocaleString(
                          'en-IN',
                        )}
                      </td>

                      <td className="deduction">
                        ₹
                        {Number(
                          payroll.deductions ||
                            0,
                        ).toLocaleString(
                          'en-IN',
                        )}
                      </td>

                      <td className="net-salary">
                        <strong>
                          ₹
                          {Number(
                            payroll.netSalary,
                          ).toLocaleString(
                            'en-IN',
                          )}
                        </strong>
                      </td>

                      <td>

                        <div className="payroll-actions">

                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              edit(
                                payroll,
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
                                payroll.id,
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

export default Payroll;