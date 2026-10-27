import React from "react";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import styles from "./PageHeader.module.scss";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Buttons, search boxes and filters, on the right. */
  extra?: React.ReactNode;
  /** Where the back arrow goes; no arrow without it. */
  back?: string;
}

/** The title card at the top of a page. */
const PageHeader = ({ title, subtitle, extra, back }: PageHeaderProps) => {
  const navigate = useNavigate();
  return (
    <div className={styles.header}>
      <div className={styles.heading}>
        {back && <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(back)} aria-label="Back" />}
        <div>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {extra && <div className={styles.extra}>{extra}</div>}
    </div>
  );
};

/** The card a page's table or form sits on. Consecutive panels are spaced apart. */
export const Panel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className ? `${styles.panel} ${className}` : styles.panel}>{children}</div>
);

export default PageHeader;
