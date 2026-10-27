// Money as the API speaks it (whole cents, USD) and as people read and type it (dollars).

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** 499 → "$4.99" */
export const money = (cents: number) => usd.format(cents / 100);

/** Dollars typed in a form → whole cents (4.99 → 499), without floating-point drift. */
export const toCents = (dollars: number) => Math.round(dollars * 100);

/** Whole cents → dollars, for a form field. */
export const toDollars = (cents: number) => cents / 100;
