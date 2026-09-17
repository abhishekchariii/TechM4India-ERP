import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './SalesOrders.css';

interface Customer {
  id: number;
  name: string;
  email?: string;
}

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface SalesOrderItem {
  id: number;
  inventoryId: number;
  quantity: number;
  price: number;
  inventory?: InventoryItem;
}

interface SalesOrder {
  id: number;
  customerId: number;
  orderDate?: string;
  status: string;
  totalAmount: number;
  customer?: Customer;
  items: SalesOrderItem[];
}

interface OrderItemForm {
  inventoryId: string;
  quantity: string;
  price: string;
}

const emptyItem: OrderItemForm = {
  inventoryId: '',
  quantity: '1',
  price: '',
};

function SalesOrders() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<OrderItemForm[]>([
    { ...emptyItem },
  ]);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // ERROR HANDLER
  // =========================================================

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

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        ordersRes,
        customersRes,
        inventoryRes,
      ] = await Promise.all([
        api.get('/sales-orders'),
        api.get('/customers'),
        api.get('/inventory'),
      ]);

      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setInventory(inventoryRes.data);
    } catch (error: any) {
      handleError(
        error,
        'Failed to load sales order data.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setCustomerId('');
    setItems([{ ...emptyItem }]);
    setEditingId(null);
  };

  // =========================================================
  // INVENTORY SELECTION
  // =========================================================

  const handleInventoryChange = (
    index: number,
    value: string,
  ) => {
    const selected = inventory.find(
      (product) =>
        String(product.id) === value,
    );

    setItems((current) =>
      current.map((row, i) =>
        i === index
          ? {
              ...row,
              inventoryId: value,
              price: selected
                ? String(selected.price)
                : '',
            }
          : row,
      ),
    );
  };

  // =========================================================
  // ITEM FIELD CHANGE
  // =========================================================

  const handleItemChange = (
    index: number,
    field: keyof OrderItemForm,
    value: string,
  ) => {
    setItems((current) =>
      current.map((row, i) =>
        i === index
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    );
  };

  // =========================================================
  // ADD ITEM
  // =========================================================

  const addItem = () => {
    setItems((current) => [
      ...current,
      { ...emptyItem },
    ]);
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const removeItem = (index: number) => {
    if (items.length === 1) {
      alert(
        'At least one item is required.',
      );
      return;
    }

    setItems((current) =>
      current.filter(
        (_, i) => i !== index,
      ),
    );
  };

  // =========================================================
  // ITEM TOTAL
  // =========================================================

  const itemTotal = (
    row: OrderItemForm,
  ) => {
    const quantity = Number(
      row.quantity || 0,
    );

    const price = Number(
      row.price || 0,
    );

    return quantity * price;
  };

  // =========================================================
  // ORDER TOTAL
  // =========================================================

  const orderTotal = useMemo(
    () =>
      items.reduce(
        (total, row) =>
          total + itemTotal(row),
        0,
      ),
    [items],
  );

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateItems = () => {
    if (items.length === 0) {
      alert(
        'At least one item is required.',
      );
      return false;
    }

    const usedInventoryIds =
      new Set<number>();

    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      const row = items[index];

      if (!row.inventoryId) {
        alert(
          `Please select inventory item for row ${index + 1}.`,
        );
        return false;
      }

      const quantity = Number(
        row.quantity,
      );

      const price = Number(
        row.price,
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        alert(
          `Quantity must be a whole number greater than 0 for row ${index + 1}.`,
        );
        return false;
      }

      if (
        Number.isNaN(price) ||
        price < 0
      ) {
        alert(
          `Please enter a valid price for row ${index + 1}.`,
        );
        return false;
      }

      const inventoryId =
        Number(row.inventoryId);

      // Prevent duplicate inventory rows.
      if (
        usedInventoryIds.has(
          inventoryId,
        )
      ) {
        alert(
          'The same inventory item cannot be added twice. Please combine the quantities into one row.',
        );
        return false;
      }

      usedInventoryIds.add(
        inventoryId,
      );

      const selectedInventory =
        inventory.find(
          (product) =>
            product.id === inventoryId,
        );

      if (
        selectedInventory &&
        quantity >
          selectedInventory.quantity
      ) {
        alert(
          `Insufficient stock for ${selectedInventory.name}. Available: ${selectedInventory.quantity}, Required: ${quantity}`,
        );
        return false;
      }
    }

    return true;
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const submit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!customerId) {
      alert(
        'Please select a customer.',
      );
      return;
    }

    if (!validateItems()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        customerId: Number(customerId),

        items: items.map((row) => ({
          inventoryId: Number(
            row.inventoryId,
          ),
          quantity: Number(
            row.quantity,
          ),
          price: Number(row.price),
        })),
      };

      if (editingId === null) {
        await api.post(
          '/sales-orders',
          payload,
        );

        alert(
          'Sales order created successfully.',
        );
      } else {
        await api.patch(
          `/sales-orders/${editingId}`,
          payload,
        );

        alert(
          'Sales order updated successfully.',
        );
      }

      resetForm();
      await loadData();
    } catch (error: any) {
      handleError(
        error,
        editingId !== null
          ? 'Failed to update sales order.'
          : 'Failed to create sales order.',
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const edit = (
    order: SalesOrder,
  ) => {
    if (order.status === 'COMPLETED') {
      alert(
        'Completed sales orders cannot be edited.',
      );
      return;
    }

    setEditingId(order.id);
    setCustomerId(
      String(order.customerId),
    );

    if (
      order.items &&
      order.items.length > 0
    ) {
      setItems(
        order.items.map(
          (orderItem) => ({
            inventoryId: String(
              orderItem.inventoryId,
            ),
            quantity: String(
              orderItem.quantity,
            ),
            price: String(
              orderItem.price,
            ),
          }),
        ),
      );
    } else {
      setItems([{ ...emptyItem }]);
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // =========================================================
  // COMPLETE
  // =========================================================

  const completeOrder = async (
    id: number,
  ) => {
    if (
      !window.confirm(
        'Complete this sales order? Inventory stock will be reduced.',
      )
    ) {
      return;
    }

    try {
      await api.patch(
        `/sales-orders/${id}/complete`,
      );

      alert(
        'Sales order completed and inventory stock updated successfully.',
      );

      await loadData();
    } catch (error: any) {
      handleError(
        error,
        'Failed to complete sales order.',
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const remove = async (
    order: SalesOrder,
  ) => {
    if (order.status === 'COMPLETED') {
      alert(
        'Completed sales orders cannot be deleted.',
      );
      return;
    }

    if (
      !window.confirm(
        'Delete this sales order?',
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/sales-orders/${order.id}`,
      );

      alert(
        'Sales order deleted successfully.',
      );

      if (editingId === order.id) {
        resetForm();
      }

      await loadData();
    } catch (error: any) {
      handleError(
        error,
        'Failed to delete sales order.',
      );
    }
  };

  // =========================================================
  // CUSTOMER NAME
  // =========================================================

  const customerName = (
    order: SalesOrder,
  ) => {
    return (
      order.customer?.name ||
      customers.find(
        (customer) =>
          customer.id ===
          order.customerId,
      )?.name ||
      `Customer #${order.customerId}`
    );
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const statusClass = (
    status: string,
  ) => {
    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalOrders = orders.length;

  const completedOrders =
    orders.filter(
      (order) =>
        order.status === 'COMPLETED',
    ).length;

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status !== 'COMPLETED',
    ).length;

  const totalSales = useMemo(
    () =>
      orders.reduce(
        (total, order) =>
          total +
          Number(
            order.totalAmount || 0,
          ),
        0,
      ),
    [orders],
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="sales-orders-page">

      {/* HEADER */}
      <div className="sales-orders-header">
        <div>
          <h1>Sales Orders</h1>

          <p>
            Create, manage and complete
            customer sales orders.
          </p>
        </div>

        <div className="sales-stat">
          <span>Total Orders</span>
          <strong>
            {totalOrders}
          </strong>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="sales-summary">

        <div className="summary-card">
          <span>Total Orders</span>
          <strong>
            {totalOrders}
          </strong>
        </div>

        <div className="summary-card">
          <span>Pending Orders</span>
          <strong>
            {pendingOrders}
          </strong>
        </div>

        <div className="summary-card">
          <span>Completed</span>
          <strong>
            {completedOrders}
          </strong>
        </div>

        <div className="summary-card">
          <span>Total Sales</span>
          <strong>
            ₹
            {totalSales.toLocaleString(
              'en-IN',
            )}
          </strong>
        </div>

      </div>

      {/* CREATE / EDIT */}
      <div className="sales-card">

        <div className="sales-card-header">
          <div>
            <h2>
              {editingId !== null
                ? `Edit Sales Order #${editingId}`
                : 'Create Sales Order'}
            </h2>

            <p className="sales-form-subtitle">
              Add one or more inventory
              items to the order.
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
          className="sales-form"
          onSubmit={submit}
        >

          {/* CUSTOMER */}
          <div className="customer-field">
            <label>
              Customer *
            </label>

            <select
              value={customerId}
              onChange={(e) =>
                setCustomerId(
                  e.target.value,
                )
              }
              required
            >
              <option value="">
                Select Customer
              </option>

              {customers.map(
                (customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* ITEMS */}
          <div className="items-section">

            <div className="items-section-header">
              <div>
                <h3>
                  Order Items
                </h3>

                <span>
                  {items.length}{' '}
                  {items.length === 1
                    ? 'item'
                    : 'items'}
                </span>
              </div>

              <button
                type="button"
                className="add-item-btn"
                onClick={addItem}
              >
                + Add Item
              </button>
            </div>

            <div className="order-item-list">

              {items.map(
                (row, index) => (
                  <div
                    className="order-item-row"
                    key={index}
                  >

                    <div className="item-number">
                      {index + 1}
                    </div>

                    {/* PRODUCT */}
                    <div className="item-field item-product">
                      <label>
                        Inventory Item *
                      </label>

                      <select
                        value={
                          row.inventoryId
                        }
                        onChange={(e) =>
                          handleInventoryChange(
                            index,
                            e.target.value,
                          )
                        }
                        required
                      >
                        <option value="">
                          Select Item
                        </option>

                        {inventory.map(
                          (product) => (
                            <option
                              key={
                                product.id
                              }
                              value={
                                product.id
                              }
                              disabled={
                                product.quantity <=
                                0
                              }
                            >
                              {product.name}{' '}
                              — Stock:{' '}
                              {
                                product.quantity
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {/* QUANTITY */}
                    <div className="item-field">
                      <label>
                        Quantity *
                      </label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={
                          row.quantity
                        }
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'quantity',
                            e.target.value,
                          )
                        }
                        required
                      />
                    </div>

                    {/* PRICE */}
                    <div className="item-field">
                      <label>
                        Unit Price *
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          row.price
                        }
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            'price',
                            e.target.value,
                          )
                        }
                        required
                      />
                    </div>

                    {/* TOTAL */}
                    <div className="item-field item-total">
                      <label>
                        Total
                      </label>

                      <strong>
                        ₹
                        {itemTotal(
                          row,
                        ).toLocaleString(
                          'en-IN',
                        )}
                      </strong>
                    </div>

                    {/* DELETE */}
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() =>
                        removeItem(
                          index,
                        )
                      }
                      title="Remove item"
                    >
                      ×
                    </button>

                  </div>
                ),
              )}

            </div>

            {/* ADD ITEM BOTTOM */}
            <button
              type="button"
              className="add-item-outline-btn"
              onClick={addItem}
            >
              + Add Another Item
            </button>

            {/* TOTAL */}
            <div className="order-total-box">

              <span>
                Order Total
              </span>

              <strong>
                ₹
                {orderTotal.toLocaleString(
                  'en-IN',
                )}
              </strong>

            </div>

          </div>

          {/* EDIT NOTICE */}
          {editingId !== null && (
            <div className="edit-notice">
              <strong>
                Edit Mode:
              </strong>{' '}
              You can change the customer,
              inventory items, quantities and
              prices.
            </div>
          )}

          {/* ACTIONS */}
          <div className="form-actions">

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Order'
                  : 'Create Order'}
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

      {/* ORDERS TABLE */}
      <div className="sales-card">

        <div className="sales-card-header">
          <div>
            <h2>
              Sales Orders
            </h2>

            <p className="sales-form-subtitle">
              View and manage customer
              orders.
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
            Loading sales orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            No sales orders found.
          </div>
        ) : (
          <div className="sales-table-wrapper">

            <table className="sales-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {orders.map(
                  (order) => (
                    <tr
                      key={order.id}
                    >

                      <td>
                        <strong>
                          #{order.id}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {customerName(
                            order,
                          )}
                        </strong>
                      </td>

                      <td>
                        <div className="order-items">

                          {order.items?.map(
                            (
                              orderItem,
                            ) => (
                              <div
                                key={
                                  orderItem.id
                                }
                              >
                                <span>
                                  {orderItem
                                    .inventory
                                    ?.name ||
                                    `Item #${orderItem.inventoryId}`}
                                </span>

                                <span>
                                  ×{' '}
                                  {
                                    orderItem.quantity
                                  }
                                </span>
                              </div>
                            ),
                          )}

                        </div>
                      </td>

                      <td>
                        <strong>
                          ₹
                          {Number(
                            order.totalAmount,
                          ).toLocaleString(
                            'en-IN',
                          )}
                        </strong>
                      </td>

                      <td>
                        {order.orderDate
                          ? new Date(
                              order.orderDate,
                            ).toLocaleDateString(
                              'en-IN',
                            )
                          : '—'}
                      </td>

                      <td>
                        <span
                          className={`order-status ${statusClass(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td>
                        <div className="order-actions">

                          {order.status !==
                            'COMPLETED' && (
                            <>
                              <button
                                type="button"
                                className="edit-btn"
                                onClick={() =>
                                  edit(
                                    order,
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="complete-btn"
                                onClick={() =>
                                  completeOrder(
                                    order.id,
                                  )
                                }
                              >
                                Complete
                              </button>

                              <button
                                type="button"
                                className="delete-btn"
                                onClick={() =>
                                  remove(
                                    order,
                                  )
                                }
                              >
                                Delete
                              </button>
                            </>
                          )}

                          {order.status ===
                            'COMPLETED' && (
                            <span className="completed-label">
                              Completed
                            </span>
                          )}

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

export default SalesOrders;