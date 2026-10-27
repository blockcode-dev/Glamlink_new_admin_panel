import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Skeleton, Tabs, Tag } from "antd";
import { useSearchParams } from "react-router";
import PageHeader, { Panel } from "../../components/PageHeader";
import { GetAccessCatalog } from "../../services/Api/AccessAdminApi";
import { apiErrorMessage } from "../../utils/apiError";
import type { AccessCatalog, AccessSettings } from "../../types/access";
import PlansTab from "./PlansTab";
import PricesTab from "./PricesTab";
import DiscountsTab from "./DiscountsTab";
import PersonalPricesTab from "./PersonalPricesTab";
import SettingsTab from "./SettingsTab";
import { discountOff } from "./pricing";

const TABS = ["plans", "prices", "discounts", "personal", "settings"] as const;
type TabKey = (typeof TABS)[number];

const asTab = (value: string | null): TabKey => TABS.find((tab) => tab === value) ?? "plans";

/** Access plans, list prices, sales, personal prices and settings, one tab each (`?tab=` keeps the open one). */
const AccessPricing = () => {
  const [catalog, setCatalog] = useState<AccessCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const tab = asTab(params.get("tab"));

  const load = useCallback(async () => {
    try {
      const res = await GetAccessCatalog();
      setCatalog(res.data.data);
      setError(null);
    } catch (err) {
      console.error("Error loading the Access catalog:", err);
      setError(apiErrorMessage(err) || "Couldn't load the plans and prices");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const settingsSaved = (settings: AccessSettings) => setCatalog((current) => current && { ...current, settings });
  const sale = catalog?.active_discount;

  return (
    <div>
      <PageHeader
        title="Access Pricing"
        subtitle="What Access cards sell and for how much: plans, list prices, sales, personal prices, and what Free and Pro may do."
        extra={sale && <Tag color="green">Sale running: {`${sale.name}, ${discountOff(sale)}`}</Tag>}
      />
      {!catalog ? (
        <Panel>
          {error ? (
            <Alert
              type="error"
              showIcon
              title={error}
              action={
                <Button size="small" onClick={load}>
                  Try again
                </Button>
              }
            />
          ) : (
            <Skeleton active />
          )}
        </Panel>
      ) : (
        <Panel>
          <Tabs
            activeKey={tab}
            onChange={(key) => setParams({ tab: key }, { replace: true })}
            items={[
              {
                key: "plans",
                label: "Plans",
                children: <PlansTab plans={catalog.plans} products={catalog.products} onSaved={load} />,
              },
              {
                key: "prices",
                label: "Prices",
                children: <PricesTab products={catalog.products} onChanged={load} />,
              },
              {
                key: "discounts",
                label: "Discounts",
                children: <DiscountsTab products={catalog.products} onChanged={load} />,
              },
              {
                key: "personal",
                label: "Personal prices",
                children: <PersonalPricesTab products={catalog.products} />,
              },
              {
                key: "settings",
                label: "Settings",
                children: <SettingsTab settings={catalog.settings} onSaved={settingsSaved} />,
              },
            ]}
          />
        </Panel>
      )}
    </div>
  );
};

export default AccessPricing;
