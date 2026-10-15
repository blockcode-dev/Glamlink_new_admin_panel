/** @format */

import React, { useEffect, useState } from "react";
import { Table, Modal, message, Select, Card, Tooltip } from "antd";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { EyeOutlined, LinkOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Box } from "@material-ui/core";
import "./AccessOrders.scss";
import {
  GetAllAccessOrders,
  GetAccessOrderById,
  UpdateAccessOrderFulfillment,
} from "../../services/Api/BusinessCardApi";

const VEGAS_TZ = "America/Los_Angeles";

const formatVegasShort = (dateStr) => {
  if (!dateStr) return { date: "-", time: "" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { date: "-", time: "" };
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: VEGAS_TZ,
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: VEGAS_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return { date, time };
};

const formatVegasFull = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: VEGAS_TZ,
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d) + " PT"
  );
};

const isPhysical = (order) =>
  order?.fulfillment_status !== null && order?.fulfillment_status !== undefined;

const Pill = ({ text, type }) => (
  <span className={`ao-pill ao-pill-${type}`}>{text}</span>
);

const AccessOrders = () => {
  const [orders, setOrders] = useState([]);
  const [backupOrders, setBackupOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [editStatus, setEditStatus] = useState(undefined);
  const [editTracking, setEditTracking] = useState("");
  const [editTrackingLink, setEditTrackingLink] = useState("");

  // Fetch once, filter client-side — same reliable pattern as the
  // Business Card list page, so search always works regardless of
  // backend query support.
  const getData = async () => {
    try {
      setLoading(true);
      const res = await GetAllAccessOrders({ page: 1, limit: 200 });
      const rows = res?.data?.data?.data;
      const list = Array.isArray(rows) ? rows : [];

      setOrders(list);
      setBackupOrders(list);
    } catch (e) {
      console.log(e);
      message.error("Failed to load Access Orders");
      setOrders([]);
      setBackupOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const onSearch = (value) => {
    const term = value?.toLowerCase().trim();
    setSearch(value);

    if (!term) {
      setOrders(backupOrders);
      return;
    }

    setOrders(
      backupOrders.filter(
        (o) =>
          o.order_number?.toLowerCase().includes(term) ||
          o.customer_name?.toLowerCase().includes(term) ||
          o.customer_email?.toLowerCase().includes(term),
      ),
    );
  };

  const openOrderDetails = async (record) => {
    try {
      const res = await GetAccessOrderById(record.id);
      const order = res?.data?.data || res?.data;

      setSelectedOrder(order);
      setEditStatus(order.fulfillment_status || undefined);
      setEditTracking(order.tracking_number || "");
      setEditTrackingLink(order.tracking_link || "");
      setDetailModalOpen(true);
    } catch (e) {
      message.error("Failed to load order details");
    }
  };

  const applyLocalUpdate = (orderId, changes) => {
    const update = (list) =>
      list.map((o) => (o.id === orderId ? { ...o, ...changes } : o));
    setOrders(update);
    setBackupOrders(update);
  };

  const quickUpdateFulfillment = async (orderId, status) => {
    const previous = orders;
    applyLocalUpdate(orderId, { fulfillment_status: status });

    try {
      await UpdateAccessOrderFulfillment(orderId, { fulfillment_status: status });
      message.success(`Marked as ${status.toUpperCase()}`);
    } catch (e) {
      setOrders(previous);
      setBackupOrders(previous);
      message.error(
        e?.response?.data?.message || "Failed to update fulfillment status",
      );
    }
  };

  const handleSaveOrderDetails = async () => {
    if (!selectedOrder) return;

    try {
      setSavingOrder(true);

      const payload = {
        fulfillment_status: editStatus,
        tracking_number: editTracking || null,
        tracking_link: editTrackingLink || null,
      };

      await UpdateAccessOrderFulfillment(selectedOrder.id, payload);
      applyLocalUpdate(selectedOrder.id, payload);

      message.success("Order updated");
      setDetailModalOpen(false);
    } catch (e) {
      message.error(e?.response?.data?.message || "Failed to update order");
    } finally {
      setSavingOrder(false);
    }
  };

  // No modal, no fetch — same as the "View Card" chip in BusinessCard.jsx,
  // just opens the live public Access Card in a new tab.
  const viewAccessCard = (link) => {
    if (!link) {
      message.warning("No Access Card link found for this order");
      return;
    }
    window.open(link, "_blank", "noreferrer");
  };

  const columns = [
    {
      title: "Order",
      dataIndex: "order_number",
      render: (orderNumber, record) => {
        const { date, time } = formatVegasShort(record.created_at);
        return (
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{orderNumber}</div>
            <div style={{ fontSize: 11, color: "#999" }}>
              {date} · {time} PT
            </div>
          </div>
        );
      },
    },
    {
      title: "Customer",
      dataIndex: "customer_name",
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 13 }}>{name}</div>
          <div style={{ fontSize: 11, color: "#999" }}>{record.customer_email}</div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount_paid",
      render: (amount, record) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            ${Number(amount || 0).toFixed(2)}
          </div>
          <Pill
            text={record.payment_status?.toUpperCase()}
            type={record.payment_status}
          />
        </div>
      ),
    },
    {
      title: "Ship To",
      dataIndex: "shipping_address_line_1",
      render: (_, record) =>
        isPhysical(record) ? (
          <div style={{ fontSize: 12, lineHeight: 1.5, maxWidth: 200 }}>
            <div style={{ fontWeight: 600 }}>{record.recipient_name}</div>
            <div style={{ color: "#555" }}>
              {record.shipping_address_line_1}
              {record.shipping_address_line_2
                ? `, ${record.shipping_address_line_2}`
                : ""}
            </div>
            <div style={{ color: "#555" }}>
              {record.shipping_city}, {record.shipping_state}{" "}
              {record.shipping_postal_code}
            </div>
          </div>
        ) : (
          <span style={{ color: "#bbb", fontSize: 11 }}>Subscription</span>
        ),
    },
    {
      title: "Fulfillment",
      dataIndex: "fulfillment_status",
      render: (status, record) =>
        isPhysical(record) ? (
          <Select
            size="small"
            className="ao-fulfillment-select"
            value={status}
            style={{ width: 125 }}
            onChange={(value) => quickUpdateFulfillment(record.id, value)}
            options={[
              { value: "pending", label: "Pending" },
              { value: "processing", label: "Processing" },
              { value: "shipped", label: "Shipped" },
              { value: "delivered", label: "Delivered" },
            ]}
          />
        ) : (
          <span style={{ color: "#bbb", fontSize: 11 }}>N/A</span>
        ),
    },
    {
      title: "Tracking",
      dataIndex: "tracking_number",
      render: (tracking) =>
        tracking ? (
          <span style={{ fontSize: 12 }}>{tracking}</span>
        ) : (
          <span style={{ color: "#ccc" }}>—</span>
        ),
    },
    {
      title: "Actions",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          <Tooltip title="View Order Details">
            <button
              type="button"
              className="ao-action-btn"
              onClick={() => openOrderDetails(record)}
            >
              <EyeOutlined />
            </button>
          </Tooltip>

          <Tooltip title="View Access Card">
            <button
              type="button"
              className="ao-action-btn"
              onClick={() => viewAccessCard(record.business_card?.business_card_link)}
            >
              <LinkOutlined />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <Box className="ao-page">
      <div className="ao-header">
        <div>
          <h3 className="ao-title">Access Orders</h3>
          <p className="ao-subtitle">
            Fulfill NFC keychain shipments · times shown in Las Vegas (Pacific)
          </p>
        </div>

        <span className="p-input-icon-left ao-search">
          <InputText
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by name, email or order #"
          />
        </span>
      </div>

      <Card className="ao-table-card" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={orders}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* ===================== Order Details Modal ===================== */}
      <Modal
        className="ao-modal"
        title={null}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        width={600}
        footer={null}
        bodyStyle={{ padding: 0 }}
        centered
        style={{ borderRadius: 12, overflow: "hidden" }}
      >
        {selectedOrder && (
          <div>
            <div className="ao-modal-header">
              <div>
                <div className="ao-modal-eyebrow">Order</div>
                <h2 className="ao-modal-heading">{selectedOrder.order_number}</h2>
                <p className="ao-modal-subheading">
                  {formatVegasFull(selectedOrder.created_at)}
                </p>
              </div>
              <Pill
                text={selectedOrder.payment_status?.toUpperCase()}
                type={selectedOrder.payment_status}
              />
            </div>

            <div className="ao-modal-body">
              <div className="ao-info-grid">
                <div className="ao-info-item">
                  <div className="label">Customer</div>
                  <div className="value">{selectedOrder.customer_name}</div>
                </div>
                <div className="ao-info-item">
                  <div className="label">Email</div>
                  <div className="value">{selectedOrder.customer_email}</div>
                </div>
                <div className="ao-info-item">
                  <div className="label">Amount Paid</div>
                  <div className="value">
                    ${Number(selectedOrder.amount_paid || 0).toFixed(2)}
                  </div>
                </div>
                <div className="ao-info-item">
                  <div className="label">Shipping Fee</div>
                  <div className="value">
                    ${Number(selectedOrder.shipping_amount || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <Tooltip title="Opens the live public Access Card in a new tab">
                <div
                  className="ao-link-btn"
                  onClick={() =>
                    viewAccessCard(selectedOrder.business_card?.business_card_link)
                  }
                >
                  <LinkOutlined /> View Access Card
                </div>
              </Tooltip>

              {isPhysical(selectedOrder) ? (
                <>
                  <div className="ao-section-label">
                    <EnvironmentOutlined /> Shipping Address
                  </div>
                  <div className="ao-box">
                    <strong>{selectedOrder.recipient_name}</strong>
                    <br />
                    {selectedOrder.shipping_address_line_1}
                    {selectedOrder.shipping_address_line_2
                      ? `, ${selectedOrder.shipping_address_line_2}`
                      : ""}
                    <br />
                    {selectedOrder.shipping_city}, {selectedOrder.shipping_state}{" "}
                    {selectedOrder.shipping_postal_code}
                    <br />
                    {selectedOrder.shipping_country}
                  </div>

                  <div className="ao-section-label">Fulfillment</div>

                  <div style={{ marginBottom: 14 }}>
                    <div className="ao-info-item" style={{ marginBottom: 12 }}>
                      <div className="label">Status</div>
                      <Select
                        value={editStatus}
                        style={{ width: "100%", marginTop: 4 }}
                        onChange={setEditStatus}
                        options={[
                          { value: "pending", label: "Pending" },
                          { value: "processing", label: "Processing" },
                          { value: "shipped", label: "Shipped" },
                          { value: "delivered", label: "Delivered" },
                        ]}
                      />
                    </div>

                    <div className="ao-info-item" style={{ marginBottom: 12 }}>
                      <div className="label">Tracking Number</div>
                      <InputText
                        value={editTracking}
                        onChange={(e) => setEditTracking(e.target.value)}
                        placeholder="e.g. 1Z999AA10123456784"
                        style={{ width: "100%", marginTop: 4 }}
                      />
                    </div>

                    <div className="ao-info-item">
                      <div className="label">Tracking Link (optional)</div>
                      <InputText
                        value={editTrackingLink}
                        onChange={(e) => setEditTrackingLink(e.target.value)}
                        placeholder="https://carrier.com/track/..."
                        style={{ width: "100%", marginTop: 4 }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="ao-box" style={{ textAlign: "center", color: "#888" }}>
                  Subscription only — no shipping or fulfillment required.
                </div>
              )}

              <div style={{ textAlign: "right" }}>
                <Button
                  className="ao-save-btn"
                  label="Save Changes"
                  loading={savingOrder}
                  disabled={!isPhysical(selectedOrder)}
                  onClick={handleSaveOrderDetails}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Box>
  );
};

export default AccessOrders;