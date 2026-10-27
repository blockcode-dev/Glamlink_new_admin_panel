export interface Attachment {
  id?: number;
  file_name: string;
  /** "Image" or "Video". */
  file_type: string;
}

export interface UserProfile {
  name: string;
  mobile?: string;
  /** null for a professional made without one (the API no longer defaults it to "Esthetician"). */
  profession?: string | null;
  about?: string;
  address?: string;
  created_at?: string;
}

/** A user embedded in another record (author, follower, reviewer…). */
export interface UserRef {
  id: number;
  user_profile: Pick<UserProfile, "name">;
}

export interface User {
  id: number;
  email: string;
  user_name?: string;
  /** "PENDING" until the email is verified. */
  status?: string;
  created_at: string;
  /** One account per email; "staff" accounts belong to the CRM. */
  account_type?: "user" | "professional" | "staff";
  /** Professionals only. */
  professional_type?: "individual" | "brand" | null;
  email_verified_at?: string | null;
  user_profile: UserProfile;
  user_attachments?: Attachment[];
}

export interface Professional extends User {
  is_founder?: boolean;
}

/** GetUserById: one account with its profile. */
export type UserDetail = User;
