import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Segmented,
  Table,
  Tag,
  Tooltip,
  message,
  type TableColumnsType,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import dayjs, { type Dayjs } from "dayjs";
import AccountSelect from "../../components/AccountSelect";
import { CreatePersonalPrice, EndPersonalPrice, GetPersonalPrices } from "../../services/Api/AccessAdminApi";
import { apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import type { AccessProduct, PersonalPrice, PersonalPriceCreate, SoldProductCode } from "../../types/access";
import { date, dateTime, listPrice, money, priceUnit, productName, soldProducts, toCents } from "./pricing";
import styles from "./AccessPricing.module.scss";

const { Search } = Input;

/** Running, ended (by an admin, or replaced by a newer one), or past its end date. */
const priceState = (price: PersonalPrice, now = dayjs()) => {
  if (price.ended_at) return "ended";
  if (price.ends_at && !dayjs(price.ends_at).isAfter(now)) return "expired";
  return "running";
};

/** Personal prices for one client: the list (by email, running or all), a new one, ending one. */
const PersonalPricesTab = ({ products }: { products: AccessProduct[] }) => {
  const [rows, setRows] = useState<PersonalPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [show, setShow] = useState<"running" | "all">("running");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetPersonalPrices({ email: email || undefined, active: show === "running" });
      setRows(res.data.data);
    } catch (err) {
      console.error("Error loading the personal prices:", err);
      message.error(apiErrorMessage(err) || "Couldn't load the personal prices");
    } finally {
      setLoading(false);
    }
  }, [email, show]);

  useEffect(() => {
    load();
  }, [load]);

  const end = async (price: PersonalPrice) => {
    try {
      await EndPersonalPrice(price.id);
      message.success("Personal price ended");
      load();
    } catch (err) {
      message.error(apiErrorMessage(err) || "Couldn't end the personal price");
    }
  };

  const unitOf = (code: string) => {
    const product = products.find((p) => p.code === code);
    return product ? ` ${priceUnit(product)}` : "";
  };

  const columns: TableColumnsType<PersonalPrice> = [
    {
      title: "Client",
      key: "client",
      render: (_, price) => (
        <div>
          <div className={styles.strong}>{price.email ?? "—"}</div>
          {price.user_id ? (
            <Link to={`/viewProfessionals/${price.user_id}`} className={styles.subText}>
              Account #{price.user_id}
            </Link>
          ) : (
            <div className={styles.subText}>No account yet</div>
          )}
        </div>
      ),
    },
    { title: "Product", dataIndex: "product_code", render: (code: string) => productName(products, code) },
    {
      title: "Price",
      key: "price",
      render: (_, price) => `${money(price.amount_cents)}${unitOf(price.product_code)}`,
    },
    { title: "Note", dataIndex: "note", render: (note: string | null) => note || "—" },
    { title: "Until", dataIndex: "ends_at", render: (value: string | null) => dateTime(value, "No end") },
    {
      title: "Status",
      key: "status",
      render: (_, price) => {
        const state = priceState(price);
        if (state === "running") return <Tag color="green">Running</Tag>;
        if (state === "expired") return <Tag>Expired</Tag>;
        return (
          <Tooltip title={`Ended ${dateTime(price.ended_at)}, by an admin or by a newer personal price`}>
            <Tag>Ended</Tag>
          </Tooltip>
        );
      },
    },
    { title: "Set", dataIndex: "created_at", render: (value: string) => date(value) },
    {
      title: "Action",
      key: "action",
      width: 90,
      fixed: "right",
      render: (_, price) =>
        priceState(price) === "running" ? (
          <Popconfirm
            title="End this personal price?"
            description="Their next checkout pays the list price (or the running sale). A live subscription already on this price keeps it until you next move subscribers to a new price."
            okText="End it"
            okButtonProps={{ danger: true }}
            cancelText="Keep it"
            onConfirm={() => end(price)}
          >
            <Button size="small" danger>
              End
            </Button>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <>
      <div className={styles.toolbar}>
        <p className={styles.intro}>
          A price for one client, by account or by email (it works before they sign up). It applies at their next
          checkout, replaces their earlier personal price for that product, and beats a running sale.
        </p>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
          New personal price
        </Button>
      </div>
      <div className={styles.filters}>
        <Search
          placeholder="Find by email (the whole address)"
          allowClear
          onSearch={(value) => setEmail(value.trim())}
          style={{ width: 320 }}
        />
        <Segmented
          value={show}
          onChange={(value) => setShow(value === "all" ? "all" : "running")}
          options={[
            { value: "running", label: "Running" },
            { value: "all", label: "All" },
          ]}
        />
      </div>
      <Table<PersonalPrice>
        columns={columns}
        dataSource={rows}
        rowKey="id"
        loading={loading}
        size="middle"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 20, showSizeChanger: false, hideOnSinglePage: true }}
        locale={{ emptyText: show === "running" ? "No personal prices running" : "No personal prices" }}
      />
      {creating && (
        <NewPersonalPriceModal
          products={products}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            load();
          }}
          onFailed={load}
        />
      )}
    </>
  );
};

interface PersonalPriceValues {
  who: "email" | "account";
  email?: string;
  user_id?: number | null;
  product_code: SoldProductCode;
  /** Dollars. */
  amount?: number;
  note?: string;
  ends_at?: Dayjs | null;
  apply_now?: boolean;
}

// The API's field names → this form's.
const PRICE_FIELDS = { amount_cents: "amount" };

interface NewPersonalPriceModalProps {
  products: AccessProduct[];
  onClose: () => void;
  onCreated: () => void;
  /** The price may be saved even when changing their subscription failed: show the list as it is. */
  onFailed: () => void;
}

const NewPersonalPriceModal = ({ products, onClose, onCreated, onFailed }: NewPersonalPriceModalProps) => {
  const [form] = Form.useForm<PersonalPriceValues>();
  const [saving, setSaving] = useState(false);
  const who = Form.useWatch("who", form);
  const productCode = Form.useWatch("product_code", form);
  const product = products.find((p) => p.code === productCode);

  const save = async (values: PersonalPriceValues) => {
    const applyNow = values.product_code === "pro" && Boolean(values.apply_now);
    const body: PersonalPriceCreate = {
      ...(values.who === "email" ? { email: values.email?.trim() } : { user_id: values.user_id ?? undefined }),
      product_code: values.product_code,
      amount_cents: toCents(values.amount ?? 0),
      ...(values.note?.trim() ? { note: values.note.trim() } : {}),
      ...(values.ends_at ? { ends_at: values.ends_at.toISOString() } : {}),
      ...(applyNow ? { apply_now: true } : {}),
    };
    try {
      setSaving(true);
      const res = await CreatePersonalPrice(body);
      if (!applyNow) message.success("Personal price set. It applies at their next checkout.");
      else if (res.data.data.applied_to_subscription) {
        message.success("Personal price set. Their subscription changes to it at their next renewal.");
      } else {
        message.warning(
          "Personal price set. They don't pay for Access Pro through Stripe now, so it applies at their next checkout.",
        );
      }
      onCreated();
    } catch (err) {
      message.error(showFieldError(form, err, PRICE_FIELDS) || apiErrorMessage(err) || "Couldn't set the price");
      if (applyNow) onFailed();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title="New personal price"
      okText="Set price"
      onOk={() => form.submit()}
      confirmLoading={saving}
      onCancel={onClose}
      width={600}
      destroyOnHidden
    >
      <p className={styles.muted}>
        It replaces their earlier personal price for this product and beats a running sale: they pay this, not the
        sale price.
      </p>
      <Form<PersonalPriceValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={save}
        initialValues={{ who: "email", product_code: "pro", apply_now: false }}
      >
        <Form.Item name="who" label="For">
          <Radio.Group
            optionType="button"
            options={[
              { value: "email", label: "An email" },
              { value: "account", label: "An account" },
            ]}
          />
        </Form.Item>
        {who === "account" ? (
          <Form.Item name="user_id" label="Account" rules={[{ required: true, message: "Pick an account" }]}>
            <AccountSelect />
          </Form.Item>
        ) : (
          <Form.Item
            name="email"
            label="Email"
            extra="Works before they have an account: it applies when they buy with this email."
            rules={[
              { required: true, whitespace: true, message: "Type their email" },
              { type: "email", message: "That isn't an email address" },
            ]}
          >
            <Input type="email" placeholder="name@example.com" />
          </Form.Item>
        )}
        <Form.Item name="product_code" label="Product">
          <Radio.Group
            options={soldProducts(products).map((p) => ({ value: p.code, label: p.name }))}
            onChange={() => form.setFieldValue("apply_now", false)}
          />
        </Form.Item>
        <Form.Item
          name="amount"
          label={product?.kind === "subscription" ? "Their price per month" : "Their price"}
          extra={product ? `List price: ${listPrice(product)}.` : undefined}
          rules={[
            { required: true, message: "Type their price" },
            { type: "number", min: 0.5, message: "At least $0.50, Stripe's smallest charge" },
            { type: "number", max: 10000, message: "At most $10,000" },
          ]}
        >
          <InputNumber prefix="$" min={0} step={0.01} precision={2} style={{ width: 180 }} />
        </Form.Item>
        <Form.Item name="note" label="Note" rules={[{ max: 255, message: "At most 255 characters" }]}>
          <Input placeholder="e.g. Founding member" />
        </Form.Item>
        <Form.Item
          name="ends_at"
          label="Until"
          extra="Empty: no end."
          rules={[
            {
              validator: async (_, value: Dayjs | null | undefined) => {
                if (value && !value.isAfter(dayjs())) throw new Error("Pick a time in the future");
              },
            },
          ]}
        >
          <DatePicker
            showTime={{ format: "h:mm A" }}
            format="MMM D, YYYY h:mm A"
            placeholder="No end"
            disabledDate={(day) => day.isBefore(dayjs(), "day")}
          />
        </Form.Item>
        {productCode === "pro" && (
          <Form.Item
            name="apply_now"
            valuePropName="checked"
            extra="For someone who already pays for Access Pro through Stripe; nobody pays a difference for the month under way. Without it, the price applies at their next checkout."
          >
            <Checkbox>Also change their live subscription from the next renewal</Checkbox>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default PersonalPricesTab;
