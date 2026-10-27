import React, { useCallback, useEffect, useState } from "react";
import { Button, Result, Spin, message } from "antd";
import { useLocation, useNavigate } from "react-router";
import PageHeader from "../../components/PageHeader";
import { GetDirectoryApplication } from "../../services/Api/DirectoryApplicationsApi";
import { apiErrorCode, apiErrorMessage, apiErrorStatus } from "../../utils/apiError";
import { useIdParam } from "../../utils/routing";
import type { DirectoryApplication } from "../../types/directoryApplication";
import DirectoryListingForm from "./DirectoryListingForm";
import { listUrlFrom, viewPath } from "./listing";

/** Edits any listing: every field of the website's form, and its photos. */
const EditDirectoryListing = () => {
  const id = useIdParam();
  const navigate = useNavigate();
  const back = listUrlFrom(useLocation().state);
  const [listing, setListing] = useState<DirectoryApplication | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "failed">("loading");

  const load = useCallback(async () => {
    setState("loading");
    try {
      const res = await GetDirectoryApplication(id);
      setListing(res.data.data);
      setState("ready");
    } catch (err) {
      const missing = apiErrorStatus(err) === 404 || apiErrorCode(err) === "NOT_FOUND";
      if (!missing) {
        console.error("Error loading the listing:", err);
        message.error(apiErrorMessage(err) || "Couldn't load the listing");
      }
      setState(missing ? "missing" : "failed");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const toView = (replace = false) => navigate(viewPath(id), { replace, state: { list: back } });

  return (
    <div>
      <PageHeader
        title={listing ? `Edit ${listing.name}` : "Edit listing"}
        subtitle="Changes to an approved listing show on the website as soon as they're saved."
        back={viewPath(id)}
      />
      {state === "loading" && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin />
        </div>
      )}
      {(state === "missing" || state === "failed") && (
        <Result
          status={state === "missing" ? "404" : "error"}
          title={state === "missing" ? "This listing doesn't exist" : "Couldn't load the listing"}
          extra={
            <>
              {state === "failed" && (
                <Button type="primary" onClick={() => load()}>
                  Try again
                </Button>
              )}
              <Button onClick={() => navigate(back)}>Back to directory applications</Button>
            </>
          }
        />
      )}
      {state === "ready" && listing && (
        <DirectoryListingForm
          listing={listing}
          onSaved={() => {
            message.success("Listing saved");
            toView(true);
          }}
          onCancel={() => toView()}
        />
      )}
    </div>
  );
};

export default EditDirectoryListing;
