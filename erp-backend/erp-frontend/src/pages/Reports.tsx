import { useEffect, useState } from 'react';
import api from '../services/api';
import './Reports.css';

type ReportType = 'sales' | 'purchases' | 'inventory' | 'payroll';

interface SalesReport {
  totalOrders: number;
  totalRevenue: number;
  orders: any[];
}

interface PurchaseReport {
  totalOrders: number;
  totalPurchaseAmount: number;
  orders: any[];
}

interface InventoryReport {
  totalItems: number;
  lowStockCount: number;
  totalStockValue: number;
  lowStockItems: any[];
  inventory: any[];
}

interface PayrollReport {
  totalPayrollRecords: number;
  totalBasicSalary: number;
  totalBonus: number;
  totalDeductions: number;
  totalNetSalary: number;
  payrolls: any[];
}

function Reports() {
  const [activeReport, setActiveReport] = useState<ReportType>('sales');

  const [sales, setSales] = useState<SalesReport | null>(null);
  const [purchases, setPurchases] = useState<PurchaseReport | null>(null);
  const [inventory, setInventory] = useState<InventoryReport | null>(null);
  const [payroll, setPayroll] = useState<PayrollReport | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (value: number | undefined | null) => {
    return `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';

    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');

      const params: Record<string, string> = {};

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      if (activeReport === 'sales') {
        const response = await api.get('/reports/sales', { params });
        setSales(response.data);
      }

      if (activeReport === 'purchases') {
        const response = await api.get('/reports/purchases', { params });
        setPurchases(response.data);
      }

      if (activeReport === 'inventory') {
        const response = await api.get('/reports/inventory');
        setInventory(response.data);
      }

      if (activeReport === 'payroll') {
        const response = await api.get('/reports/payroll', { params });
        setPayroll(response.data);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to load report. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [activeReport]);

  const handleFilter = (event: React.FormEvent) => {
    event.preventDefault();

    if (startDate && endDate && startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }

    loadReport();
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setTimeout(() => {
      loadReport();
    }, 0);
  };

  const renderSales = () => {
    if (!sales) return null;

    return (
      <>
        <div className="report-summary-grid">
          <SummaryCard
            icon="📈"
            title="Completed Orders"
            value={sales.totalOrders}
          />

          <SummaryCard
            icon="💰"
            title="Total Revenue"
            value={formatCurrency(sales.totalRevenue)}
          />
        </div>

        <div className="report-card">
          <ReportHeader
            title="Sales Details"
            description="Completed sales orders and revenue."
          />

          {sales.orders.length === 0 ? (
            <EmptyReport message="No completed sales orders found." />
          ) : (
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Order Date</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        {order.customer?.name ||
                          `Customer #${order.customerId}`}
                      </td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td>{order.items?.length || 0}</td>
                      <td>
                        <strong>{formatCurrency(order.totalAmount)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderPurchases = () => {
    if (!purchases) return null;

    return (
      <>
        <div className="report-summary-grid">
          <SummaryCard
            icon="🛒"
            title="Purchase Orders"
            value={purchases.totalOrders}
          />

          <SummaryCard
            icon="💸"
            title="Total Purchase Amount"
            value={formatCurrency(purchases.totalPurchaseAmount)}
          />
        </div>

        <div className="report-card">
          <ReportHeader
            title="Purchase Details"
            description="Purchase orders and supplier information."
          />

          {purchases.orders.length === 0 ? (
            <EmptyReport message="No purchase orders found." />
          ) : (
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Supplier</th>
                    <th>Order Date</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {purchases.orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        {order.supplier?.name ||
                          `Supplier #${order.supplierId}`}
                      </td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td>{order.items?.length || 0}</td>
                      <td>
                        <strong>
                          {formatCurrency(order.totalAmount)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderInventory = () => {
    if (!inventory) return null;

    return (
      <>
        <div className="report-summary-grid">
          <SummaryCard
            icon="📦"
            title="Total Items"
            value={inventory.totalItems}
          />

          <SummaryCard
            icon="⚠️"
            title="Low Stock"
            value={inventory.lowStockCount}
          />

          <SummaryCard
            icon="💰"
            title="Total Stock Value"
            value={formatCurrency(inventory.totalStockValue)}
          />
        </div>

        <div className="report-card">
          <ReportHeader
            title="Inventory Details"
            description="Current stock quantities and values."
          />

          {inventory.inventory.length === 0 ? (
            <EmptyReport message="No inventory items found." />
          ) : (
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Stock Value</th>
                  </tr>
                </thead>

                <tbody>
                  {inventory.inventory.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td>{item.description || '-'}</td>
                      <td>
                        <span
                          className={
                            item.quantity <= 5
                              ? 'quantity-low'
                              : 'quantity-normal'
                          }
                        >
                          {item.quantity}
                        </span>
                      </td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>
                        <strong>
                          {formatCurrency(item.quantity * item.price)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {inventory.lowStockItems.length > 0 && (
          <div className="report-card low-stock-card">
            <ReportHeader
              title="⚠️ Low Stock Items"
              description="Items with quantity of 5 or below."
            />

            <div className="low-stock-list">
              {inventory.lowStockItems.map((item) => (
                <div className="low-stock-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <span>Current quantity: {item.quantity}</span>
                  </div>

                  <span className="low-stock-badge">
                    LOW STOCK
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderPayroll = () => {
    if (!payroll) return null;

    return (
      <>
        <div className="report-summary-grid payroll-summary">
          <SummaryCard
            icon="📋"
            title="Payroll Records"
            value={payroll.totalPayrollRecords}
          />

          <SummaryCard
            icon="💵"
            title="Basic Salary"
            value={formatCurrency(payroll.totalBasicSalary)}
          />

          <SummaryCard
            icon="🎁"
            title="Total Bonus"
            value={formatCurrency(payroll.totalBonus)}
          />

          <SummaryCard
            icon="➖"
            title="Total Deductions"
            value={formatCurrency(payroll.totalDeductions)}
          />

          <SummaryCard
            icon="💰"
            title="Net Salary"
            value={formatCurrency(payroll.totalNetSalary)}
          />
        </div>

        <div className="report-card">
          <ReportHeader
            title="Payroll Details"
            description="Employee payroll records and salary information."
          />

          {payroll.payrolls.length === 0 ? (
            <EmptyReport message="No payroll records found." />
          ) : (
            <div className="report-table-wrapper">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Month</th>
                    <th>Basic Salary</th>
                    <th>Bonus</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                  </tr>
                </thead>

                <tbody>
                  {payroll.payrolls.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>
                        <strong>
                          {item.employee?.name ||
                            `Employee #${item.employeeId}`}
                        </strong>
                      </td>
                      <td>
                        {item.employee?.department?.name || '-'}
                      </td>
                      <td>{item.month}</td>
                      <td>{formatCurrency(item.basicSalary)}</td>
                      <td>{formatCurrency(item.bonus)}</td>
                      <td>{formatCurrency(item.deductions)}</td>
                      <td>
                        <strong>
                          {formatCurrency(item.netSalary)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <span className="reports-eyebrow">BUSINESS INTELLIGENCE</span>
          <h1>Reports</h1>
          <p>
            Analyze sales, purchases, inventory and payroll performance.
          </p>
        </div>

        <button
          className="refresh-report-button"
          onClick={loadReport}
          disabled={loading}
        >
          🔄 {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="report-tabs">
        <button
          className={activeReport === 'sales' ? 'active' : ''}
          onClick={() => setActiveReport('sales')}
        >
          📈 Sales
        </button>

        <button
          className={activeReport === 'purchases' ? 'active' : ''}
          onClick={() => setActiveReport('purchases')}
        >
          🛒 Purchases
        </button>

        <button
          className={activeReport === 'inventory' ? 'active' : ''}
          onClick={() => setActiveReport('inventory')}
        >
          📦 Inventory
        </button>

        <button
          className={activeReport === 'payroll' ? 'active' : ''}
          onClick={() => setActiveReport('payroll')}
        >
          💰 Payroll
        </button>
      </div>

      {activeReport !== 'inventory' && (
        <form className="report-filter" onSubmit={handleFilter}>
          <div className="filter-field">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <button className="apply-filter-button" type="submit">
            Apply Filter
          </button>

          <button
            className="clear-filter-button"
            type="button"
            onClick={clearFilters}
          >
            Clear
          </button>
        </form>
      )}

      {error && (
        <div className="reports-error">
          ⚠️ {Array.isArray(error) ? error.join(', ') : error}
        </div>
      )}

      {loading ? (
        <div className="reports-loading">
          <div className="loading-spinner" />
          <h3>Loading Report...</h3>
          <p>Please wait while we fetch the latest data.</p>
        </div>
      ) : (
        <>
          {activeReport === 'sales' && renderSales()}
          {activeReport === 'purchases' && renderPurchases()}
          {activeReport === 'inventory' && renderInventory()}
          {activeReport === 'payroll' && renderPayroll()}
        </>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string | number;
}) {
  return (
    <div className="summary-card">
      <div className="summary-icon">{icon}</div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function ReportHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="report-section-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`report-status ${status
        ?.toLowerCase()
        .replace(/_/g, '-')}`}
    >
      {status}
    </span>
  );
}

function EmptyReport({ message }: { message: string }) {
  return (
    <div className="report-empty">
      <div>📊</div>
      <h3>{message}</h3>
      <p>There is no data available for the selected criteria.</p>
    </div>
  );
}

export default Reports;