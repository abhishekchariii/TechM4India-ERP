import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import api from '../services/api';
import './Invoices.css';

interface Customer {
  id: number;
  name: string;
}

interface SalesOrder {
  id: number;
  customerId: number;
  totalAmount: number;
  status: string;
  customer?: Customer;
}

interface Payment {
  id: number;
  amount: number;
  paymentMethod: string;
  paymentDate?: string;
}

interface Invoice {
  id: number;
  salesOrderId: number;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  salesOrder?: SalesOrder;
  payments?: Payment[];
}

interface InvoiceForm {
  salesOrderId: string;
  dueDate: string;
}

interface PaymentForm {
  amount: string;
  paymentMethod: string;
}

const emptyForm: InvoiceForm = {
  salesOrderId: '',
  dueDate: '',
};

const emptyPayment: PaymentForm = {
  amount: '',
  paymentMethod: 'CASH',
};

function Invoices() {
  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [orders, setOrders] =
    useState<SalesOrder[]>([]);

  const [form, setForm] =
    useState<InvoiceForm>({
      ...emptyForm,
    });

  const [paymentForm, setPaymentForm] =
    useState<PaymentForm>({
      ...emptyPayment,
    });

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [
    paymentInvoiceId,
    setPaymentInvoiceId,
  ] = useState<number | null>(
    null,
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    paymentSaving,
    setPaymentSaving,
  ] = useState(false);

  // =========================================================
  // ERROR HANDLER
  // =========================================================

  const handleError = (
    error: any,
    fallback: string,
  ) => {
    const status =
      error?.response?.status;

    if (status === 401) {
      localStorage.removeItem(
        'token',
      );

      window.location.href =
        '/login';

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

    alert(
      message || fallback,
    );
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        invoicesRes,
        ordersRes,
      ] = await Promise.all([
        api.get('/invoices'),
        api.get('/sales-orders'),
      ]);

      setInvoices(
        invoicesRes.data,
      );

      setOrders(
        ordersRes.data,
      );
    } catch (error: any) {
      handleError(
        error,
        'Failed to load invoice data.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // FORM
  // =========================================================

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setForm((current) => ({
      ...current,

      [event.target.name]:
        event.target.value,
    }));
  };

  const handleOrderChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setForm((current) => ({
      ...current,

      salesOrderId:
        event.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);
  };

  // =========================================================
  // SUBMIT INVOICE
  // =========================================================

  const submit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!form.salesOrderId) {
      alert(
        'Please select a sales order.',
      );

      return;
    }

    try {
      setSaving(true);

      if (
        editingId !== null
      ) {
        await api.patch(
          `/invoices/${editingId}`,
          {
            dueDate:
              form.dueDate
                ? new Date(
                    `${form.dueDate}T00:00:00`,
                  ).toISOString()
                : undefined,
          },
        );

        alert(
          'Invoice updated successfully.',
        );
      } else {
        await api.post(
          '/invoices',
          {
            salesOrderId:
              Number(
                form.salesOrderId,
              ),

            dueDate:
              form.dueDate
                ? new Date(
                    `${form.dueDate}T00:00:00`,
                  ).toISOString()
                : undefined,
          },
        );

        alert(
          'Invoice created successfully.',
        );
      }

      resetForm();

      await loadData();
    } catch (error: any) {
      handleError(
        error,
        editingId !== null
          ? 'Failed to update invoice.'
          : 'Failed to create invoice.',
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const edit = (
    invoice: Invoice,
  ) => {
    if (
      invoice.status ===
      'PAID'
    ) {
      alert(
        'Fully paid invoices cannot be edited.',
      );

      return;
    }

    setEditingId(invoice.id);

    setForm({
      salesOrderId:
        String(
          invoice.salesOrderId,
        ),

      dueDate:
        invoice.dueDate
          ? new Date(
              invoice.dueDate,
            )
              .toISOString()
              .slice(0, 10)
          : '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // =========================================================
  // PAYMENT MODAL
  // =========================================================

  const openPayment = (
    invoice: Invoice,
  ) => {
    const remaining =
      Number(
        invoice.totalAmount,
      ) -
      Number(
        invoice.paidAmount,
      );

    if (remaining <= 0) {
      alert(
        'This invoice has already been fully paid.',
      );

      return;
    }

    setPaymentInvoiceId(
      invoice.id,
    );

    setPaymentForm({
      amount: String(
        remaining,
      ),

      paymentMethod:
        'CASH',
    });
  };

  const closePayment = () => {
    setPaymentInvoiceId(
      null,
    );

    setPaymentForm({
      ...emptyPayment,
    });
  };

  // =========================================================
  // PAYMENT SUBMIT
  // =========================================================

  const submitPayment = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (
      paymentInvoiceId ===
      null
    ) {
      return;
    }

    const amount =
      Number(
        paymentForm.amount,
      );

    if (
      !Number.isFinite(
        amount,
      ) ||
      amount <= 0
    ) {
      alert(
        'Payment amount must be greater than 0.',
      );

      return;
    }

    if (
      !paymentForm.paymentMethod
    ) {
      alert(
        'Please select a payment method.',
      );

      return;
    }

    const invoice =
      invoices.find(
        (item) =>
          item.id ===
          paymentInvoiceId,
      );

    if (!invoice) {
      alert(
        'Invoice not found.',
      );

      return;
    }

    const remaining =
      Number(
        invoice.totalAmount,
      ) -
      Number(
        invoice.paidAmount,
      );

    if (
      amount > remaining
    ) {
      alert(
        `Payment exceeds outstanding amount. Remaining: ₹${remaining.toLocaleString(
          'en-IN',
        )}`,
      );

      return;
    }

    try {
      setPaymentSaving(
        true,
      );

      await api.post(
        `/invoices/${paymentInvoiceId}/payments`,
        {
          amount,

          paymentMethod:
            paymentForm.paymentMethod,
        },
      );

      alert(
        'Payment recorded successfully.',
      );

      closePayment();

      await loadData();
    } catch (error: any) {
      handleError(
        error,
        'Failed to record payment.',
      );
    } finally {
      setPaymentSaving(
        false,
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const remove = async (
    invoice: Invoice,
  ) => {
    if (
      invoice.status ===
      'PAID'
    ) {
      alert(
        'Fully paid invoices cannot be deleted.',
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete Invoice #${invoice.id}?\n\nAny associated payments will also be removed.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/invoices/${invoice.id}`,
      );

      alert(
        'Invoice deleted successfully.',
      );

      if (
        editingId ===
        invoice.id
      ) {
        resetForm();
      }

      if (
        paymentInvoiceId ===
        invoice.id
      ) {
        closePayment();
      }

      await loadData();
    } catch (error: any) {
      handleError(
        error,
        'Failed to delete invoice.',
      );
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const customerName = (
    invoice: Invoice,
  ) => {
    return (
      invoice.salesOrder
        ?.customer?.name ||
      orders.find(
        (order) =>
          order.id ===
          invoice.salesOrderId,
      )?.customer?.name ||
      `Customer #${invoice.salesOrder?.customerId || invoice.salesOrderId}`
    );
  };

  const totalInvoiced =
    useMemo(
      () =>
        invoices.reduce(
          (sum, invoice) =>
            sum +
            Number(
              invoice.totalAmount ||
                0,
            ),
          0,
        ),
      [invoices],
    );

  const totalPaid =
    useMemo(
      () =>
        invoices.reduce(
          (sum, invoice) =>
            sum +
            Number(
              invoice.paidAmount ||
                0,
            ),
          0,
        ),
      [invoices],
    );

  const outstanding =
    totalInvoiced -
    totalPaid;

  const statusClass = (
    status: string,
  ) =>
    status
      .toLowerCase()
      .replace(
        /\s+/g,
        '-',
      );

  const formatCurrency = (
    value: number,
  ) =>
    `₹${value.toLocaleString(
      'en-IN',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="invoices-page">

      {/* HEADER */}

      <div className="invoices-header">

        <div>
          <h1>
            Invoices & Payments
          </h1>

          <p>
            Manage customer
            invoices, payments
            and outstanding
            balances.
          </p>
        </div>

        <div className="invoice-stats">

          <div className="invoice-stat">
            <span>
              Invoices
            </span>

            <strong>
              {invoices.length}
            </strong>
          </div>

          <div className="invoice-stat">
            <span>
              Total Invoiced
            </span>

            <strong>
              {formatCurrency(
                totalInvoiced,
              )}
            </strong>
          </div>

          <div className="invoice-stat">
            <span>
              Total Paid
            </span>

            <strong>
              {formatCurrency(
                totalPaid,
              )}
            </strong>
          </div>

          <div className="invoice-stat">
            <span>
              Outstanding
            </span>

            <strong>
              {formatCurrency(
                outstanding,
              )}
            </strong>
          </div>

        </div>
      </div>

      {/* CREATE / EDIT */}

      <div className="invoice-card">

        <div className="invoice-card-header">

          <div>
            <h2>
              {editingId !== null
                ? `Edit Invoice #${editingId}`
                : 'Create Invoice'}
            </h2>

            <p>
              {editingId !== null
                ? 'Update the invoice due date.'
                : 'Create an invoice from a completed sales order.'}
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
          className="invoice-form"
          onSubmit={submit}
        >

          <div className="invoice-field">

            <label>
              Sales Order *
            </label>

            <select
              value={
                form.salesOrderId
              }
              onChange={
                handleOrderChange
              }
              disabled={
                editingId !== null
              }
              required
            >
              <option value="">
                Select Completed Sales Order
              </option>

              {orders
                .filter(
                  (order) =>
                    order.status ===
                    'COMPLETED',
                )
                .filter(
                  (order) =>
                    !invoices.some(
                      (invoice) =>
                        invoice.salesOrderId ===
                        order.id &&
                        invoice.id !==
                          editingId,
                    ),
                )
                .map(
                  (order) => (
                    <option
                      key={
                        order.id
                      }
                      value={
                        order.id
                      }
                    >
                      #{order.id} —{' '}
                      {order.customer
                        ?.name ||
                        `Customer #${order.customerId}`}{' '}
                      —{' '}
                      {formatCurrency(
                        Number(
                          order.totalAmount,
                        ),
                      )}
                    </option>
                  ),
                )}
            </select>

          </div>

          <div className="invoice-field">

            <label>
              Due Date
            </label>

            <input
              type="date"
              value={
                form.dueDate
              }
              onChange={handleChange}
              name="dueDate"
            />

          </div>

          <div className="invoice-info">

            <strong>
              Invoice Amount
            </strong>

            <span>
              The invoice amount is
              automatically taken from
              the selected completed
              Sales Order.
            </span>

          </div>

          <div className="invoice-form-actions">

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Invoice'
                  : 'Create Invoice'}
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

      {/* TABLE */}

      <div className="invoice-card">

        <div className="invoice-card-header">

          <div>
            <h2>
              Invoices
            </h2>

            <p>
              View invoices,
              outstanding amounts
              and payment history.
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
            Loading invoices...
          </div>
        ) : invoices.length ===
          0 ? (
          <div className="empty-state">
            No invoices found.
          </div>
        ) : (
          <div className="invoice-table-wrapper">

            <table className="invoice-table">

              <thead>
                <tr>
                  <th>
                    ID
                  </th>

                  <th>
                    Sales Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Paid
                  </th>

                  <th>
                    Outstanding
                  </th>

                  <th>
                    Due Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {invoices.map(
                  (invoice) => {
                    const total =
                      Number(
                        invoice.totalAmount ||
                          0,
                      );

                    const paid =
                      Number(
                        invoice.paidAmount ||
                          0,
                      );

                    const balance =
                      Math.max(
                        0,
                        total -
                          paid,
                      );

                    return (
                      <tr
                        key={
                          invoice.id
                        }
                      >

                        <td>
                          <strong>
                            #
                            {
                              invoice.id
                            }
                          </strong>
                        </td>

                        <td>
                          #
                          {
                            invoice.salesOrderId
                          }
                        </td>

                        <td>
                          <strong>
                            {customerName(
                              invoice,
                            )}
                          </strong>
                        </td>

                        <td>
                          {formatCurrency(
                            total,
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            paid,
                          )}
                        </td>

                        <td>
                          <strong
                            className={
                              balance >
                              0
                                ? 'outstanding'
                                : 'paid'
                            }
                          >
                            {formatCurrency(
                              balance,
                            )}
                          </strong>
                        </td>

                        <td>
                          {invoice.dueDate
                            ? new Date(
                                invoice.dueDate,
                              ).toLocaleDateString(
                                'en-IN',
                              )
                            : '—'}
                        </td>

                        <td>
                          <span
                            className={`invoice-status ${statusClass(
                              invoice.status,
                            )}`}
                          >
                            {
                              invoice.status
                            }
                          </span>
                        </td>

                        <td>

                          <div className="invoice-actions">

                            {invoice.status !==
                              'PAID' && (
                              <button
                                type="button"
                                className="edit-btn"
                                onClick={() =>
                                  edit(
                                    invoice,
                                  )
                                }
                              >
                                Edit
                              </button>
                            )}

                            {balance >
                              0 && (
                              <button
                                type="button"
                                className="payment-btn"
                                onClick={() =>
                                  openPayment(
                                    invoice,
                                  )
                                }
                              >
                                Add Payment
                              </button>
                            )}

                            {invoice.status !==
                              'PAID' && (
                              <button
                                type="button"
                                className="delete-btn"
                                onClick={() =>
                                  remove(
                                    invoice,
                                  )
                                }
                              >
                                Delete
                              </button>
                            )}

                            {invoice.status ===
                              'PAID' && (
                              <span className="paid-label">
                                Fully Paid
                              </span>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  },
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* PAYMENT MODAL */}

      {paymentInvoiceId !==
        null && (
        <div className="payment-overlay">

          <div className="payment-modal">

            <div className="payment-modal-header">

              <div>
                <h2>
                  Record Payment
                </h2>

                <p>
                  Invoice #
                  {
                    paymentInvoiceId
                  }
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closePayment
                }
              >
                ×
              </button>

            </div>

            <form
              className="payment-form"
              onSubmit={
                submitPayment
              }
            >

              <div>
                <label>
                  Payment Amount *
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    paymentForm.amount
                  }
                  onChange={(
                    event,
                  ) =>
                    setPaymentForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        amount:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  required
                />
              </div>

              <div>
                <label>
                  Payment Method *
                </label>

                <select
                  value={
                    paymentForm.paymentMethod
                  }
                  onChange={(
                    event,
                  ) =>
                    setPaymentForm(
                      (
                        current,
                      ) => ({
                        ...current,
                        paymentMethod:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  required
                >
                  <option value="CASH">
                    CASH
                  </option>

                  <option value="BANK_TRANSFER">
                    BANK TRANSFER
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="CARD">
                    CARD
                  </option>

                  <option value="CHEQUE">
                    CHEQUE
                  </option>

                  <option value="RAZORPAY">
                    RAZORPAY
                  </option>
                </select>
              </div>

              <div className="payment-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={
                    closePayment
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={
                    paymentSaving
                  }
                >
                  {paymentSaving
                    ? 'Recording...'
                    : 'Record Payment'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Invoices;