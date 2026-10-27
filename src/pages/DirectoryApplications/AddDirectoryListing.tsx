import React from "react";
import { message } from "antd";
import { useLocation, useNavigate } from "react-router";
import PageHeader from "../../components/PageHeader";
import DirectoryListingForm from "./DirectoryListingForm";
import { listUrlFrom, viewPath } from "./listing";

/** Adds a directory listing for someone; approved (the default), it makes their account and emails them. */
const AddDirectoryListing = () => {
  const navigate = useNavigate();
  const back = listUrlFrom(useLocation().state);

  return (
    <div>
      <PageHeader
        title="Add listing"
        subtitle="A directory listing for someone who hasn't applied on the website."
        back={back}
      />
      <DirectoryListingForm
        onSaved={(listing) => {
          message.success(
            listing.status === "approved"
              ? `Listing added. ${listing.email} was emailed how to sign in.`
              : "Listing added. It waits among the pending applications.",
          );
          navigate(viewPath(listing.id), { replace: true, state: { list: back } });
        }}
        onCancel={() => navigate(back)}
      />
    </div>
  );
};

export default AddDirectoryListing;
