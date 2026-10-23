export interface Attachment {
  id?: number;
  file_name: string;
  /** "Image" or "Video". */
  file_type: string;
}

export interface UserProfile {
  name: string;
  mobile?: string;
  profession?: string;
  about?: string;
  address?: string;
  created_at?: string;
  no_of_post_posted?: number;
  no_of_service_provided?: number;
  total_bookings?: number;
  follower_count?: number;
  followee_count?: number;
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
  is_promoted?: boolean;
  referral_code?: string | null;
  referral_count?: number;
  referrals?: { name: string }[];
}

/** GetUserById: the user plus activity counters. */
export interface UserDetail extends User {
  number_of_reels?: number;
  number_of_post_liked?: number;
  number_of_post_commented?: number;
  number_of_clips_liked?: number;
  number_of_clips_commented?: number;
  number_of_user_bookings?: number;
  number_of_reviews_given?: number;
  number_of_reviews_taken?: number;
}

/** A user who signed up with someone's referral code. */
export interface ReferredUser extends User {
  referrer?: {
    referral_code?: string;
    user_profile?: { name?: string };
  };
}

export interface PayoutSummary {
  grossSales: number | string;
  totalRevenue: number | string;
  totalTax: number | string;
  totalPlatformFees: number | string;
  netPayout: number | string;
  totalOrders: number;
}

/** A paid promotion a professional holds, by profession or by keyword. */
export interface Promotion {
  title: string;
  type: "profession" | "keyword";
  ref_id: number;
  purchase_date: string;
  expiry_date: string;
  days_left: number;
}

export interface PromotionTarget {
  id: number;
  title: string;
}

export interface PromotionRequest {
  user_id: number;
  professionId?: number | null;
  keywordIds?: number[];
}

export interface RewardRule {
  id: number;
  title: string;
  coins: number;
}

export interface Follow {
  id: number;
  created_at: string;
  follow_user: UserRef;
}

export interface Followee {
  id: number;
  created_at: string;
  followee_user: UserRef;
}

export interface Review {
  id: number;
  text: string;
  created_at: string;
  reviewed_to?: UserRef;
  reviewed_by?: UserRef;
}

export interface ProfessionalService {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface AvailabilitySlot {
  id: number;
  day_name: string;
  maximum_available_seats: number;
  start_time: string;
  end_time: string;
  duration: number | string;
  created_at: string;
}

/** An appointment as listed on the Appointments page. */
export interface Appointment {
  id: number;
  status: string;
  notes?: string;
  appointment_professional: UserRef;
  appointment_user: UserRef;
  appointment_slot: { date: string; start_time: string };
}

export interface Booking {
  id: number;
  /** PENDING, ACCEPTED, ONGOING, SUCCESS (shown as COMPLETED), REJECTED, CANCELED or DELETED. */
  status: string;
  date: string;
  start_time: string;
  notes?: string;
  appointment_professional?: UserRef;
  appointment_user?: UserRef;
  appointment_service?: { name: string };
}
