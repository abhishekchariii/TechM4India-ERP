import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import api from '../services/api';
import './PurchaseOrders.css';

interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

interface Inventory {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface PurchaseOrderItem {
  id: number;
  inventoryId: number;
  quantity: number;
  price: number;
  inventory?: Inventory;
}

interface PurchaseOrder {
  id: number;
  supplierId: number;
  orderDate?: string;
  createdAt?: string;
  status: string;
  totalAmount: number;
  supplier?: Supplier;
  items: PurchaseOrderItem[];
}

interface FormItem {
  inventoryId: string;
  quantity: string;
  price: string;
}

const emptyItem: FormItem = {
  inventoryId: '',
  quantity: '1',
  price: '',
};

function PurchaseOrders() {
  const [orders, setOrders] =
    useState<PurchaseOrder[]>([]);

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [inventory, setInventory] =
    useState<Inventory[]>([]);

  const [supplierId, setSupplierId] =
    useState('');

  const [items, setItems] =
    useState<FormItem[]>([
      { ...emptyItem },
    ]);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

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
        suppliersRes,
        inventoryRes,
      ] = await Promise.all([
        api.get('/purchase-orders'),
        api.get('/suppliers'),
        api.get('/inventory'),
      ]);

      setOrders(ordersRes.data);
      setSuppliers(
        suppliersRes.data,
      );
      setInventory(
        inventoryRes.data,
      );
    } catch (error: any) {
      handleError(
        error,
        'Failed to load purchase order data.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // RESET
  // =========================================================

  const resetForm = () => {
    setSupplierId('');

    setItems([
      { ...emptyItem },
    ]);

    setEditingId(null);
  };

  // =========================================================
  // UPDATE ITEM
  // =========================================================

  const updateItem = (
    index: number,
    field: keyof FormItem,
    value: string,
  ) => {
    setItems((current) =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item,
      ),
    );
  };

  // =========================================================
  // INVENTORY CHANGE
  // =========================================================

  const handleInventoryChange = (
    index: number,
    value: string,
  ) => {
    const selected =
      inventory.find(
        (item) =>
          String(item.id) === value,
      );

    setItems((current) =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                inventoryId:
                  value,
                price: selected
                  ? String(
                      selected.price,
                    )
                  : '',
              }
            : item,
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

  const removeItem = (
    index: number,
  ) => {
    if (items.length === 1) {
      alert(
        'At least one item is required.',
      );

      return;
    }

    setItems((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      ),
    );
  };

  // =========================================================
  // ITEM TOTAL
  // =========================================================

  const getItemTotal = (
    item: FormItem,
  ) => {
    const quantity = Number(
      item.quantity || 0,
    );

    const price = Number(
      item.price || 0,
    );

    return quantity * price;
  };

  // =========================================================
  // FORM TOTAL
  // =========================================================

  const calculateFormTotal =
    useMemo(() => {
      return items.reduce(
        (total, item) =>
          total +
          getItemTotal(item),
        0,
      );
    }, [items]);

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    if (!supplierId) {
      alert(
        'Please select a supplier.',
      );

      return false;
    }

    if (
      items.length === 0
    ) {
      alert(
        'At least one item is required.',
      );

      return false;
    }

    const selectedIds =
      new Set<number>();

    for (
      let i = 0;
      i < items.length;
      i++
    ) {
      const item = items[i];

      if (!item.inventoryId) {
        alert(
          `Please select an inventory item for row ${i + 1}.`,
        );

        return false;
      }

      const inventoryId =
        Number(
          item.inventoryId,
        );

      const quantity =
        Number(
          item.quantity,
        );

      const price =
        Number(item.price);

      // Duplicate item
      if (
        selectedIds.has(
          inventoryId,
        )
      ) {
        alert(
          'The same inventory item cannot be added twice.',
        );

        return false;
      }

      selectedIds.add(
        inventoryId,
      );

      // Quantity
      if (
        !Number.isInteger(
          quantity,
        ) ||
        quantity < 1
      ) {
        alert(
          `Quantity must be a positive whole number in row ${i + 1}.`,
        );

        return false;
      }

      // Price
      if (
        Number.isNaN(price) ||
        price < 0
      ) {
        alert(
          `Price cannot be negative in row ${i + 1}.`,
        );

        return false;
      }
    }

    return true;
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const submit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        supplierId:
          Number(supplierId),

        items: items.map(
          (item) => ({
            inventoryId:
              Number(
                item.inventoryId,
              ),

            quantity:
              Number(
                item.quantity,
              ),

            price:
              Number(item.price),
          }),
        ),
      };

      if (
        editingId !== null
      ) {
        await api.patch(
          `/purchase-orders/${editingId}`,
          payload,
        );

        alert(
          'Purchase order updated successfully.',
        );
      } else {
        await api.post(
          '/purchase-orders',
          payload,
        );

        alert(
          'Purchase order created successfully.',
        );
      }

      resetForm();

      await loadData();
    } catch (error: any) {
      handleError(
        error,
        editingId !== null
          ? 'Failed to update purchase order.'
          : 'Failed to create purchase order.',
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const edit = (
    order: PurchaseOrder,
  ) => {
    if (
      order.status ===
      'RECEIVED'
    ) {
      alert(
        'Received Purchase Orders cannot be edited.',
      );

      return;
    }

    setEditingId(order.id);

    setSupplierId(
      String(order.supplierId),
    );

    if (
      order.items &&
      order.items.length > 0
    ) {
      setItems(
        order.items.map(
          (item) => ({
            inventoryId:
              String(
                item.inventoryId,
              ),

            quantity:
              String(
                item.quantity,
              ),

            price:
              String(item.price),
          }),
        ),
      );
    } else {
      setItems([
        { ...emptyItem },
      ]);
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // =========================================================
  // RECEIVE
  // =========================================================

  const receive = async (
    order: PurchaseOrder,
  ) => {
    if (
      order.status ===
      'RECEIVED'
    ) {
      alert(
        'This purchase order has already been received.',
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Receive Purchase Order #${order.id}?\n\nInventory stock will increase for all items in this order.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.patch(
        `/purchase-orders/${order.id}/receive`,
      );

      alert(
        `Purchase Order #${order.id} received successfully.`,
      );

      await loadData();
    } catch (error: any) {
      handleError(
        error,
        'Failed to receive purchase order.',
      );
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const remove = async (
    order: PurchaseOrder,
  ) => {
    if (
      order.status ===
      'RECEIVED'
    ) {
      alert(
        'Received Purchase Orders cannot be deleted.',
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete Purchase Order #${order.id}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/purchase-orders/${order.id}`,
      );

      alert(
        'Purchase order deleted successfully.',
      );

      if (
        editingId === order.id
      ) {
        resetForm();
      }

      await loadData();
    } catch (error: any) {
      handleError(
        error,
        'Failed to delete purchase order.',
      );
    }
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalPurchaseValue =
    orders.reduce(
      (total, order) =>
        total +
        Number(
          order.totalAmount || 0,
        ),
      0,
    );

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status !==
        'RECEIVED',
    ).length;

  const receivedOrders =
    orders.filter(
      (order) =>
        order.status ===
        'RECEIVED',
    ).length;

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const statusClass = (
    status: string,
  ) =>
    status
      .toLowerCase()
      .replace(
        /\s+/g,
        '-',
      );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="purchase-orders-page">

      {/* HEADER */}

      <div className="purchase-header">
        <div>
          <h1>
            Purchase Orders
          </h1>

          <p>
            Manage suppliers,
            purchase orders and
            incoming inventory.
          </p>
        </div>

        <div className="purchase-stats">

          <div className="purchase-stat">
            <span>
              Total Orders
            </span>

            <strong>
              {orders.length}
            </strong>
          </div>

          <div className="purchase-stat">
            <span>
              Pending
            </span>

            <strong>
              {pendingOrders}
            </strong>
          </div>

          <div className="purchase-stat">
            <span>
              Received
            </span>

            <strong>
              {receivedOrders}
            </strong>
          </div>

          <div className="purchase-stat">
            <span>
              Total Value
            </span>

            <strong>
              ₹
              {totalPurchaseValue.toLocaleString(
                'en-IN',
              )}
            </strong>
          </div>

        </div>
      </div>

      {/* CREATE / EDIT */}

      <div className="purchase-card">

        <div className="purchase-card-header">
          <div>
            <h2>
              {editingId !== null
                ? `Edit Purchase Order #${editingId}`
                : 'Create Purchase Order'}
            </h2>

            <p>
              {editingId !== null
                ? 'Update supplier and purchase items.'
                : 'Add supplier and one or more inventory items.'}
            </p>
          </div>

          {editingId !== null && (
            <button
              type="button"
              className="secondary-btn"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form
          className="purchase-form"
          onSubmit={submit}
        >

          {/* SUPPLIER */}

          <div className="form-field">
            <label>
              Supplier *
            </label>

            <select
              value={supplierId}
              onChange={(event) =>
                setSupplierId(
                  event.target.value,
                )
              }
              required
            >
              <option value="">
                Select Supplier
              </option>

              {suppliers.map(
                (supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.name}
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
                  Purchase Items
                </h3>

                <p>
                  Add inventory items,
                  quantities and purchase
                  prices.
                </p>
              </div>

              <button
                type="button"
                className="add-item-btn"
                onClick={addItem}
              >
                + Add Item
              </button>

            </div>

            <div className="item-list">

              {items.map(
                (
                  item,
                  index,
                ) => (
                  <div
                    className="item-row"
                    key={index}
                  >

                    <div className="item-index">
                      {index + 1}
                    </div>

                    {/* INVENTORY */}

                    <div className="form-field item-product">
                      <label>
                        Inventory Item *
                      </label>

                      <select
                        value={
                          item.inventoryId
                        }
                        onChange={(
                          event,
                        ) =>
                          handleInventoryChange(
                            index,
                            event.target
                              .value,
                          )
                        }
                        required
                      >
                        <option value="">
                          Select Item
                        </option>

                        {inventory.map(
                          (
                            stockItem,
                          ) => (
                            <option
                              key={
                                stockItem.id
                              }
                              value={
                                stockItem.id
                              }
                            >
                              {
                                stockItem.name
                              }{' '}
                              — Stock:{' '}
                              {
                                stockItem.quantity
                              }
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {/* QUANTITY */}

                    <div className="form-field">
                      <label>
                        Quantity *
                      </label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={
                          item.quantity
                        }
                        onChange={(
                          event,
                        ) =>
                          updateItem(
                            index,
                            'quantity',
                            event.target
                              .value,
                          )
                        }
                        required
                      />
                    </div>

                    {/* PRICE */}

                    <div className="form-field">
                      <label>
                        Unit Price *
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          item.price
                        }
                        onChange={(
                          event,
                        ) =>
                          updateItem(
                            index,
                            'price',
                            event.target
                              .value,
                          )
                        }
                        required
                      />
                    </div>

                    {/* TOTAL */}

                    <div className="item-total">
                      <span>
                        Item Total
                      </span>

                      <strong>
                        ₹
                        {getItemTotal(
                          item,
                        ).toLocaleString(
                          'en-IN',
                        )}
                      </strong>
                    </div>

                    {/* REMOVE */}

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

            <button
              type="button"
              className="add-item-outline-btn"
              onClick={addItem}
            >
              + Add Another Item
            </button>

          </div>

          {/* TOTAL */}

          <div className="purchase-total">
            <span>
              Order Total
            </span>

            <strong>
              ₹
              {calculateFormTotal.toLocaleString(
                'en-IN',
              )}
            </strong>
          </div>

          {/* ACTIONS */}

          <div className="purchase-form-actions">

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingId !== null
                  ? 'Update Purchase Order'
                  : 'Create Purchase Order'}
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

      {/* ORDERS */}

      <div className="purchase-card">

        <div className="purchase-card-header">

          <div>
            <h2>
              Purchase Orders
            </h2>

            <p>
              Track all purchase
              orders and receiving
              status.
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
            Loading purchase
            orders...
          </div>
        ) : orders.length ===
          0 ? (
          <div className="empty-state">
            No purchase orders
            found.
          </div>
        ) : (
          <div className="purchase-table-wrapper">

            <table className="purchase-table">

              <thead>
                <tr>
                  <th>
                    ID
                  </th>

                  <th>
                    Supplier
                  </th>

                  <th>
                    Items
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Date
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

                {orders.map(
                  (order) => (
                    <tr
                      key={order.id}
                    >

                      <td>
                        <strong>
                          #
                          {
                            order.id
                          }
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {order
                            .supplier
                            ?.name ||
                            `Supplier #${order.supplierId}`}
                        </strong>
                      </td>

                      <td>
                        <div className="order-items">

                          {order.items.map(
                            (
                              item,
                            ) => (
                              <div
                                className="order-item"
                                key={
                                  item.id
                                }
                              >
                                <span>
                                  {item
                                    .inventory
                                    ?.name ||
                                    `Item #${item.inventoryId}`}
                                </span>

                                <small>
                                  ×{' '}
                                  {
                                    item.quantity
                                  }{' '}
                                  @ ₹
                                  {Number(
                                    item.price,
                                  ).toLocaleString(
                                    'en-IN',
                                  )}
                                </small>
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
                        {new Date(
                          order.orderDate ||
                            order.createdAt ||
                            Date.now(),
                        ).toLocaleDateString(
                          'en-IN',
                        )}
                      </td>

                      <td>
                        <span
                          className={`purchase-status ${statusClass(
                            order.status,
                          )}`}
                        >
                          {
                            order.status
                          }
                        </span>
                      </td>

                      <td>
                        <div className="purchase-actions">

                          {order.status !==
                            'RECEIVED' && (
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
                                className="receive-btn"
                                onClick={() =>
                                  receive(
                                    order,
                                  )
                                }
                              >
                                Receive
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
                            'RECEIVED' && (
                            <span className="completed-label">
                              Received
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

export default PurchaseOrders;