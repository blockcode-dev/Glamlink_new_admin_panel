/** Envelope most endpoints wrap their payload in. */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** List body with the total alongside: `{ data: T[], count }`. */
export interface CountedList<T> {
  data: T[];
  count: number;
}

/** Paged list (Sequelize `findAndCountAll`), returned bare or inside `data`. */
export interface Paged<T> {
  count: number;
  rows: T[];
}

/** A list endpoint that answers `{ data: T[] }`, `{ data: { rows } }` or `{ rows }`. */
export interface FlexibleList<T> {
  data?: T[] | Paged<T>;
  rows?: T[];
}

/** Query params the paged list endpoints accept. */
export interface ListParams {
  page?: number;
  limit?: number;
  /** Sent as-is as the `sortBy` query param: "DESC", or a table's sort field. */
  sortBy?: React.Key | readonly React.Key[] | null;
}
