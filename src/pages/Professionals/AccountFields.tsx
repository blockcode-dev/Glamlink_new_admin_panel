import React from "react";
import dayjs from "dayjs";
import type { User } from "../../types/user";

// Account facts the new API adds to every user (one account per email).
const ACCOUNT_TYPE: Record<string, string> = { user: "App user", professional: "Professional", staff: "Staff" };
const PROFESSIONAL_TYPE: Record<string, string> = { individual: "Individual", brand: "Brand" };

const AccountFields = ({ user }: { user: Partial<User> | null | undefined }) => {
  const type = user?.account_type ? (ACCOUNT_TYPE[user.account_type] ?? user.account_type) : "Not provided";
  const kind = user?.professional_type ? PROFESSIONAL_TYPE[user.professional_type] ?? user.professional_type : null;
  return (
    <>
      <h4 className="heading_pi">Account type:</h4>
      <p style={{ marginBottom: "20px", fontSize: "13px" }}>{kind ? `${type} (${kind})` : type}</p>

      <h4 className="heading_pi">Email verified:</h4>
      <p style={{ marginBottom: "20px", fontSize: "13px" }}>
        {user?.email_verified_at ? dayjs(user.email_verified_at).format("MMMM D, YYYY") : "Not verified"}
      </p>
    </>
  );
};

export default AccountFields;
