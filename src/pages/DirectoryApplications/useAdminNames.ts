import { useEffect, useState } from "react";
import { GetAdmins } from "../../services/Api/Api";

// The API answers who reviewed an application as the admin's id; the admins list has their names. Loaded once.
let known: Map<number, string> | null = null;

/** The reviewer's name for an admin id: "Admin #id" until the list loads, or for an admin no longer active. */
export const useAdminNames = () => {
  const [names, setNames] = useState<Map<number, string> | null>(known);

  useEffect(() => {
    if (known) return;
    let current = true;
    GetAdmins()
      .then((res) => {
        known = new Map((res.data.data ?? []).map((admin) => [admin.id, admin.name]));
        if (current) setNames(known);
      })
      .catch(() => {
        // GetAdmins logs it; the ids show instead.
      });
    return () => {
      current = false;
    };
  }, []);

  return (id: number | null): string | null => (id === null ? null : (names?.get(id) ?? `Admin #${id}`));
};
