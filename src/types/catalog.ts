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
