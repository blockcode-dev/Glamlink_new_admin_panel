import type { TablePaginationConfig, TableProps } from "antd";

/** A row with the 1-based serial number the list pages add for the "S.No." column. */
export type WithIndex<T> = T & { index: number };

/** antd Table's `onChange`, typed for rows of `T`. */
export type TableChangeHandler<T> = NonNullable<TableProps<T>["onChange"]>;

type TableFilters = Parameters<TableChangeHandler<object>>[1];
type TableSorter<T> = Parameters<TableChangeHandler<T>>[2];
type SingleSorter<T> = Exclude<TableSorter<T>, unknown[]>;

/** Pagination and sort state the list pages keep for their antd Table. */
export interface TableParams {
  pagination: TablePaginationConfig;
  filters?: TableFilters;
  sortField?: SingleSorter<object>["field"] | null;
  sortOrder?: SingleSorter<object>["order"];
}

/** antd passes an array only for multi-column sorting, which no table enables. */
export const singleSorter = <T>(sorter: TableSorter<T>): SingleSorter<T> =>
  Array.isArray(sorter) ? (sorter[0] ?? {}) : sorter;
