import type { UserRef } from "./user";

/** Top-level product category ("heading"). */
export interface ProductCategory {
  id: number;
  title: string;
  number_of_product_categories?: number;
}

/** A sub-category under a ProductCategory. */
export interface ProductSubCategory {
  id: number;
  title: string;
  description?: string;
  category_id: number;
  created_at: string;
}

/** Tax category a product is filed under. */
export interface TaxCategory {
  id: number;
  name: string;
  numeral_tax_category: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number | string;
  stock: number;
  /** "approved" or "pending". */
  status: string;
  average_rating: number | string;
  /** Number of ratings. */
  rating?: number;
  numeral_tax_category?: string;
  user_product: UserRef;
  product_categories?: { title: string }[];
  product_attachments: { file_name: string }[];
}

export interface ProductReview {
  id: number;
  rating: number | string;
  review: string;
  created_at: string;
  review_product: UserRef;
}

export interface OrderCustomer {
  email: string;
  user_profile: { name: string; mobile?: string };
}

export interface OrderAddress {
  address_line_1?: string;
  user_city?: { name: string };
  user_state?: { name: string };
  user_country?: { name: string };
  postal_code?: string;
}

/** One line of an order (a product), with the order it belongs to. */
export interface Order {
  id: number;
  total_price: number | string;
  total_items: number;
  created_at: string;
  order_details_order: {
    order_id: number | string;
    orders_user: OrderCustomer;
    order_address?: OrderAddress;
  };
  product_details?: { name: string; price: number };
  amount_excluding_tax?: number | string;
  tax_amount?: number | string;
  amount_including_tax?: number | string;
}
