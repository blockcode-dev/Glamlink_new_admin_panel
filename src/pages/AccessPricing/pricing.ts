import dayjs from "dayjs";
import { money } from "../../utils/money";
import type { AccessDiscount, AccessProduct, DiscountDuration, SoldProductCode } from "../../types/access";

// Money and product wording for the Access screens. The API speaks whole cents (USD); people read and type dollars.
// The money helpers live in utils/money; the tabs take them from here with the rest of the wording.
export { money, toCents, toDollars } from "../../utils/money";

/** What people buy, in the order the screens list them. The catalog also holds an internal "shipping" product. */
const SOLD_PRODUCTS: SoldProductCode[] = ["pro", "keychain"];

/** The products people buy, in SOLD_PRODUCTS order. */
export const soldProducts = (products: AccessProduct[]) =>
  SOLD_PRODUCTS.flatMap((code) => products.filter((product) => product.code === code));

/** The product's name from the catalog, e.g. "Access Pro"; the code when the catalog doesn't have it. */
export const productName = (products: AccessProduct[], code: string) =>
  products.find((product) => product.code === code)?.name ?? code;

/** "/ month" for a subscription, "one-time" for the keychain. */
export const priceUnit = (product: Pick<AccessProduct, "kind" | "billing_interval">) =>
  product.kind === "subscription" ? `/ ${product.billing_interval ?? "month"}` : "one-time";

/** "$4.99 / month" */
export const listPrice = (product: AccessProduct) => `${money(product.amount_cents)} ${priceUnit(product)}`;

/** A plan's list prices as the pricing page words them: "$4.99 / month + $39.99 one-time"; "Free" without products. */
export const planPrice = (codes: string[], products: AccessProduct[]) => {
  const included = products.filter((product) => codes.includes(product.code));
  const ordered = [
    ...included.filter((product) => product.kind === "subscription"),
    ...included.filter((product) => product.kind !== "subscription"),
  ];
  return ordered.length ? ordered.map(listPrice).join(" + ") : "Free";
};

/** "20% off" or "$5.00 off". */
export const discountOff = (discount: Pick<AccessDiscount, "percent_off" | "amount_off_cents">) =>
  discount.percent_off !== null ? `${Number(discount.percent_off)}% off` : `${money(discount.amount_off_cents ?? 0)} off`;

/** How long a sale lasts on Access Pro's monthly payments. */
export const durationText = (duration: DiscountDuration, months: number | null) => {
  if (duration === "forever") return "Every payment";
  if (duration === "repeating") return months === 1 ? "The first month" : `The first ${months ?? "?"} months`;
  return "The first payment";
};

export type DiscountState = "running" | "scheduled" | "ended";

/** Whether a sale runs now, starts later, or has ended (it runs from its start until just before its end). */
export const discountState = (discount: Pick<AccessDiscount, "starts_at" | "ends_at">, now = dayjs()): DiscountState => {
  if (dayjs(discount.starts_at).isAfter(now)) return "scheduled";
  if (discount.ends_at && !dayjs(discount.ends_at).isAfter(now)) return "ended";
  return "running";
};

/** "Oct 16, 2026 3:05 PM", or the fallback for no date. */
export const dateTime = (value: string | null | undefined, fallback = "—") =>
  value ? dayjs(value).format("MMM D, YYYY h:mm A") : fallback;

/** "Oct 16, 2026", or the fallback for no date. */
export const date = (value: string | null | undefined, fallback = "—") =>
  value ? dayjs(value).format("MMM D, YYYY") : fallback;
