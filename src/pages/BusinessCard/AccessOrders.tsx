/** @format */

import React, { useEffect, useState } from "react";
import {
  Table,
  Modal,
  message,
  Select,
  Card,
  Tooltip,
  Button,
  Input,
  Alert,
  Popconfirm,
  Radio,
  Spin,
  Tag,
  type TableColumnsType,
} from "antd";
import {
  EyeOutlined,
  LinkOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  PrinterOutlined,
  ExportOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router";
import "./AccessOrders.scss";
import {
  GetAllAccessOrders,
  GetAccessOrderById,
  UpdateAccessOrderFulfillment,
  accessOrderFromResponse,
  GetAccessOrderRates,
  BuyAccessOrderLabel,
  VoidAccessOrderLabel,
} from "../../services/Api/BusinessCardApi";
import { apiErrorCode, apiErrorMessage } from "../../utils/apiError";
import { money } from "../../utils/money";
import type { AccessOrder, FulfillmentStatus, FulfillmentUpdate } from "../../types/businessCard";
import type { ShippingRate } from "../../types/access";

const VEGAS_TZ = "America/Los_Angeles";

const formatVegasShort = (dateStr: string | null | undefined) => {
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

const formatVegasFull = (dateStr: string | null | undefined) => {
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

const isPhysical = (order: AccessOrder | null | undefined) =>
  order?.fulfillment_status !== null && order?.fulfillment_status !== undefined;

const Pill = ({ text, type }: { text?: string; type?: string | null }) => (
  <span className={`ao-pill ao-pill-${type}`}>{text}</span>
);

// ---- Shipping labels (Shippo) ----

/** Shippo's tracking statuses, worded for people. */
const TRACKING: Partial<Record<string, { label: string; color?: string }>> = {
  PRE_TRANSIT: { label: "Awaiting pickup" },
  TRANSIT: { label: "In transit", color: "blue" },
  DELIVERED: { label: "Delivered", color: "green" },
  RETURNED: { label: "Returned", color: "orange" },
  FAILURE: { label: "Delivery problem", color: "red" },
  UNKNOWN: { label: "Unknown" },
};

const TrackingTag = ({ status }: { status?: string | null }) => {
  if (!status) return null;
  const known = TRACKING[status];
  return <Tag color={known?.color}>{known?.label ?? status}</Tag>;
};

/** Shippo's tags on a rate. */
const RATE_TAGS: Partial<Record<string, string>> = { CHEAPEST: "Cheapest", FASTEST: "Fastest", BESTVALUE: "Best value" };

/** Shippo's refund of a voided label. */
const REFUND_WORDS: Partial<Record<string, string>> = {
  QUEUED: "Shippo's refund is on its way",
  PENDING: "Shippo's refund is on its way",
  SUCCESS: "Shippo has refunded it",
  ERROR: "Shippo couldn't refund it; check Shippo's dashboard",
};

/** The order has a label (bought and not voided). */
const hasLabel = (order: AccessOrder) => Boolean(order.shippo_transaction_id);

/** The parcel is moving (Shippo's tracking, or marked by hand): no voiding its label, no new one. */
const isOnItsWay = (order: AccessOrder) =>
  order.fulfillment_status === "shipped" || order.fulfillment_status === "delivered";

const carrierAndService = (order: AccessOrder) => [order.carrier, order.service].filter(Boolean).join(" ");

/** What "Buy label" buys when no rate is picked (the API's default). */
const defaultRateText = (order: AccessOrder) =>
  order.shippo_rate_id
    ? `the rate chosen at checkout${carrierAndService(order) ? ` (${carrierAndService(order)})` : ""}, or today's rate for the same service if that one has expired`
    : "the cheapest rate today: shipping was flat or free at checkout, so the customer didn't pick a carrier";

const rateDays = (rate: ShippingRate) =>
  rate.estimated_days
    ? `About ${rate.estimated_days} day${rate.estimated_days === 1 ? "" : "s"}`
    : rate.duration_terms || "";

interface LabelSectionProps {
  order: AccessOrder;
  onBuy: () => void;
  onVoid: () => Promise<void>;
}

/** The order's label and tracking, with buying, printing and voiding the label. Only for orders that ship. */
const LabelSection = ({ order, onBuy, onVoid }: LabelSectionProps) => {
  const labelBought = hasLabel(order);
  const moving = isOnItsWay(order);

  return (
    <>
      <div className="ao-section-label">
        <PrinterOutlined /> Shipping label
      </div>
      <div className="ao-box">
        <div className="ao-info-grid ao-label-grid">
          <div className="ao-info-item">
            <div className="label">{labelBought ? "Carrier" : "Carrier chosen at checkout"}</div>
            <div className="value">{order.carrier || "—"}</div>
          </div>
          <div className="ao-info-item">
            <div className="label">Service</div>
            <div className="value">{order.service || "—"}</div>
          </div>
          <div className="ao-info-item">
            <div className="label">Tracking number</div>
            <div className="value">
              {!order.tracking_number ? (
                "—"
              ) : order.tracking_link ? (
                <a href={order.tracking_link} target="_blank" rel="noopener noreferrer">
                  {order.tracking_number} <ExportOutlined />
                </a>
              ) : (
                order.tracking_number
              )}
            </div>
          </div>
          <div className="ao-info-item">
            <div className="label">Tracking</div>
            <div className="value">
              {order.tracking_status ? (
                <TrackingTag status={order.tracking_status} />
              ) : labelBought ? (
                "Not scanned yet"
              ) : (
                "—"
              )}
              {order.tracking_status_details && <div className="ao-label-note">{order.tracking_status_details}</div>}
            </div>
          </div>
          <div className="ao-info-item">
            <div className="label">Shipped</div>
            <div className="value">{formatVegasFull(order.shipped_at)}</div>
          </div>
          <div className="ao-info-item">
            <div className="label">Delivered</div>
            <div className="value">{formatVegasFull(order.delivered_at)}</div>
          </div>
        </div>

        {labelBought ? (
          <div className="ao-label-actions">
            {order.label_url && (
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                href={order.label_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Print label
              </Button>
            )}
            {moving ? (
              <Tooltip title="The parcel is on its way, so its label can't be voided.">
                <Button danger icon={<StopOutlined />} disabled>
                  Void label
                </Button>
              </Tooltip>
            ) : (
              <Popconfirm
                title="Void this label?"
                description="Shippo refunds an unused label. The order goes back to pending, and you can buy a new one."
                okText="Void label"
                okButtonProps={{ danger: true }}
                cancelText="Keep it"
                onConfirm={onVoid}
              >
                <Button danger icon={<StopOutlined />}>
                  Void label
                </Button>
              </Popconfirm>
            )}
            <span className="ao-label-note">Bought {formatVegasFull(order.label_created_at)}</span>
          </div>
        ) : moving ? (
          <div className="ao-label-note">Marked {order.fulfillment_status} by hand; no label was bought here.</div>
        ) : (
          <div className="ao-label-actions">
            <Button type="primary" icon={<PrinterOutlined />} onClick={onBuy}>
              Buy label
            </Button>
            <span className="ao-label-note">Unless you pick a rate, it buys {defaultRateText(order)}.</span>
          </div>
        )}
      </div>
    </>
  );
};

// The rate picker's first choice: send no rate and let the API use the checkout's (see defaultRateText).
const CHECKOUT_RATE = "checkout";

interface BuyLabelModalProps {
  order: AccessOrder;
  onClose: () => void;
  onBought: (order: AccessOrder) => void;
  /** The order already has a label (bought meanwhile): show it as it is now. */
  onStale: () => void;
}

// Mounted only while open: each opening asks Shippo for today's rates.
const BuyLabelModal = ({ order, onClose, onBought, onStale }: BuyLabelModalProps) => {
  const [rates, setRates] = useState<ShippingRate[] | null>(null);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [choice, setChoice] = useState(CHECKOUT_RATE);
  const [buying, setBuying] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    GetAccessOrderRates(order.id)
      .then((res) => {
        if (active) setRates(res.data.data.rates);
      })
      .catch((err) => {
        if (!active) return;
        setRates([]);
        setRatesError(apiErrorMessage(err) || "Couldn't get today's rates from Shippo");
      });
    return () => {
      active = false;
    };
  }, [order.id]);

  const buy = async () => {
    try {
      setBuying(true);
      setFailure(null);
      const res = await BuyAccessOrderLabel(order.id, choice === CHECKOUT_RATE ? undefined : choice);
      message.success("Label bought. Print it from the order.");
      onBought(res.data.data);
    } catch (err) {
      if (apiErrorCode(err) === "LABEL_EXISTS") {
        message.warning(apiErrorMessage(err) || "This order already has a label");
        onStale();
      } else {
        // LABEL_FAILED carries Shippo's reasons in its message; NOTHING_TO_SHIP and NO_SHIPPING_RATES say what's wrong.
        setFailure(apiErrorMessage(err) || "Couldn't buy the label");
      }
    } finally {
      setBuying(false);
    }
  };

  const checkoutService = carrierAndService(order);

  return (
    <Modal
      open
      className="ao-rate-modal"
      title={`Buy a label for ${order.order_number}`}
      okText="Buy label"
      onOk={buy}
      confirmLoading={buying}
      onCancel={onClose}
      width={580}
      destroyOnHidden
    >
      <p className="ao-label-note">
        Shippo charges the label to Glamlink's account; an unused label can be voided for a refund.
      </p>
      {failure && <Alert className="ao-label-alert" type="error" showIcon title={failure} />}
      {ratesError && (
        <Alert
          className="ao-label-alert"
          type="warning"
          showIcon
          title={ratesError}
          description="You can still buy with the first choice."
        />
      )}
      <Radio.Group
        className="ao-rates"
        orientation="vertical"
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
      >
        <Radio value={CHECKOUT_RATE}>
          <div className="ao-rate-title">
            {order.shippo_rate_id
              ? `The rate chosen at checkout${checkoutService ? `: ${checkoutService}` : ""}`
              : "The cheapest rate today"}
          </div>
          <div className="ao-label-note">
            {order.shippo_rate_id
              ? "If it has expired, today's rate for the same service is bought."
              : "Shipping was flat or free at checkout, so the customer didn't pick a carrier."}
          </div>
        </Radio>
        {rates === null ? (
          <Spin size="small" description="Getting today's rates…" />
        ) : (
          rates.map((rate) => (
            <Radio key={rate.rate_id} value={rate.rate_id}>
              <div className="ao-rate-title">
                {rate.provider} {rate.service} · {money(rate.amount_cents)}
              </div>
              <div className="ao-label-note">
                {rateDays(rate)}{" "}
                {rate.attributes.map((tag) => (RATE_TAGS[tag] ? <Tag key={tag}>{RATE_TAGS[tag]}</Tag> : null))}
                {rate.provider === order.carrier && rate.service === order.service && (
                  <Tag color="blue">Chosen at checkout</Tag>
                )}
              </div>
            </Radio>
          ))
        )}
        {rates?.length === 0 && !ratesError && (
          <div className="ao-label-note">Shippo has no other rates for this parcel today.</div>
        )}
      </Radio.Group>
    </Modal>
  );
};

const AccessOrders = () => {
  const [orders, setOrders] = useState<AccessOrder[]>([]);
  const [backupOrders, setBackupOrders] = useState<AccessOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AccessOrder | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [editStatus, setEditStatus] = useState<FulfillmentStatus | undefined>(undefined);
  const [editTracking, setEditTracking] = useState("");
  const [editTrackingLink, setEditTrackingLink] = useState("");
  // How many orders the API counts, when that's more than it sent.
  const [total, setTotal] = useState<number | null>(null);
  const [buyingLabelFor, setBuyingLabelFor] = useState<AccessOrder | null>(null);
  // The admin's order email links to /access-orders/:id.
  const { id: routeId } = useParams();
  const navigate = useNavigate();

  // Fetch once, filter client-side — same reliable pattern as the
  // Business Card list page, so search always works regardless of
  // backend query support.
  const getData = async () => {
    try {
      setLoading(true);
      const res = await GetAllAccessOrders({ page: 1, limit: 200 });
      const body = res?.data?.data;
      const rows = body?.data;
      const list = Array.isArray(rows) ? rows : [];
      // The API answers only its newest 10 for now (see GetAllAccessOrders); its total counts them all.
      const all = body?.pagination?.total;
      setTotal(typeof all === "number" ? all : null);

      setOrders(list);
      setBackupOrders(list);
    } catch (e) {
      console.error(e);
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

  const onSearch = (value: string) => {
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

  const openOrderDetails = async (id: number | string) => {
    try {
      const res = await GetAccessOrderById(id);
      const order = accessOrderFromResponse(res.data);

      setSelectedOrder(order);
      setEditStatus(order.fulfillment_status || undefined);
      setEditTracking(order.tracking_number || "");
      setEditTrackingLink(order.tracking_link || "");
      setDetailModalOpen(true);
    } catch (e) {
      message.error("Failed to load order details");
    }
  };

  useEffect(() => {
    if (routeId) openOrderDetails(routeId);
  }, [routeId]);

  const closeOrderDetails = () => {
    setDetailModalOpen(false);
    // Off the order's own address, so a refresh doesn't open it again.
    if (routeId) navigate("/access-orders", { replace: true });
  };

  /**
   * Shows an order the API answered (after buying or voiding its label) in the list and the open details. Those
   * answers leave out the card link, so it's kept from before.
   */
  const showOrder = (order: AccessOrder) => {
    const merge = (list: AccessOrder[]) => list.map((o) => (o.id === order.id ? { ...o, ...order } : o));
    setOrders(merge);
    setBackupOrders(merge);
    setSelectedOrder((current) => (current?.id === order.id ? { ...current, ...order } : current));
    // The form below the label holds the tracking number too: keep it in step, or saving it would undo the label's.
    if (selectedOrder?.id === order.id) {
      setEditStatus(order.fulfillment_status || undefined);
      setEditTracking(order.tracking_number || "");
      setEditTrackingLink(order.tracking_link || "");
    }
  };

  const reloadOrder = async (id: number) => {
    try {
      const res = await GetAccessOrderById(id);
      showOrder(accessOrderFromResponse(res.data));
    } catch (e) {
      console.error(e);
    }
  };

  const voidLabel = async (order: AccessOrder) => {
    try {
      const res = await VoidAccessOrderLabel(order.id);
      const { order: voided, refund } = res.data.data;
      showOrder(voided);
      message.success(`Label voided. ${REFUND_WORDS[refund.status] ?? `Shippo's refund: ${refund.status}`}.`);
    } catch (e) {
      // LABEL_IN_USE: Shippo's tracking moved it on meanwhile; NO_LABEL: voided meanwhile.
      message.error(apiErrorMessage(e) || "Couldn't void the label");
      const code = apiErrorCode(e);
      if (code === "LABEL_IN_USE" || code === "NO_LABEL") reloadOrder(order.id);
    }
  };

  const applyLocalUpdate = (orderId: number, changes: FulfillmentUpdate) => {
    const update = (list: AccessOrder[]) =>
      list.map((o) => (o.id === orderId ? { ...o, ...changes } : o));
    setOrders(update);
    setBackupOrders(update);
  };

  const quickUpdateFulfillment = async (orderId: number, status: FulfillmentStatus) => {
    const previous = orders;
    applyLocalUpdate(orderId, { fulfillment_status: status });

    try {
      await UpdateAccessOrderFulfillment(orderId, { fulfillment_status: status });
      message.success(`Marked as ${status.toUpperCase()}`);
    } catch (e) {
      setOrders(previous);
      setBackupOrders(previous);
      message.error(
        apiErrorMessage(e) || "Failed to update fulfillment status",
      );
    }
  };

  const handleSaveOrderDetails = async () => {
    if (!selectedOrder) return;

    try {
      setSavingOrder(true);

      const payload: FulfillmentUpdate = {
        fulfillment_status: editStatus,
        tracking_number: editTracking || null,
        tracking_link: editTrackingLink || null,
      };

      await UpdateAccessOrderFulfillment(selectedOrder.id, payload);
      applyLocalUpdate(selectedOrder.id, payload);

      message.success("Order updated");
      closeOrderDetails();
    } catch (e) {
      message.error(apiErrorMessage(e) || "Failed to update order");
    } finally {
      setSavingOrder(false);
    }
  };

  // No modal, no fetch — same as the "View Card" chip in BusinessCard.jsx,
  // just opens the live public Access Card in a new tab.
  const viewAccessCard = (link: string | null | undefined) => {
    if (!link) {
      message.warning("No Access Card link found for this order");
      return;
    }
    window.open(link, "_blank", "noreferrer");
  };

  const columns: TableColumnsType<AccessOrder> = [
    {
      title: "Order",
      dataIndex: "order_number",
      render: (orderNumber, record) => {
        const { date, time } = formatVegasShort(record.created_at);
        return (
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{orderNumber}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
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
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{record.customer_email}</div>
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
            <div style={{ color: "var(--color-text-secondary)" }}>
              {record.shipping_address_line_1}
              {record.shipping_address_line_2
                ? `, ${record.shipping_address_line_2}`
                : ""}
            </div>
            <div style={{ color: "var(--color-text-secondary)" }}>
              {record.shipping_city}, {record.shipping_state}{" "}
              {record.shipping_postal_code}
            </div>
          </div>
        ) : (
          // Access Pro bought alone: the order exists for the record, and nothing ships.
          <Tag color="purple">Access Pro only</Tag>
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
          <span style={{ color: "var(--color-text-disabled)", fontSize: 11 }}>Nothing to ship</span>
        ),
    },
    {
      title: "Tracking",
      dataIndex: "tracking_number",
      render: (tracking, record) =>
        tracking ? (
          <div>
            {record.tracking_link ? (
              <a href={record.tracking_link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>
                {tracking}
              </a>
            ) : (
              <span style={{ fontSize: 12 }}>{tracking}</span>
            )}
            {record.tracking_status && (
              <div>
                <TrackingTag status={record.tracking_status} />
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: "var(--color-text-disabled)" }}>—</span>
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
              onClick={() => openOrderDetails(record.id)}
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

          {record.label_url && (
            <Tooltip title="Print Label">
              <a
                className="ao-action-btn"
                href={record.label_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Print label"
              >
                <PrinterOutlined />
              </a>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="ao-page">
      <div className="ao-header">
        <div>
          <h3 className="ao-title">Access Orders</h3>
          <p className="ao-subtitle">
            Fulfill NFC keychain shipments · times shown in Las Vegas (Pacific)
            {total !== null && total > backupOrders.length &&
              ` · showing the newest ${backupOrders.length} of ${total} orders`}
          </p>
        </div>

        <Input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name, email or order #"
          prefix={<SearchOutlined />}
          className="ao-search"
          size="large" />
      </div>

      <Card className="ao-table-card" styles={{ body: { padding: 0 } }}>
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
        onCancel={closeOrderDetails}
        width={600}
        footer={null}
        styles={{ body: { padding: 0 } }}
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

                  <LabelSection
                    order={selectedOrder}
                    onBuy={() => setBuyingLabelFor(selectedOrder)}
                    onVoid={() => voidLabel(selectedOrder)}
                  />

                  <div className="ao-section-label">Fulfillment</div>
                  <p className="ao-label-note ao-fulfillment-note">
                    Buying a label fills in the tracking number and link, and Shippo's tracking moves the status to
                    shipped and delivered. Change them here for a parcel sent another way.
                  </p>

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
                      <Input
                        value={editTracking}
                        onChange={(e) => setEditTracking(e.target.value)}
                        placeholder="e.g. 1Z999AA10123456784"
                        style={{ width: "100%", marginTop: 4 }}
                      />
                    </div>

                    <div className="ao-info-item">
                      <div className="label">Tracking Link (optional)</div>
                      <Input
                        value={editTrackingLink}
                        onChange={(e) => setEditTrackingLink(e.target.value)}
                        placeholder="https://carrier.com/track/..."
                        style={{ width: "100%", marginTop: 4 }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="ao-box" style={{ textAlign: "center", color: "var(--color-text-tertiary)" }}>
                  Access Pro only: nothing to ship.
                </div>
              )}

              <div style={{ textAlign: "right" }}>
                <Button
                  className="ao-save-btn"
                  loading={savingOrder}
                  disabled={!isPhysical(selectedOrder)}
                  onClick={handleSaveOrderDetails}>Save Changes</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {buyingLabelFor && (
        <BuyLabelModal
          order={buyingLabelFor}
          onClose={() => setBuyingLabelFor(null)}
          onBought={(order) => {
            setBuyingLabelFor(null);
            showOrder(order);
          }}
          onStale={() => {
            setBuyingLabelFor(null);
            reloadOrder(buyingLabelFor.id);
          }}
        />
      )}
    </div>
  );
};

export default AccessOrders;