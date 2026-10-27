import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Alert, Button, Checkbox, Col, Form, InputNumber, Modal, Row, Table, Tag, message, type TableColumnsType } from "antd";
import { Link } from "react-router";
import { ChangeProductPrice, GetPriceChanges } from "../../services/Api/AccessAdminApi";
import { GetAdmins } from "../../services/Api/Api";
import { apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import type { AccessProduct, PriceChange, PriceChangeResult } from "../../types/access";
import { dateTime, listPrice, money, productName, soldProducts, toCents, toDollars } from "./pricing";
import styles from "./AccessPricing.module.scss";

interface PricesTabProps {
  products: AccessProduct[];
  /** After a price change: reload the catalog. */
  onChanged: () => void;
}

/** The list prices of Access Pro and the keychain, changing them, and their history. */
const PricesTab = ({ products, onChanged }: PricesTabProps) => {
  const [changing, setChanging] = useState<AccessProduct | null>(null);
  const [result, setResult] = useState<PriceChangeResult | null>(null);
  const [history, setHistory] = useState<PriceChange[]>([]);
  const [admins, setAdmins] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      // Admin names are a nicety: the history shows "Admin #id" without them.
      const [changes, adminList] = await Promise.all([GetPriceChanges(), GetAdmins().catch(() => null)]);
      setHistory(changes.data.data);
      if (adminList) setAdmins(new Map(adminList.data.data.map((admin) => [admin.id, admin.name || admin.email])));
    } catch (err) {
      console.error("Error loading the price history:", err);
      message.error(apiErrorMessage(err) || "Couldn't load the price history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const changed = (answer: PriceChangeResult) => {
    setChanging(null);
    setResult(answer);
    loadHistory();
    onChanged();
  };

  const columns: TableColumnsType<PriceChange> = [
    { title: "When", dataIndex: "created_at", width: 190, render: (value: string) => dateTime(value) },
    { title: "Product", dataIndex: "product_code", render: (code: string) => productName(products, code) },
    {
      title: "Price",
      key: "price",
      render: (_, change) => `${money(change.amount_before)} → ${money(change.amount_after)}`,
    },
    {
      title: "Subscribers",
      dataIndex: "subscribers_moved",
      render: (moved: boolean) => (moved ? <Tag color="blue">Moved to it</Tag> : "Kept their price"),
    },
    {
      title: "By",
      dataIndex: "admin_id",
      render: (id: number | null) => (id === null ? "—" : (admins.get(id) ?? `Admin #${id}`)),
    },
  ];

  return (
    <>
      <p className={styles.intro}>
        A new price applies to new purchases. People who already subscribe keep the price they signed up at, unless
        you move them when you change Access Pro's price. Personal prices and sales are worked out from these.
      </p>

      {result && <ChangeResult result={result} onClose={() => setResult(null)} />}

      <Row gutter={[16, 16]}>
        {soldProducts(products).map((product) => (
          <Col key={product.code} xs={24} md={12}>
            <div className={styles.priceCard}>
              <div>
                <div className={styles.priceName}>{product.name}</div>
                <div className={styles.priceAmount}>{listPrice(product)}</div>
                <div className={styles.muted}>
                  {product.kind === "subscription" ? "Monthly subscription" : "One-time purchase, shipped"}
                </div>
              </div>
              <Button onClick={() => setChanging(product)} aria-label={`Change the price of ${product.name}`}>
                Change price
              </Button>
            </div>
          </Col>
        ))}
      </Row>

      <h4 className={styles.sectionTitle}>Price history</h4>
      <Table<PriceChange>
        columns={columns}
        dataSource={history}
        rowKey="id"
        loading={loading}
        size="middle"
        scroll={{ x: 720 }}
        pagination={{ pageSize: 20, showSizeChanger: false, hideOnSinglePage: true }}
        locale={{ emptyText: "No price changes yet" }}
      />

      {changing && <ChangePriceModal product={changing} onClose={() => setChanging(null)} onChanged={changed} />}
    </>
  );
};

/** What a price change did, and which subscribers Stripe refused to move. */
const ChangeResult = ({ result, onClose }: { result: PriceChangeResult; onClose: () => void }) => {
  const { product, moved, failed = [] } = result;
  const title = `${product.name} is now ${listPrice(product)}.`;
  let description: ReactNode =
    product.kind === "subscription"
      ? "New purchases pay it; people who already subscribe keep the price they signed up at."
      : "New purchases pay it.";
  if (moved !== undefined) {
    const movedText =
      moved === 0
        ? "No paying subscriber needed moving."
        : `${moved} paying ${moved === 1 ? "subscriber moves" : "subscribers move"} to it at their next renewal.`;
    description = (
      <>
        {movedText}
        {failed.length > 0 && (
          <>
            {" "}
            Stripe refused to move {failed.length === 1 ? "this subscriber" : `these ${failed.length} subscribers`}; try
            again later, or change them in Stripe's dashboard:
            <ul className={styles.failures}>
              {failed.map((failure) => (
                <li key={failure.user_id}>
                  <Link to={`/viewProfessionals/${failure.user_id}`}>Account #{failure.user_id}</Link>: {failure.error}
                </li>
              ))}
            </ul>
          </>
        )}
      </>
    );
  }
  return (
    <Alert
      className={styles.result}
      type={failed.length ? "warning" : "success"}
      showIcon
      closable={{ onClose }}
      title={title}
      description={description}
    />
  );
};

interface PriceFormValues {
  /** Dollars. */
  amount: number;
  move_subscribers?: boolean;
}

interface ChangePriceModalProps {
  product: AccessProduct;
  onClose: () => void;
  onChanged: (result: PriceChangeResult) => void;
}

// Mounted only while open, so each opening starts from the current price.
const ChangePriceModal = ({ product, onClose, onChanged }: ChangePriceModalProps) => {
  const [form] = Form.useForm<PriceFormValues>();
  const [saving, setSaving] = useState(false);
  const isSubscription = product.kind === "subscription";

  const save = async ({ amount, move_subscribers }: PriceFormValues) => {
    const amountCents = toCents(amount);
    const move = isSubscription && Boolean(move_subscribers);
    if (amountCents === product.amount_cents && !move) {
      form.setFields([{ name: "amount", errors: ["That's the price already"] }]);
      return;
    }
    try {
      setSaving(true);
      const res = await ChangeProductPrice(product.code, {
        amount_cents: amountCents,
        ...(move ? { move_subscribers: true } : {}),
      });
      message.success("Price changed");
      onChanged(res.data.data);
    } catch (err) {
      message.error(
        showFieldError(form, err, { amount_cents: "amount" }) || apiErrorMessage(err) || "Couldn't change the price",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={`Change the price of ${product.name}`}
      okText="Change price"
      onOk={() => form.submit()}
      confirmLoading={saving}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form<PriceFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={save}
        initialValues={{ amount: toDollars(product.amount_cents), move_subscribers: false }}
      >
        <p className={styles.muted}>Now {listPrice(product)}. New purchases pay the new price.</p>
        <Form.Item
          name="amount"
          label={isSubscription ? "New price per month" : "New price"}
          rules={[
            { required: true, message: "Type the new price" },
            { type: "number", min: 0.5, message: "At least $0.50, Stripe's smallest charge" },
            { type: "number", max: 10000, message: "At most $10,000" },
          ]}
        >
          <InputNumber prefix="$" min={0} step={0.01} precision={2} style={{ width: 180 }} />
        </Form.Item>
        {isSubscription && (
          <Form.Item
            name="move_subscribers"
            valuePropName="checked"
            extra="Without this, people who already subscribe keep the price they signed up at. Those with a personal price keep it either way. Nobody pays a difference for the month under way."
          >
            <Checkbox>Move paying subscribers to this price at their next renewal</Checkbox>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default PricesTab;
