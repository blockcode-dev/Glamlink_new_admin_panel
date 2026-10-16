import type { UserRef } from "./user";

/** A profession ("speciality") professionals pick. */
export interface Speciality {
  id: number;
  title: string;
  number_of_users?: number;
}

/** A user listed under a profession. */
export interface ProfessionUser {
  id: number;
  name: string;
  created_at: string;
}

export interface ServiceCategory {
  id: number;
  title: string;
  number_of_service_list?: number;
}

/**
 * A service in a category. Admin-defined services have `title`; services in the
 * "Other" category (id 23) are added by professionals and have `name` and `service_user`.
 */
export interface ServiceListItem {
  id: number;
  category_id?: number;
  title?: string;
  description?: string;
  name?: string;
  service_user?: UserRef;
  created_at: string;
}

/** GetOtherServiceListByCategoryId wraps the "Other" services with their count. */
export interface OtherServiceList {
  data: ServiceListItem[];
  number_of_service_list: number;
}
