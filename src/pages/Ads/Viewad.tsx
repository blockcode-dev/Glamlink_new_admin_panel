/** @format */

import React, { useEffect, useState } from "react";
import { Button, message, Tag, Spin } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { adFromResponse, GetAdById } from "../../services/Api/AdApi";
import styles from "./ViewAd.module.scss";
import { useIdParam } from "../../utils/routing";
import type { Ad } from "../../types/ads";

const behaviourLabel: Record<string, string> = {
  static: "Static — scrolls normally with the page",
  sticky: "Sticky — stays visible while scrolling",
  "fixed-overlay": "Fixed overlay — always pinned",
};

const ViewAd = () => {
  const id = useIdParam();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAd();
  }, [id]);

  const fetchAd = async () => {
    try {
      setLoading(true);
      const res = await GetAdById(id);
      setAd(adFromResponse(res.data));
    } catch (err) {
      message.error("Failed to load ad");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrap}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className={styles.page}>
        <div className={styles.headerCard}>
          <div>
            <h3 className={styles.headerTitle}>Ad not found</h3>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/ads")}>
            Return to Ads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
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
              href={ad.link_url ?? undefined}
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
                ? dayjs(ad.start_date).format("DD/MM/YYYY hh:mm A")
                : "No start date"}
            </span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>End date</span>
            <span className={styles.detailValue}>
              {ad.end_date
                ? dayjs(ad.end_date).format("DD/MM/YYYY hh:mm A")
                : "No end date"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAd;