import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Form, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip, message, type TableColumnsType } from "antd";
import { GiftOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import PageHeader, { Panel } from "../../components/PageHeader";
import AccountSelect from "../../components/AccountSelect";
import { CancelSubscription, GetSubscriptions, SetComplimentaryPro } from "../../services/Api/AccessAdminApi";
import { GetUserById } from "../../services/Api/UserApi";
import { apiErrorCode, apiErrorMessage } from "../../utils/apiError";
import type { SeatSource, SeatStatus, SubscriptionSeat } from "../../types/access";
import { date } from "../AccessPricing/pricing";
import { money } from "../../utils/money";
import styles from "./AccessSubscriptions.module.scss";

// Pro while active, on trial, or past due (Stripe is retrying a payment).
const PRO_STATUSES: SeatStatus[] = ["active", "trialing", "past_due"];
const isPro = (seat: SubscriptionSeat) => PRO_STATUSES.includes(seat.status);

const STATUS: Partial<Record<string, { label: string; color?: string; hint?: string }>> = {
  active: { label: "Active", color: "green" },
  trialing: { label: "Trial", color: "cyan" },
  past_due: { label: "Past due", color: "orange", hint: "A renewal failed and Stripe is retrying; they keep Pro meanwhile." },
  canceled: { label: "Canceled" },
  incomplete: { label: "Incomplete", color: "gold", hint: "The first payment hasn't gone through." },
  incomplete_expired: { label: "Never paid", hint: "The first payment never went through." },
  unpaid: { label: "Unpaid", color: "red", hint: "Stripe stopped retrying; they no longer have Pro." },
  paused: { label: "Paused" },
};

const STATUS_FILTER = Object.entries(STATUS).map(([value, status]) => ({ value, label: status?.label ?? value }));

const PAID_EXPLANATION =
  "They pay for Access Pro through Stripe, so it can't be made complimentary. Cancel their subscription first (Cancel now), then give complimentary Pro.";

interface AccountInfo {
  name: string | null;
  email: string | null;
}

// A seat carries only its account id: each account's name and email is fetched once, when its row first shows.
const accounts = new Map<number, Promise<AccountInfo | null>>();

const lookUpAccount = (userId: number) => {
  let account = accounts.get(userId);
  if (!account) {
    account = GetUserById(userId)
      .then((res) => {
        const user = res.data.data;
        // An unknown or deactivated account answers a sentence instead of the account.
        if (typeof user !== "object" || user === null) return null;
        return { name: user.user_profile?.name || null, email: user.email || null };
      })
      .catch((err) => {
        console.error(`Couldn't load account ${userId}:`, err);
        return null;
      });
    accounts.set(userId, account);
  }
  return account;
};

/** Who a seat belongs to, linking to their account. */
const AccountCell = ({ userId }: { userId: number }) => {
  const [account, setAccount] = useState<AccountInfo | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    lookUpAccount(userId).then((found) => {
      if (active) setAccount(found);
    });
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <div>
      <Link to={`/viewProfessionals/${userId}`} className={styles.accountName}>
        {account?.name || account?.email || `Account #${userId}`}
      </Link>
      <div className={styles.subText}>
        {account === undefined ? "Loading…" : account === null ? "Account not found" : (account.email ?? `#${userId}`)}
      </div>
    </div>
  );
};

/** Access Pro seats: who has Pro and how, cancelling, and complimentary Pro. */
const AccessSubscriptions = () => {
  const [seats, setSeats] = useState<SubscriptionSeat[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<SeatStatus | undefined>(undefined);
  const [source, setSource] = useState<SeatSource | undefined>(undefined);
  const [giving, setGiving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetSubscriptions({ status, source });
      setSeats(res.data.data);
    } catch (err) {
      console.error("Error loading the subscriptions:", err);
      message.error(apiErrorMessage(err) || "Couldn't load the subscriptions");
    } finally {
      setLoading(false);
    }
  }, [status, source]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (seat: SubscriptionSeat, now: boolean) => {
    try {
      await CancelSubscription(seat.user_id, { now });
      message.success(now ? "Access Pro ended" : "Access Pro ends at the end of the paid month");
      load();
    } catch (err) {
      message.error(apiErrorMessage(err) || "Couldn't cancel the subscription");
    }
  };

  const setComp = async (seat: SubscriptionSeat, active: boolean) => {
    try {
      await SetComplimentaryPro(seat.user_id, active);
      message.success(active ? "Complimentary Pro given" : "Complimentary Pro taken back");
      load();
    } catch (err) {
      message.error(
        apiErrorCode(err) === "SUBSCRIPTION_PAID"
          ? PAID_EXPLANATION
          : apiErrorMessage(err) || "Couldn't change complimentary Pro",
      );
    }
  };

  const actions = (seat: SubscriptionSeat) => {
    if (seat.source === "comp" && isPro(seat)) {
      return (
        <Popconfirm
          title="Take back their complimentary Pro?"
          description="It ends now, and their card becomes Free."
          okText="Take back"
          okButtonProps={{ danger: true }}
          cancelText="Keep it"
          onConfirm={() => setComp(seat, false)}
        >
          <Button size="small" danger>
            Take back complimentary
          </Button>
        </Popconfirm>
      );
    }
    if (isPro(seat)) {
      return (
        <Space size={6} wrap>
          {!seat.cancel_at_period_end && (
            <Popconfirm
              title="Cancel at the end of the paid month?"
              description={`They keep Pro until ${date(seat.current_period_end, "the period ends")}, and can resume it from their account until then.`}
              okText="Cancel at period end"
              cancelText="Keep it"
              onConfirm={() => cancel(seat, false)}
            >
              <Button size="small">Cancel at period end</Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="End their Access Pro now?"
            description="Stripe stops the subscription at once and their card becomes Free. Refunds are made in Stripe's dashboard."
            okText="End it now"
            okButtonProps={{ danger: true }}
            cancelText="Keep it"
            onConfirm={() => cancel(seat, true)}
          >
            <Button size="small" danger>
              Cancel now
            </Button>
          </Popconfirm>
        </Space>
      );
    }
    return (
      <Popconfirm
        title="Give them complimentary Pro?"
        description="They get Access Pro without paying until you take it back; their card becomes Pro now."
        okText="Give Pro"
        cancelText="Not now"
        onConfirm={() => setComp(seat, true)}
      >
        <Button size="small">Make complimentary</Button>
      </Popconfirm>
    );
  };

  const columns: TableColumnsType<SubscriptionSeat> = [
    {
      title: "Account",
      dataIndex: "user_id",
      width: 240,
      fixed: "left",
      render: (userId: number) => <AccountCell userId={userId} />,
    },
    {
      title: "Source",
      dataIndex: "source",
      width: 140,
      render: (value: SeatSource) =>
        value === "comp" ? <Tag color="purple">Complimentary</Tag> : <Tag color="blue">Stripe</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 130,
      render: (value: string) => {
        const known = STATUS[value];
        const tag = <Tag color={known?.color}>{known?.label ?? value}</Tag>;
        return known?.hint ? <Tooltip title={known.hint}>{tag}</Tooltip> : tag;
      },
    },
    {
      title: "Amount",
      dataIndex: "amount_cents",
      width: 120,
      render: (cents: number | null, seat) =>
        cents === null ? (seat.source === "comp" ? "Free" : "—") : `${money(cents)} / month`,
    },
    {
      title: "Current period ends",
      dataIndex: "current_period_end",
      width: 160,
      render: (value: string | null) => date(value),
    },
    {
      title: "Cancels at period end",
      dataIndex: "cancel_at_period_end",
      width: 150,
      render: (value: boolean, seat) =>
        seat.source === "comp" ? "—" : value ? <Tag color="orange">Yes</Tag> : "No",
    },
    { title: "Action", key: "action", width: 290, render: (_, seat) => actions(seat) },
  ];

  return (
    <div>
      <PageHeader
        title="Access Subscriptions"
        subtitle="Access Pro seats, one per person: paid through Stripe or complimentary (given by an admin). Deleting a card keeps its seat."
        extra={
          <>
            <Select<SeatStatus>
              allowClear
              placeholder="Any status"
              value={status}
              onChange={(value) => setStatus(value)}
              options={STATUS_FILTER}
              style={{ width: 150 }}
              aria-label="Status"
            />
            <Select<SeatSource>
              allowClear
              placeholder="Any source"
              value={source}
              onChange={(value) => setSource(value)}
              options={[
                { value: "stripe", label: "Stripe" },
                { value: "comp", label: "Complimentary" },
              ]}
              style={{ width: 160 }}
              aria-label="Source"
            />
            <Button type="primary" icon={<GiftOutlined />} onClick={() => setGiving(true)}>
              Give complimentary Pro
            </Button>
          </>
        }
      />
      <Panel>
        <Table<SubscriptionSeat>
          columns={columns}
          dataSource={seats}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 1250 }}
          pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (total) => `${total} seats` }}
          locale={{ emptyText: "No subscriptions" }}
        />
      </Panel>
      {giving && (
        <GiveCompModal
          onClose={() => setGiving(false)}
          onGiven={() => {
            setGiving(false);
            load();
          }}
        />
      )}
    </div>
  );
};

// Mounted only while open, so each opening starts empty.
const GiveCompModal = ({ onClose, onGiven }: { onClose: () => void; onGiven: () => void }) => {
  const [form] = Form.useForm<{ user_id: number | null }>();
  const [saving, setSaving] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);

  const give = async ({ user_id }: { user_id: number | null }) => {
    if (!user_id) return;
    try {
      setSaving(true);
      setRefusal(null);
      await SetComplimentaryPro(user_id, true);
      message.success("Complimentary Pro given");
      onGiven();
    } catch (err) {
      if (apiErrorCode(err) === "SUBSCRIPTION_PAID") setRefusal(PAID_EXPLANATION);
      else message.error(apiErrorMessage(err) || "Couldn't give complimentary Pro");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title="Give complimentary Pro"
      okText="Give Pro"
      onOk={() => form.submit()}
      confirmLoading={saving}
      onCancel={onClose}
      destroyOnHidden
    >
      <p className={styles.muted}>
        They get Access Pro without paying, until you take it back. Their card becomes Pro at once.
      </p>
      {refusal && <Alert className={styles.refusal} type="warning" showIcon title={refusal} />}
      <Form form={form} layout="vertical" requiredMark={false} onFinish={give}>
        <Form.Item name="user_id" label="Account" rules={[{ required: true, message: "Pick an account" }]}>
          <AccountSelect />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AccessSubscriptions;
