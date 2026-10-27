import { useState } from "react";
import { Button, Checkbox, Form, InputNumber, Radio, Select, Space, Switch, Table, message, type TableColumnsType } from "antd";
import { UpdateAccessSettings } from "../../services/Api/AccessAdminApi";
import { apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import type { AccessSettings, Entitlements, Parcel, ShippingCountry, ShippingMode } from "../../types/access";
import { toCents, toDollars } from "./pricing";
import styles from "./AccessPricing.module.scss";

interface SettingsTabProps {
  settings: AccessSettings;
  /** The settings as saved (the API answers all of them). */
  onSaved: (settings: AccessSettings) => void;
}

/**
 * What Free and Pro may do, keychains per person, and shipping. The API replaces a setting whole, so each section saves
 * everything in it.
 */
const SettingsTab = ({ settings, onSaved }: SettingsTabProps) => (
  <>
    <EntitlementsSection settings={settings} onSaved={onSaved} />
    <KeychainsSection settings={settings} onSaved={onSaved} />
    <ShippingSection settings={settings} onSaved={onSaved} />
  </>
);

type Tier = "free" | "pro";
type EntitlementKey = keyof Entitlements;

interface EntitlementRow {
  key: EntitlementKey;
  label: string;
  hint?: string;
  /** A count (0 to 20) rather than yes or no. */
  count?: boolean;
}

const ENTITLEMENT_ROWS: EntitlementRow[] = [
  { key: "photos", label: "Photos on the card", hint: "Admins can put up to 20 on any card.", count: true },
  { key: "videos", label: "Videos on the card", count: true },
  { key: "edit_details", label: "Edit details once the card is live", hint: "Text, links, hours and locations." },
  { key: "edit_media", label: "Change photos, the video or the profile image once the card is live" },
  { key: "special_offers", label: "Run special offers on the card" },
  { key: "analytics", label: "Performance analytics", hint: "Not built yet (the pricing page says soon)." },
  { key: "priority_search", label: "Priority placement in search", hint: "Not built yet (the pricing page says soon)." },
];

/** Every entitlement of a tier, as the API checks them: whole counts and true or false. */
const wholeTier = (tier: Partial<Entitlements> | undefined): Entitlements => ({
  photos: Math.round(Number(tier?.photos ?? 0)),
  videos: Math.round(Number(tier?.videos ?? 0)),
  edit_details: Boolean(tier?.edit_details),
  edit_media: Boolean(tier?.edit_media),
  special_offers: Boolean(tier?.special_offers),
  analytics: Boolean(tier?.analytics),
  priority_search: Boolean(tier?.priority_search),
});

type EntitlementValues = Record<Tier, Entitlements>;

const EntitlementsSection = ({ settings, onSaved }: SettingsTabProps) => {
  const [form] = Form.useForm<EntitlementValues>();
  const [saving, setSaving] = useState(false);

  const save = async (values: EntitlementValues) => {
    try {
      setSaving(true);
      const entitlements = { free: wholeTier(values.free), pro: wholeTier(values.pro) };
      const res = await UpdateAccessSettings({ entitlements });
      form.setFieldsValue(res.data.data.entitlements);
      onSaved(res.data.data);
      message.success("What Free and Pro may do is saved");
    } catch (err) {
      message.error(showFieldError(form, err) || apiErrorMessage(err) || "Couldn't save the plan features");
    } finally {
      setSaving(false);
    }
  };

  const cell = (tier: Tier) => (_: unknown, row: EntitlementRow) =>
    row.count ? (
      <Form.Item name={[tier, row.key]} className={styles.cellItem} rules={[{ required: true, message: "0 to 20" }]}>
        <InputNumber min={0} max={20} precision={0} aria-label={`${row.label}: ${tier}`} style={{ width: 90 }} />
      </Form.Item>
    ) : (
      <Form.Item name={[tier, row.key]} valuePropName="checked" className={styles.cellItem}>
        <Switch aria-label={`${row.label}: ${tier}`} />
      </Form.Item>
    );

  const columns: TableColumnsType<EntitlementRow> = [
    {
      title: "What owners may do",
      key: "label",
      render: (_, row) => (
        <div>
          <div>{row.label}</div>
          {row.hint && <div className={styles.subText}>{row.hint}</div>}
        </div>
      ),
    },
    { title: "Free", key: "free", width: 120, align: "center", render: cell("free") },
    { title: "Pro", key: "pro", width: 120, align: "center", render: cell("pro") },
  ];

  return (
    <section className={styles.section}>
      <h4 className={styles.sectionTitle}>What Free and Pro may do</h4>
      <p className={styles.intro}>
        What owners may change on a live card, by plan. Owners can always edit a draft, a card waiting for review or a
        rejected card, and admins can always edit. When the plan doesn't allow a change, the owner is asked to upgrade.
      </p>
      <Form<EntitlementValues>
        form={form}
        onFinish={save}
        initialValues={{ free: wholeTier(settings.entitlements.free), pro: wholeTier(settings.entitlements.pro) }}
      >
        <Table<EntitlementRow>
          columns={columns}
          dataSource={ENTITLEMENT_ROWS}
          rowKey="key"
          size="small"
          pagination={false}
          scroll={{ x: 560 }}
        />
        <Button type="primary" htmlType="submit" loading={saving} className={styles.saveButton}>
          Save plan features
        </Button>
      </Form>
    </section>
  );
};

const KeychainsSection = ({ settings, onSaved }: SettingsTabProps) => {
  const [form] = Form.useForm<{ keychains_per_person: number }>();
  const [saving, setSaving] = useState(false);

  const save = async ({ keychains_per_person }: { keychains_per_person: number }) => {
    try {
      setSaving(true);
      const res = await UpdateAccessSettings({ keychains_per_person });
      form.setFieldsValue({ keychains_per_person: res.data.data.keychains_per_person });
      onSaved(res.data.data);
      message.success("Keychains per person saved");
    } catch (err) {
      message.error(showFieldError(form, err) || apiErrorMessage(err) || "Couldn't save keychains per person");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.section}>
      <h4 className={styles.sectionTitle}>Keychains per person</h4>
      <Form
        form={form}
        layout="inline"
        onFinish={save}
        initialValues={{ keychains_per_person: settings.keychains_per_person }}
      >
        <Form.Item
          name="keychains_per_person"
          label="How many keychains one account may buy"
          rules={[{ required: true, message: "1 to 10" }]}
        >
          <InputNumber min={1} max={10} precision={0} style={{ width: 90 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save
          </Button>
        </Form.Item>
      </Form>
    </section>
  );
};

interface ShippingValues {
  mode: ShippingMode;
  /** Dollars. */
  flat_amount: number;
  countries: ShippingCountry[];
  length: number;
  width: number;
  height: number;
  distance_unit: Parcel["distance_unit"];
  weight: number;
  mass_unit: Parcel["mass_unit"];
}

const shippingValues = ({ shipping }: AccessSettings): ShippingValues => ({
  mode: shipping.mode,
  flat_amount: toDollars(shipping.flat_amount_cents ?? 0),
  countries: shipping.countries,
  ...shipping.parcel,
});

const ShippingSection = ({ settings, onSaved }: SettingsTabProps) => {
  const [form] = Form.useForm<ShippingValues>();
  const [saving, setSaving] = useState(false);
  const mode = Form.useWatch("mode", form);

  const save = async (values: ShippingValues) => {
    try {
      setSaving(true);
      const res = await UpdateAccessSettings({
        shipping: {
          mode: values.mode,
          // Kept when another mode is picked, so switching back to flat finds it.
          flat_amount_cents: toCents(values.flat_amount ?? 0),
          countries: values.countries,
          parcel: {
            length: values.length,
            width: values.width,
            height: values.height,
            distance_unit: values.distance_unit,
            weight: values.weight,
            mass_unit: values.mass_unit,
          },
        },
      });
      form.setFieldsValue(shippingValues(res.data.data));
      onSaved(res.data.data);
      message.success("Shipping saved");
    } catch (err) {
      const text = showFieldError(form, err, { "shipping.flat_amount_cents": "flat_amount" });
      message.error(text || apiErrorMessage(err) || "Couldn't save shipping");
    } finally {
      setSaving(false);
    }
  };

  const measure = (name: keyof Parcel, label: string) => (
    <Form.Item name={name} label={label} rules={[{ required: true, type: "number", min: 0.01, message: "Above 0" }]}>
      <InputNumber min={0} step={0.1} precision={2} style={{ width: 110 }} />
    </Form.Item>
  );

  return (
    <section className={styles.section}>
      <h4 className={styles.sectionTitle}>Shipping the keychain</h4>
      <p className={styles.intro}>
        What checkout charges for shipping, where the keychain ships, and the parcel Shippo prices and labels. It ships
        from the warehouse address set on the server (SHIP_FROM_* in its .env).
      </p>
      <Form<ShippingValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={save}
        initialValues={shippingValues(settings)}
      >
        <Form.Item name="mode" label="Shipping charge">
          <Radio.Group
            orientation="vertical"
            options={[
              { value: "live", label: "Live rates from Shippo: the customer picks a service at checkout" },
              { value: "flat", label: "A flat amount" },
              { value: "free", label: "Free" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="flat_amount"
          label="Flat amount"
          hidden={mode !== "flat"}
          rules={[
            { required: true, message: "Type the flat amount" },
            { type: "number", min: 0, max: 1000, message: "$0 to $1,000" },
          ]}
        >
          <InputNumber prefix="$" min={0} max={1000} step={0.5} precision={2} style={{ width: 160 }} />
        </Form.Item>
        <Form.Item
          name="countries"
          label="Ships to"
          extra="Canada adds a customs declaration to each shipment."
          rules={[{ required: true, type: "array", min: 1, message: "Pick at least one country" }]}
        >
          <Checkbox.Group
            options={[
              { value: "US", label: "United States" },
              { value: "CA", label: "Canada" },
            ]}
          />
        </Form.Item>
        <div className={styles.listLabel}>Parcel</div>
        <Space wrap size={12} align="start">
          {measure("length", "Length")}
          {measure("width", "Width")}
          {measure("height", "Height")}
          <Form.Item name="distance_unit" label="Unit">
            <Select
              style={{ width: 90 }}
              options={[
                { value: "in", label: "in" },
                { value: "cm", label: "cm" },
              ]}
            />
          </Form.Item>
          {measure("weight", "Weight")}
          <Form.Item name="mass_unit" label="Unit">
            <Select
              style={{ width: 90 }}
              options={[
                { value: "lb", label: "lb" },
                { value: "oz", label: "oz" },
                { value: "kg", label: "kg" },
                { value: "g", label: "g" },
              ]}
            />
          </Form.Item>
        </Space>
        <div>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save shipping
          </Button>
        </div>
      </Form>
    </section>
  );
};

export default SettingsTab;
