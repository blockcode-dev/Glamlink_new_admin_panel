import type { UserRef } from "./user";

/** Period the registration charts are grouped by. */
export type RegistrationPeriod = "today" | "week" | "month";

/** Period the post/clip upload counters are grouped by. */
export type UploadPeriod = "weekly" | "monthly" | "quarterly" | "annually";

export interface MostPostedService {
  name: string;
  service_count: number;
}

export interface MostBookedService {
  appointment_service?: { name: string };
  booking_count: number;
}

export interface BookedTimeSlot {
  start_time: string;
  end_time: string;
  booking_count: number;
}

export interface BookedProfessional {
  appointment_professional: UserRef;
  booking_count: number;
}
