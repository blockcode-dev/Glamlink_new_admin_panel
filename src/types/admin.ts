export interface AdminRole {
  id?: number;
  name: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  admin_role?: AdminRole;
}

export interface LoginResult {
  token: string;
}

/** One app-user session from the login-activity log. */
export interface LoginRecord {
  id: number;
  user_id: number;
  role_id: number;
  ip_address: string;
  login_time_utc: string;
  logout_time_utc: string | null;
  login_user?: {
    email: string;
    user_profile?: { name?: string };
  };
}

/** Login records grouped by user id. */
export type LoginRecordsByUser = Record<string, LoginRecord[]>;
