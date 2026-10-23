/** @format */

import React, { useEffect, useState } from "react";
import { message, Tag, Spin, Modal, Button } from "antd";
import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import {
  GetPartnershipInquiryById,
  DeletePartnershipInquiry,
} from "../../services/Api/PartnershipApi";
import styles from "./PartnerInquiries.module.scss";
import { useIdParam } from "../../utils/routing";
import type { PartnershipInquiry } from "../../types/content";

const interestColor: Record<string, string> = {
  Podcast: "geekblue",
  "Brand Partnership": "purple",
  Events: "cyan",
};

const ViewPartnerInquiry = () => {
  const id = useIdParam();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState<PartnershipInquiry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const result = await GetPartnershipInquiryById(id);
        setInquiry(result?.data || null);
      } catch (err) {
        message.error("Failed to load inquiry");
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [id]);

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete Inquiry",
      content: "Are you sure you want to delete this inquiry?",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await DeletePartnershipInquiry(id);
          message.success("Inquiry deleted successfully");
          navigate("/partner-inquiries");
        } catch (err) {
          message.error("Failed to delete inquiry");
        }
      },
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => navigate("/partner-inquiries")}
          >
            <ArrowLeftOutlined />
          </button>
          <div>
            <h3 className={styles.headerTitle}>Inquiry Details</h3>
            <p className={styles.headerSubtitle}>
              {inquiry
                ? `Received ${dayjs(inquiry.created_at).format(
                    "MMM DD, YYYY · hh:mm A",
                  )}`
                : "Partnership inquiry"}
            </p>
          </div>
        </div>

        {inquiry && (
          <div className={styles.headerActions}>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className={styles.detailCard}>
        {loading ? (
          <div className={styles.centerBox}>
            <Spin />
          </div>
        ) : !inquiry ? (
          <div className={styles.centerBox}>Inquiry not found</div>
        ) : (
          <>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Name</div>
                <div className={styles.detailValue}>{inquiry.name}</div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Company / Brand</div>
                <div className={styles.detailValue}>
                  {inquiry.company_brand || "-"}
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Email</div>
                <a
                  href={`mailto:${inquiry.email}`}
                  className={styles.linkText}
                >
                  {inquiry.email}
                </a>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailLabel}>Website / Instagram</div>
                {inquiry.website_instagram ? (
                  <span
                    className={styles.linkText}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      window.open(inquiry.website_instagram ?? undefined, "_blank")
                    }
                  >
                    {inquiry.website_instagram}
                  </span>
                ) : (
                  <div className={styles.detailValue}>-</div>
                )}
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Interested In</div>
              <div className={styles.pagesCell}>
                {Array.isArray(inquiry.interested_in) &&
                inquiry.interested_in.length ? (
                  inquiry.interested_in.map((item) => (
                    <Tag
                      key={item}
                      color={interestColor[item] || "default"}
                      style={{ borderRadius: 20 }}
                    >
                      {item}
                    </Tag>
                  ))
                ) : (
                  <span>-</span>
                )}
              </div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Message</div>
              <div className={styles.messageBox}>{inquiry.message || "-"}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewPartnerInquiry;