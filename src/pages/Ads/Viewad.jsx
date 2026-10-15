/** @format */

import React, { useEffect, useState } from "react";
import { Button, message, Tag, Spin } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { GetAdById } from "../../services/Api/AdApi";
import styles from "./ViewAd.module.scss";

const behaviourLabel = {
  static: "Static — scrolls normally with the page",
  sticky: "Sticky — stays visible while scrolling",
  "fixed-overlay": "Fixed overlay — always pinned",
};

const ViewAd = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAd();
  }, [id]);

  const fetchAd = async () => {
    try {
      setLoading(true);
      const res = await GetAdById(id);
      setAd(res.data.data || res.data);
    } catch (err) {
      message.error("Failed to load ad");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box className={styles.page}>
        <div className={styles.loadingWrap}>
          <Spin size="large" />
        </div>
      </Box>
    );
  }

  if (!ad) {
    return (
      <Box className={styles.page}>
        <div className={styles.headerCard}>
          <div>
            <h3 className={styles.headerTitle}>Ad not found</h3>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/ads")}>
            Return to Ads
          </Button>
        </div>
      </Box>
    );
  }

  return (
    <Box className={styles.page}>
      {/* HEADER */}
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>View Ad</h3>
          <p className={styles.headerSubtitle}>{ad.slot_id}</p>
        </div>

        <div className={styles.headerActions}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/ads")}>
            Return to Ads
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/edit-ad/${ad.id}`)}
          >
            Edit Ad
          </Button>
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* MEDIA */}
        <div className={styles.sectionCard}>
          <div className={styles.imageWrap}>
            {ad.image_url ? (
              ad.media_type === "video" ? (
                <video src={ad.image_url} controls />
              ) : (
                <img src={ad.image_url} alt={ad.alt_text || "Ad"} />
              )
            ) : (
              <div className={styles.imageEmpty}>No media</div>
            )}
          </div>
          <div className={styles.sizeLabel}>
            {ad.media_type === "video" ? "Video" : "Image"} · {ad.width} x{" "}
            {ad.height} px
          </div>
        </div>

        {/* DETAILS */}
        <div className={styles.sectionCard}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Slot ID</span>
            <span className={styles.detailValue}>{ad.slot_id}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Link URL</span>
            <a
              className={styles.detailValue}
              href={ad.link_url}
              target="_blank"
              rel="noreferrer"
            >
              {ad.link_url}
            </a>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Alt text</span>
            <span className={styles.detailValue}>{ad.alt_text || "-"}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Behaviour</span>
            <span className={styles.detailValue}>
              {behaviourLabel[ad.behaviour] || ad.behaviour}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Pages</span>
            <div className={styles.detailValue}>
              {Array.isArray(ad.pages) && ad.pages.length ? (
                ad.pages.map((page) => (
                  <Tag key={page} style={{ borderRadius: 20, marginBottom: 4 }}>
                    {page}
                  </Tag>
                ))
              ) : (
                "-"
              )}
            </div>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status</span>
            <Tag color={ad.status === "active" ? "green" : "red"}>
              {ad.status}
            </Tag>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Start date</span>
            <span className={styles.detailValue}>
              {ad.start_date
                ? moment(ad.start_date).format("DD/MM/YYYY hh:mm A")
                : "No start date"}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>End date</span>
            <span className={styles.detailValue}>
              {ad.end_date
                ? moment(ad.end_date).format("DD/MM/YYYY hh:mm A")
                : "No end date"}
            </span>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default ViewAd;