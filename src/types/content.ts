import type { UserRef } from "./user";

export interface Faq {
  id: number;
  question: string;
  answer: string;
}

export interface Banner {
  id: number;
  file_name: string;
  /** "Image" or "Video". */
  file_type: string;
  banner_user: UserRef;
  created_at: string;
}

/** A professional's application form, one row per applicant. */
export interface FormSubmission {
  id: number;
  user_id: number;
  /** "pending", "approved" or "rejected". */
  status: string;
  created_at: string;
  answers_user: UserRef & { email: string };
}

/** A brand's "partner with us" enquiry from the public site. */
export interface PartnershipInquiry {
  id: number;
  name: string;
  company_brand?: string | null;
  email: string;
  website_instagram?: string | null;
  interested_in?: string[] | string | null;
  message?: string | null;
  created_at: string;
}

export interface FormAnswer {
  id: number;
  answer: string;
  questions_form: {
    question: string;
    /** "FILE_UPLOAD" answers hold a file URL. */
    type: string;
  };
}
