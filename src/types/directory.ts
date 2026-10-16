/** A business category professionals can be listed under. */
export interface DirectoryCategory {
  id: number;
  title: string;
}

/** A directory listing shown in the public business directory. */
export interface DirectoryEntry {
  id: number;
  title: string;
  description?: string;
  /** Image URL. */
  images?: string | null;
  categories?: { category_id: number; title: string }[];
}
