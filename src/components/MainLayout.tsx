/** @format */

import React, { useState, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  AuditOutlined,
  CrownOutlined,
  AudioOutlined,
  BookOutlined,
  CalendarOutlined,
  DashboardOutlined,
  DollarOutlined,
  FolderOpenOutlined,
  FormOutlined,
  GlobalOutlined,
  HistoryOutlined,
  HomeOutlined,
  IdcardOutlined,
  InboxOutlined,
  LineChartOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  NotificationOutlined,
  PlaySquareOutlined,
  ProfileOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SearchOutlined,
  SnippetsOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  StarOutlined,
  TagOutlined,
  TagsOutlined,
  TeamOutlined,
  TruckOutlined,
  UnorderedListOutlined,
  UserOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Layout, theme, Menu, Dropdown, Flex, type MenuProps } from "antd";
import { message } from "antd";
import Login from "../pages/Login/Login";
import {
  AdminLogout,
  GetAdminProfile,
  GetPendingFormCount,
} from "../services/Api/Api";
import { GetPendingDirectoryApplicationCount } from "../services/Api/DirectoryApplicationsApi";
import logo from "../assets/glamlink-logo-black.png";
import { Badge } from "antd";
import "./MainLayout.scss";
import { clearSession, useSessionToken } from "../utils/session";
import type { Admin } from "../types/admin";
const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

/** Work waiting for review, shown as badges. */
interface PendingCounts {
  applicants: number;
  applications: number;
}

const withBadge = (label: string, count: number) => (
  <span>
    {label}{" "}
    {count > 0 && <Badge count={count} size="small" style={{ marginLeft: "10px" }} />}
  </span>
);

/**
 * The sidebar. Items are keyed by their route; groups by a name that is never a route, so a key is never used twice.
 * The panel looks after the website: the mobile app's screens (posts, clips, bookings, shop orders, rewards) are
 * gone until the app is rebuilt.
 */
const menuItems = (counts: PendingCounts): MenuItem[] => [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/professionals", icon: <SolutionOutlined />, label: "Professionals" },
  { key: "/pages", icon: <ProfileOutlined />, label: "Profile Pages" },
  { key: "/form", icon: <FormOutlined />, label: withBadge("Applicant Form", counts.applicants) },
  {
    key: "/directory-applications",
    icon: <AuditOutlined />,
    label: withBadge("Directory Applications", counts.applications),
  },
  {
    key: "group:inquiries",
    icon: <InboxOutlined />,
    label: "Inquiries",
    children: [
      { key: "/partner-inquiries", icon: <UsergroupAddOutlined />, label: "Partner With Us" },
      { key: "/feature-requests", icon: <StarOutlined />, label: "Feature Requests" },
      { key: "/newsletter", icon: <MailOutlined />, label: "Newsletter" },
    ],
  },
  {
    key: "group:access",
    icon: <IdcardOutlined />,
    label: "Access Cards",
    children: [
      { key: "/digital-card", icon: <IdcardOutlined />, label: "Card Requests" },
      { key: "/access-orders", icon: <TruckOutlined />, label: "Access Orders" },
      { key: "/access-subscriptions", icon: <CrownOutlined />, label: "Subscriptions" },
      { key: "/access-pricing", icon: <DollarOutlined />, label: "Pricing" },
      { key: "/access-analytics", icon: <LineChartOutlined />, label: "Analytics" },
    ],
  },
  { key: "/directory", icon: <FolderOpenOutlined />, label: "Directory Sections" },
  {
    key: "group:journal",
    icon: <ReadOutlined />,
    label: "Journals",
    children: [
      { key: "/authors", icon: <TeamOutlined />, label: "Authors" },
      { key: "/journal-categories", icon: <AppstoreOutlined />, label: "Categories" },
      { key: "/journals", icon: <ReadOutlined />, label: "Journals" },
      { key: "/education", icon: <BookOutlined />, label: "Education" },
      { key: "/events", icon: <CalendarOutlined />, label: "Events" },
      { key: "/shop", icon: <ShoppingOutlined />, label: "Shop" },
      { key: "/journal-topics", icon: <TagsOutlined />, label: "Topics" },
      { key: "/journal-faqs", icon: <QuestionCircleOutlined />, label: "FAQs" },
    ],
  },
  {
    key: "group:media",
    icon: <PlaySquareOutlined />,
    label: "Media",
    children: [
      { key: "/magazine", icon: <SnippetsOutlined />, label: "Magazine" },
      { key: "/watch/videos", icon: <VideoCameraOutlined />, label: "Videos" },
      { key: "/watch/series", icon: <UnorderedListOutlined />, label: "Video Series" },
      { key: "/podcast-schedule", icon: <AudioOutlined />, label: "Podcast Schedule" },
    ],
  },
  { key: "/ads", icon: <NotificationOutlined />, label: "Ads" },
  {
    key: "group:website",
    icon: <GlobalOutlined />,
    label: "Website",
    children: [
      { key: "/home-page", icon: <HomeOutlined />, label: "Home Page" },
      { key: "/search-terms", icon: <SearchOutlined />, label: "Search Terms" },
    ],
  },
  { key: "/specialities", icon: <TagOutlined />, label: "Specialities" },
  { key: "/adminList", icon: <UserSwitchOutlined />, label: "Access Management" },
];

/** Every route in the menu, with the group it sits in (if any). */
const routesIn = (items: MenuItem[], group?: string): { key: string; group?: string }[] =>
  items.flatMap((item) => {
    if (!item || !("key" in item) || item.key === undefined) return [];
    const key = String(item.key);
    if ("children" in item && item.children) return routesIn(item.children, key);
    return [{ key, group }];
  });

/** The menu item for a path: the route it is, or the longest route it sits under (/watch/videos/12 → /watch/videos). */
const itemFor = (path: string, items: MenuItem[]) =>
  routesIn(items)
    .filter(({ key }) => key === path || (key !== "/" && path.startsWith(`${key}/`)))
    .sort((a, b) => b.key.length - a.key.length)[0];

const MainLayout = () => {
  // Re-renders when the session starts or ends (here or in another tab).
  const token = useSessionToken();
  const [idData, setIdData] = React.useState<Partial<Admin>>({});
  const [counts, setCounts] = useState<PendingCounts>({ applicants: 0, applications: 0 });
  const { pathname } = useLocation();
  const getData = async (adminToken: string) => {
    try {
      const result = await GetAdminProfile();
      setIdData(result.data.data);
    } catch (e) {
      // An expired session is handled for every request in utils/session.ts.
      console.error("Error loading the admin profile:", e);
    }
  };

  // The profile and counts load once signed in, and again after signing in here.
  useEffect(() => {
    if (token) getData(token);
  }, [token]);

  // The badges are counted on sign-in and again on each change of page, so a review shows in them at once.
  useEffect(() => {
    if (!token) return;
    let current = true;
    const count = (key: keyof PendingCounts, load: () => Promise<number>) =>
      load()
        .then((n) => {
          if (current) setCounts((c) => ({ ...c, [key]: Number.isNaN(n) ? 0 : n }));
        })
        .catch((err) => console.error(`Failed to fetch the ${key} count:`, err));
    count("applicants", async () => Number.parseInt(String((await GetPendingFormCount()).data.data), 10));
    count("applications", GetPendingDirectoryApplicationCount);
    return () => {
      current = false;
    };
  }, [token, pathname]);

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();

  const items = menuItems(counts);
  const current = itemFor(pathname, items);
  // The current page's group opens; groups opened by hand stay open.
  const [openKeys, setOpenKeys] = useState<string[]>(() => (current?.group ? [current.group] : []));
  useEffect(() => {
    if (current?.group) setOpenKeys((keys) => (keys.includes(current.group!) ? keys : [...keys, current.group!]));
  }, [current?.group]);

  async function logout() {
    // Sign out on the server first (it ends every session of this admin), then here.
    await AdminLogout().catch(() => {});
    clearSession();
    message.success("Logged Out Successfully");
    navigate("/login");
  }

  return (
    <>
      {token ? (
        <Layout>
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className="sidebar"
          >
            <div className="logo ">
              {collapsed ? (
                <img src={logo} className="logo-image-1" alt="logo" />
              ) : (
                <img src={logo} className="logo-image" alt="logo" />
              )}
            </div>

            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={current ? [current.key] : []}
              openKeys={collapsed ? undefined : openKeys}
              onOpenChange={setOpenKeys}
              onClick={({ key }) => navigate(key)}
              items={items}
            />
          </Sider>
          <Layout className="site-layout">
            <Header
              style={{
                padding: "0 48px 0 4px",
                background: colorBgContainer,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: "trigger",
                  onClick: () => setCollapsed(!collapsed),
                },
              )}
              <Flex gap={24} align="center">
                <div className="vertical-line"></div>
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      {
                        key: "/viewAdmin",
                        icon: <UserOutlined />,
                        label: "View Profile",
                      },
                      {
                        key: "/reset-password",
                        icon: <LockOutlined />,
                        label: "Change Password",
                      },
                      {
                        key: "/loginLogs",
                        icon: <HistoryOutlined />,
                        label: "User Login Activity",
                      },
                      { type: "divider" },
                      {
                        key: "logout",
                        icon: <LogoutOutlined />,
                        label: "Sign Out",
                      },
                    ],
                    onClick: ({ key }) =>
                      key === "logout" ? logout() : navigate(key),
                  }}
                >
                  <Flex
                    align="center"
                    gap={8}
                    role="button"
                    style={{ cursor: "pointer", lineHeight: "20px" }}
                  >
                    <UserOutlined style={{ fontSize: 24 }} />
                    <Flex vertical>
                      <span style={{ fontWeight: 700 }}>{idData?.name}</span>
                      <span>{idData?.admin_role?.name || ""}</span>
                    </Flex>
                  </Flex>
                </Dropdown>
              </Flex>
            </Header>
            <Content
              style={{
                margin: "24px 16px",
                padding: 24,
                minHeight: 280,
                background: colorBgContainer,
              }}
            >
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      ) : (
        <Login />
      )}
    </>
  );
};
export default MainLayout;
