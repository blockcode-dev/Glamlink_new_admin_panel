import { useState } from "react";
import { Button, Checkbox, Col, Form, Input, InputNumber, Modal, Row, Space, Switch, Tag, message } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  StarFilled,
} from "@ant-design/icons";
import { UpdateAccessPlan } from "../../services/Api/AccessAdminApi";
import { apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import type { AccessPlan, AccessProduct, PlanFeature } from "../../types/access";
import { planPrice, priceUnit, soldProducts } from "./pricing";
import styles from "./AccessPricing.module.scss";

const MAX_FEATURES = 20;

interface PlansTabProps {
  plans: AccessPlan[];
  products: AccessProduct[];
  /** After a plan is saved: reload the catalog. */
  onSaved: () => void;
}

/** The plans as the website's pricing page shows them, each with an edit form. */
const PlansTab = ({ plans, products, onSaved }: PlansTabProps) => {
  const [editing, setEditing] = useState<AccessPlan | null>(null);

  return (
    <>
      <p className={styles.intro}>
        The plans as the website's pricing page shows them, in order. Their prices come from the Prices tab; a running
        sale or a personal price changes what each person pays.
      </p>
      <Row gutter={[16, 16]}>
        {plans.map((plan) => (
          <Col key={plan.code} xs={24} md={12} xl={6}>
            <PlanCard plan={plan} products={products} onEdit={() => setEditing(plan)} />
          </Col>
        ))}
      </Row>
      {editing && (
        <PlanModal
          plan={editing}
          products={products}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onSaved();
          }}
        />
      )}
    </>
  );
};

/** One plan card, laid out like the website's (badge, else "With keychain" or the label, on top). */
const PlanCard = ({ plan, products, onEdit }: { plan: AccessPlan; products: AccessProduct[]; onEdit: () => void }) => (
  <div className={plan.is_active ? styles.planCard : `${styles.planCard} ${styles.planHidden}`}>
    <div className={styles.planTop}>
      {plan.badge ? (
        <Tag color="cyan" icon={<StarFilled />}>
          {plan.badge}
        </Tag>
      ) : (
        <span className={styles.eyebrow}>{plan.products.includes("keychain") ? "With keychain" : plan.label}</span>
      )}
      <Space size={4}>
        {!plan.is_active && <Tag>Hidden</Tag>}
        <Button size="small" icon={<EditOutlined />} onClick={onEdit} aria-label={`Edit ${plan.name}`}>
          Edit
        </Button>
      </Space>
    </div>
    <h4 className={styles.planName}>{plan.name}</h4>
    <div className={styles.planPrice}>{planPrice(plan.products, products)}</div>
    {plan.tagline && <p className={styles.planTagline}>{plan.tagline}</p>}
    <ul className={styles.features}>
      {plan.features.map((feature, index) => (
        <li
          key={index}
          className={
            feature.soon ? styles.featureSoon : feature.highlight === "keychain" ? styles.featureKeychain : undefined
          }
        >
          <CheckOutlined className={styles.featureIcon} />
          <span>
            {feature.text} {feature.soon && <Tag className={styles.soonTag}>Soon</Tag>}
          </span>
        </li>
      ))}
    </ul>
    <div className={styles.planFoot}>
      {plan.code} · order {plan.sort_order}
      {/* The website's own rule (Pricing/plans.ts ADD_ON_PLAN_IDS). */}
      {plan.code === "nfc_only" && (
        <div>The website offers this as the keychain add-on once Free is picked, not as a card of its own.</div>
      )}
    </div>
  </div>
);

interface PlanFormValues {
  name: string;
  label?: string;
  badge?: string;
  tagline?: string;
  features?: PlanFeature[];
  products?: string[];
  sort_order: number;
  is_active: boolean;
}

/**
 * The website shows a feature whose `highlight` is "keychain" as the keychain line. A checkbox for it; any other value
 * already stored is kept unless the box is ticked.
 */
const KeychainLineCheckbox = ({ value, onChange }: { value?: string; onChange?: (value: string | undefined) => void }) => (
  <Checkbox checked={value === "keychain"} onChange={(e) => onChange?.(e.target.checked ? "keychain" : undefined)}>
    Keychain line
  </Checkbox>
);

interface PlanModalProps {
  plan: AccessPlan;
  products: AccessProduct[];
  onClose: () => void;
  onSaved: () => void;
}

// Mounted only while open, so each opening starts from the saved plan.
const PlanModal = ({ plan, products, onClose, onSaved }: PlanModalProps) => {
  const [form] = Form.useForm<PlanFormValues>();
  const [saving, setSaving] = useState(false);

  const save = async (values: PlanFormValues) => {
    try {
      setSaving(true);
      await UpdateAccessPlan(plan.code, {
        name: values.name.trim(),
        // Empty clears them.
        label: values.label?.trim() ?? "",
        badge: values.badge?.trim() ?? "",
        tagline: values.tagline?.trim() ?? "",
        features: (values.features ?? []).map(({ text, soon, highlight }) => ({
          text: text.trim(),
          ...(soon ? { soon: true } : {}),
          ...(highlight ? { highlight } : {}),
        })),
        products: values.products ?? [],
        sort_order: values.sort_order,
        is_active: values.is_active,
      });
      message.success(`${values.name.trim()} saved`);
      onSaved();
    } catch (err) {
      message.error(showFieldError(form, err) || apiErrorMessage(err) || "Couldn't save the plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={`Edit plan: ${plan.name}`}
      okText="Save"
      onOk={() => form.submit()}
      confirmLoading={saving}
      onCancel={onClose}
      width={760}
      destroyOnHidden
    >
      <Form<PlanFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={save}
        initialValues={{
          name: plan.name,
          label: plan.label ?? "",
          badge: plan.badge ?? "",
          tagline: plan.tagline ?? "",
          features: plan.features.map((feature) => ({ ...feature, soon: Boolean(feature.soon) })),
          products: plan.products,
          sort_order: plan.sort_order,
          is_active: plan.is_active,
        }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, whitespace: true, message: "Give the plan a name" },
                { max: 100, message: "At most 100 characters" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="badge"
              label="Badge"
              extra="e.g. Most popular. Shown at the top of the card; empty for none."
              rules={[{ max: 40, message: "At most 40 characters" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="label"
              label="Label"
              extra={`The small heading when there's no badge. Plans with the keychain show "With keychain" instead.`}
              rules={[{ max: 40, message: "At most 40 characters" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="sort_order"
              label="Order"
              extra="Lower shows first."
              rules={[{ required: true, message: "Give it a place in the order" }]}
            >
              <InputNumber min={0} max={1000} precision={0} style={{ width: 140 }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="tagline" label="Tagline" rules={[{ max: 255, message: "At most 255 characters" }]}>
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} md={16}>
            <Form.Item name="products" label="Charges for" extra="What buying this plan pays for. None: a free plan.">
              <Checkbox.Group
                options={soldProducts(products).map((product) => ({
                  value: product.code,
                  label: `${product.name} (${priceUnit(product)})`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item name="is_active" label="Shown on the website" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.List
          name="features"
          rules={[
            {
              validator: async (_, features: PlanFeature[] | undefined) => {
                if ((features?.length ?? 0) > MAX_FEATURES) throw new Error(`At most ${MAX_FEATURES} features`);
              },
            },
          ]}
        >
          {(fields, { add, remove, move }, { errors }) => (
            <div>
              <div className={styles.listLabel}>Features</div>
              {fields.map((field, index) => (
                <div key={field.key} className={styles.featureRow}>
                  <Form.Item
                    name={[field.name, "text"]}
                    className={styles.featureText}
                    rules={[
                      { required: true, whitespace: true, message: "Type the feature, or remove this line" },
                      { max: 120, message: "At most 120 characters" },
                    ]}
                  >
                    <Input placeholder="e.g. Refresh your photos anytime" aria-label={`Feature ${index + 1}`} />
                  </Form.Item>
                  <Form.Item name={[field.name, "soon"]} valuePropName="checked">
                    <Checkbox>Soon</Checkbox>
                  </Form.Item>
                  <Form.Item name={[field.name, "highlight"]}>
                    <KeychainLineCheckbox />
                  </Form.Item>
                  <Space size={4} className={styles.featureButtons}>
                    <Button
                      icon={<ArrowUpOutlined />}
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    />
                    <Button
                      icon={<ArrowDownOutlined />}
                      aria-label="Move down"
                      disabled={index === fields.length - 1}
                      onClick={() => move(index, index + 1)}
                    />
                    <Button danger icon={<DeleteOutlined />} aria-label="Remove" onClick={() => remove(field.name)} />
                  </Space>
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                disabled={fields.length >= MAX_FEATURES}
                onClick={() => add({ text: "", soon: false })}
              >
                Add a feature
              </Button>
              <Form.ErrorList errors={errors} />
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default PlansTab;
