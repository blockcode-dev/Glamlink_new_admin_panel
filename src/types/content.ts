import type { UserRef } from "./user";

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

/** Someone on the newsletter list (one row per email), from the website's sign-up forms. */
export interface NewsletterSubscriber {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  /** Which form they used: "popup", "footer", "podcast", … (lower-case letters, digits and dashes). */
  source: string | null;
  created_at: string;
  updated_at: string;
}

/** A professional's "Apply for Feature" request from the website's media kit. Every field is required on the form. */
export interface FeatureRequest {
  id: number;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  city: string;
  /** The feature they want: "Cover Feature", "Pro Spotlight", … */
  interest: string;
  created_at: string;
}

/** One term people typed into the website's search, lower-cased. Nothing about who searched is kept. */
export interface SearchTerm {
  term: string;
  searches: number;
  /** How many results the latest search for it found. */
  last_results: number;
  last_searched_at: string;
}

/** The home page's hand-set parts. Images are links to uploads on the API's host. */
export interface HomeSettings {
  hero_image: string | null;
  /** The chips under the search box: at most 10, each at most 60 characters. */
  popular_searches: string[];
  find_professional_image: string | null;
  updated_at: string | null;
}
