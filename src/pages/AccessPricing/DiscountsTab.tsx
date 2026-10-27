import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Space,
  Table,
  Tag,
  message,
  type TableColumnsType,
} from "antd";
import { EditOutlined, PlusOutlined, StopOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { CreateDiscount, EndDiscount, GetDiscounts, UpdateDiscount } from "../../services/Api/AccessAdminApi";
import { apiErrorCode, apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import type { AccessDiscount, AccessProduct, DiscountCreate, DiscountDuration, SoldProductCode } from "../../types/access";
import {
  dateTime,
  discountOff,
  discountState,
  durationText,
  productName,
  soldProducts,
  toCents,
  type DiscountState,
} from "./pricing";
import styles from "./AccessPricing.module.scss";

const STATE_TAG: Record<DiscountState, { label: string; color?: string }> = {
  running: { label: "Running now", color: "green" },
  scheduled: { label: "Scheduled", color: "blue" },
  ended: { label: "Ended" },
};

/** The API's refusal when two sales would overlap, worded for the form. */
const overlapMessage = (err: unknown) => `Only one sale can run at a time. ${apiErrorMessage(err) ?? ""}`.trim();

interface DiscountsTabProps {
  products: AccessProduct[];
  /** After a sale is made, changed or ended: reload the catalog (the page header shows the running sale). */
  onChanged: () => void;
}

/** Site-wide sales: the list (the running one marked), a new one, renaming or moving the end, ending one now. */
const DiscountsTab = ({ products, onChanged }: DiscountsTabProps) => {
  const [discounts, setDiscounts] = useState<AccessDiscount[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AccessDiscount | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetDiscounts();
      setDiscounts(res.data.data);
    } catch (err) {
      console.error("Error loading the discounts:", err);
      message.error(apiErrorMessage(err) || "Couldn't load the discounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changed = () => {
    load();
    onChanged();
  };

  const end = async (discount: AccessDiscount) => {
    try {
      await EndDiscount(discount.id);
      message.success(`${discount.name} ended`);
      changed();
    } catch (err) {
      message.error(apiErrorMessage(err) || "Couldn't end the sale");
    }
  };

  const now = dayjs();
  const running = discounts.find((discount) => discountState(discount, now) === "running");

  const columns: TableColumnsType<AccessDiscount> = [
    {
      title: "Sale",
      dataIndex: "name",
      render: (name: string, discount) => {
        const state = STATE_TAG[discountState(discount, now)];
        return (
          <div>
            <div className={styles.strong}>{name}</div>
            <Tag color={state.color}>{state.label}</Tag>
          </div>
        );
      },
    },
    { title: "Takes off", key: "off", render: (_, discount) => discountOff(discount) },
    {
      title: "On",
      dataIndex: "applies_to",
      render: (codes: string[]) => codes.map((code) => <Tag key={code}>{productName(products, code)}</Tag>),
    },
    {
      title: "Lasts on Access Pro",
      key: "duration",
      render: (_, discount) =>
        discount.applies_to.includes("pro") ? durationText(discount.duration, discount.duration_in_months) : "—",
    },
    { title: "Starts", dataIndex: "starts_at", render: (value: string) => dateTime(value) },
    { title: "Ends", dataIndex: "ends_at", render: (value: string | null) => dateTime(value, "No end") },
    {
      title: "Action",
      key: "action",
      width: 190,
      fixed: "right",
      render: (_, discount) =>
        discountState(discount, now) === "ended" ? null : (
          <Space size={6} wrap>
            <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(discount)}>
              Edit
            </Button>
            <Popconfirm
              title="End this sale now?"
              description={
                discountState(discount, now) === "scheduled"
                  ? "It won't start."
                  : "New purchases stop getting it. Subscribers who bought during the sale keep it on Access Pro for as long as it lasts."
              }
              okText="End now"
              okButtonProps={{ danger: true }}
              cancelText="Keep it"
              onConfirm={() => end(discount)}
            >
              <Button size="small" danger icon={<StopOutlined />}>
                End now
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <>
      <div className={styles.toolbar}>
        <p className={styles.intro}>
          A sale lowers what new purchases pay, from its start to its end. Only one runs at a time, and a personal price
          beats it (they don't add up).
        </p>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
          New discount
        </Button>
      </div>
      {!loading && (
        <Alert
          className={styles.result}
          type={running ? "success" : "info"}
          showIcon
          title={
            running
              ? `Running now: ${running.name}, ${discountOff(running)} ${running.applies_to
                  .map((code) => productName(products, code))
                  .join(" and ")}${running.ends_at ? `, until ${dateTime(running.ends_at)}` : ", with no end"}.`
              : "No sale is running."
          }
        />
      )}
      <Table<AccessDiscount>
        columns={columns}
        dataSource={discounts}
        rowKey="id"
        loading={loading}
        size="middle"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 20, showSizeChanger: false, hideOnSinglePage: true }}
        locale={{ emptyText: "No sales yet" }}
      />
      {creating && (
        <NewDiscountModal
          products={products}
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            changed();
          }}
        />
      )}
      {editing && (
        <EditDiscountModal
          discount={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            changed();
          }}
        />
      )}
    </>
  );
};

interface DiscountFormValues {
  name: string;
  kind: "percent" | "amount";
  percent?: number;
  /** Dollars. */
  amount?: number;
  applies_to: SoldProductCode[];
  duration: DiscountDuration;
  duration_in_months?: number;
  starts_at?: Dayjs | null;
  ends_at?: Dayjs | null;
}

// The API's field names → this form's.
const DISCOUNT_FIELDS = { percent_off: "percent", amount_off_cents: "amount" };

/** What the form's values ask the API for. */
const discountBody = (values: DiscountFormValues): DiscountCreate => ({
  name: values.name.trim(),
  ...(values.kind === "percent" ? { percent_off: values.percent } : { amount_off_cents: toCents(values.amount ?? 0) }),
  applies_to: values.applies_to,
  duration: values.duration,
  ...(values.duration === "repeating" ? { duration_in_months: values.duration_in_months } : {}),
  ...(values.starts_at ? { starts_at: values.starts_at.toISOString() } : {}),
  ...(values.ends_at ? { ends_at: values.ends_at.toISOString() } : {}),
});

interface NewDiscountModalProps {
  products: AccessProduct[];
  onClose: () => void;
  onCreated: () => void;
}

const NewDiscountModal = ({ products, onClose, onCreated }: NewDiscountModalProps) => {
  const [form] = Form.useForm<DiscountFormValues>();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);
  const kind = Form.useWatch("kind", form);
  const duration = Form.useWatch("duration", form);

  const save = async (values: DiscountFormValues) => {
    try {
      setSaving(true);
      setConflict(null);
      await CreateDiscount(discountBody(values));
      message.success(`${values.name.trim()} created`);
      onCreated();
    } catch (err) {
      if (apiErrorCode(err) === "DISCOUNT_OVERLAPS") setConflict(overlapMessage(err));
      else message.error(showFieldError(form, err, DISCOUNT_FIELDS) || apiErrorMessage(err) || "Couldn't create the sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title="New discount"
      okText="Create discount"
      onOk={() => form.submit()}
      confirmLoading={saving}
      onCancel={onClose}
      width={620}
      destroyOnHidden
    >
      {conflict && <Alert className={styles.result} type="error" showIcon title={conflict} />}
      <Form<DiscountFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={save}
        initialValues={{ kind: "percent", applies_to: ["pro"], duration: "once" }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, whitespace: true, message: "Give the sale a name" },
            { max: 100, message: "At most 100 characters" },
          ]}
        >
          <Input placeholder="e.g. Holiday sale" />
        </Form.Item>
        <Form.Item label="Takes off" required>
          <Space wrap align="start">
            <Form.Item name="kind" noStyle>
              <Radio.Group
                optionType="button"
                options={[
                  { value: "percent", label: "A percentage" },
                  { value: "amount", label: "An amount" },
                ]}
              />
            </Form.Item>
            {kind === "amount" ? (
              <Form.Item
                name="amount"
                noStyle
                rules={[
                  { required: true, message: "Type the amount off" },
                  { type: "number", min: 0.01, message: "At least $0.01" },
                ]}
              >
                <InputNumber prefix="$" min={0} max={10000} step={0.5} precision={2} aria-label="Amount off" />
              </Form.Item>
            ) : (
              <Form.Item
                name="percent"
                noStyle
                rules={[
                  { required: true, message: "Type the percentage off" },
                  { type: "number", min: 0.01, max: 100, message: "Above 0 and at most 100" },
                ]}
              >
                <InputNumber suffix="%" min={0} max={100} step={5} precision={2} aria-label="Percent off" />
              </Form.Item>
            )}
          </Space>
        </Form.Item>
        <Form.Item
          name="applies_to"
          label="On"
          rules={[{ required: true, type: "array", min: 1, message: "Pick what the sale is on" }]}
        >
          <Checkbox.Group
            options={soldProducts(products).map((product) => ({ value: product.code, label: product.name }))}
          />
        </Form.Item>
        <Form.Item
          name="duration"
          label="How long it lasts on Access Pro"
          extra="Access Pro is paid monthly; this is how many of those payments get the discount. The keychain is paid once, so this doesn't change it."
        >
          <Radio.Group
            orientation="vertical"
            options={[
              { value: "once", label: "The first payment" },
              { value: "repeating", label: "A number of months" },
              { value: "forever", label: "Every payment, while they subscribe" },
            ]}
          />
        </Form.Item>
        {duration === "repeating" && (
          <Form.Item
            name="duration_in_months"
            label="Months"
            rules={[{ required: true, message: "How many months? (1 to 36)" }]}
          >
            <InputNumber min={1} max={36} precision={0} style={{ width: 120 }} />
          </Form.Item>
        )}
        <Space wrap size={16} align="start">
          <Form.Item name="starts_at" label="Starts" extra="Empty: now.">
            <DatePicker showTime={{ format: "h:mm A" }} format="MMM D, YYYY h:mm A" placeholder="Now" />
          </Form.Item>
          <Form.Item
            name="ends_at"
            label="Ends"
            extra="Empty: no end."
            dependencies={["starts_at"]}
            rules={[
              ({ getFieldValue }) => ({
                validator: async (_, value: Dayjs | null | undefined) => {
                  const start: Dayjs = getFieldValue("starts_at") ?? dayjs();
                  if (value && !value.isAfter(start)) throw new Error("Pick an end after the start");
                },
              }),
            ]}
          >
            <DatePicker showTime={{ format: "h:mm A" }} format="MMM D, YYYY h:mm A" placeholder="No end" />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

interface EditDiscountValues {
  name: string;
  ends_at?: Dayjs | null;
}

interface EditDiscountModalProps {
  discount: AccessDiscount;
  onClose: () => void;
  onSaved: () => void;
}

const EditDiscountModal = ({ discount, onClose, onSaved }: EditDiscountModalProps) => {
  const [form] = Form.useForm<EditDiscountValues>();
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);

  const save = async (values: EditDiscountValues) => {
    try {
      setSaving(true);
      setConflict(null);
      await UpdateDiscount(discount.id, {
        name: values.name.trim(),
        ends_at: values.ends_at ? values.ends_at.toISOString() : null,
      });
      message.success("Sale saved");
      onSaved();
    } catch (err) {
      if (apiErrorCode(err) === "DISCOUNT_OVERLAPS") setConflict(overlapMessage(err));
      else message.error(showFieldError(form, err) || apiErrorMessage(err) || "Couldn't save the sale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={`Edit ${discount.name}`}
      okText="Save"
      onOk={() => form.submit()}
      confirmLoading={saving}
      onCancel={onClose}
      destroyOnHidden
    >
      <p className={styles.muted}>
        {discountOff(discount)}, from {dateTime(discount.starts_at)}. To change what it takes off or what it's on, end
        it and make a new one.
      </p>
      {conflict && <Alert className={styles.result} type="error" showIcon title={conflict} />}
      <Form<EditDiscountValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={save}
        initialValues={{ name: discount.name, ends_at: discount.ends_at ? dayjs(discount.ends_at) : null }}
      >
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, whitespace: true, message: "Give the sale a name" },
            { max: 100, message: "At most 100 characters" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="ends_at"
          label="Ends"
          extra="Empty: no end."
          rules={[
            {
              validator: async (_, value: Dayjs | null | undefined) => {
                if (value && !value.isAfter(dayjs(discount.starts_at))) throw new Error("Pick an end after the start");
              },
            },
          ]}
        >
          <DatePicker showTime={{ format: "h:mm A" }} format="MMM D, YYYY h:mm A" placeholder="No end" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DiscountsTab;
