/** @format */

import React, { useState, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreAddOutlined,
  AppstoreOutlined,
  AudioOutlined,
  BookOutlined,
  CalendarOutlined,
  ContainerOutlined,
  DashboardOutlined,
  FlagOutlined,
  FolderOpenOutlined,
  FormOutlined,
  GiftOutlined,
  HistoryOutlined,
  IdcardOutlined,
  LineChartOutlined,
  LockOutlined,
  LogoutOutlined,
  NotificationOutlined,
  PictureOutlined,
  QuestionCircleOutlined,
  QuestionOutlined,
  ReadOutlined,
  ScheduleOutlined,
  ShareAltOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  StarOutlined,
  TagsOutlined,
  TeamOutlined,
  TruckOutlined,
  UserOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router";
import { Layout, theme, Menu, Dropdown, Flex } from "antd";
import { message } from "antd";
import Login from "../pages/Login/Login";
import {
  GetAdminProfile,
  GetPendingFormCount,
  GetPendingProductCount,
} from "../services/Api/Api";
import logo from "../assets/glamlink-logo-black.png";
import { Badge } from "antd";
import "./MainLayout.scss";
import { clearSession, useSessionToken } from "../utils/session";
import type { Admin } from "../types/admin";
const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  // Re-renders when the session starts or ends (here or in another tab).
  const token = useSessionToken();
  const [idData, setIdData] = React.useState<Partial<Admin>>({});
  const [applicantCount, setApplicantCount] = useState(0);
  const getData = async (adminToken: string) => {
    try {
      const result = await GetAdminProfile(adminToken);
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

  useEffect(() => {
    if (!token) return;
    async function fetchApplicantCount(adminToken: string) {
      try {
        const res = await GetPendingFormCount(adminToken);
        const count = parseInt(String(res.data.data), 10);
        setApplicantCount(isNaN(count) ? 0 : count);
      } catch (err) {
        console.error("Failed to fetch applicant count:", err);
      }
    }

    fetchApplicantCount(token);
  }, [token]);

  const [pendingProductCount, setPendingProductCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    async function fetchPendingProductCount(adminToken: string) {
      try {
        const res = await GetPendingProductCount(adminToken);
        const count = parseInt(String(res.data?.data), 10);
        setPendingProductCount(isNaN(count) ? 0 : count);
      } catch (err) {
        console.error("Failed to fetch pending product count:", err);
      }
    }

    fetchPendingProductCount(token);
  }, [token]);

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();

  function logout() {
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
              defaultSelectedKeys={[""]}
              onClick={({ key }) => navigate(key)}
              items={[
                {
                  key: "/",
                  icon: <DashboardOutlined />,
                  label: "Dashboard",
                },
                {
                  key: "/users",
                  icon: <TeamOutlined />,
                  label: "Users",
                },
                {
                  key: "/professionals",
                  icon: <SolutionOutlined />,
                  label: "Professionals",
                },
                {
                  key: "/form",
                  icon: <FormOutlined />,
                  label: (
                    <span>
                      Applicant Form{" "}
                      {applicantCount > 0 && (
                        <Badge
                          count={applicantCount}
                          size="small"
                          style={{ marginLeft: "10px" }}
                        />
                      )}
                    </span>
                  ),
                },

                {
                  key: "/partner-inquiries",
                  icon: <UsergroupAddOutlined />,
                  label: "Partner With Us",
                },
                {
                  key: "access-cards",
                  icon: <IdcardOutlined />,
                  label: "Access Cards",
                  children: [
                    {
                      key: "/digital-card",
                      icon: <IdcardOutlined />,
                      label: "Card Requests",
                    },
                    {
                      key: "/access-orders",
                      icon: <TruckOutlined />,
                      label: "Access Orders",
                    },
                    {
                      key: "/access-analytics",
                      icon: <LineChartOutlined />,
                      label: "Analytics",
                    },
                  ],
                },
                {
                  key: "/directory",
                  icon: <FolderOpenOutlined />,
                  label: "Directory",
                },
                {
                  key: "/journals",
                  icon: <ReadOutlined />,
                  label: "Journals",
                  children: [
                    {
                      key: "/authors",
                      icon: <TeamOutlined />,
                      label: "Authors",
                    },
                    {
                      key: "/journal-categories",
                      icon: <AppstoreOutlined />,
                      label: "Categories",
                    },
                    {
                      key: "/journals",
                      icon: <ReadOutlined />,
                      label: "Journals",
                    },
                    {
                      key: "/education",
                      icon: <BookOutlined />,
                      label: "Education",
                    },
                    {
                      key: "/events",
                      icon: <CalendarOutlined />,
                      label: "Events",
                    },
                    {
                      key: "/shop",
                      icon: <ShoppingOutlined />,
                      label: "Shop",
                    },

                    {
                      key: "/journal-topics",
                      icon: <TagsOutlined />,
                      label: "Topics",
                    },
                    {
                      key: "/journal-faqs",
                      icon: <QuestionCircleOutlined />,
                      label: "FAQs",
                    },
                  ],
                },
                {
                  key: "/ads",
                  icon: <NotificationOutlined />,
                  label: "Ads",
                },

                {
                  key: "/podcast-schedule",
                  icon: <AudioOutlined />,
                  label: "Podcasts",
                  children: [
                    {
                      key: "/podcast-schedule",
                      icon: <AudioOutlined />,
                      label: "Podcast Schedule",
                    },
                  ],
                },
                {
                  key: "/referral",
                  icon: <ShareAltOutlined />,
                  label: "Referrals",
                },
                {
                  key: "/reward-rules",
                  icon: <GiftOutlined />,
                  label: "Glam Rewards Rules",
                },
                {
                  key: "/service-categories",
                  icon: <AppstoreAddOutlined />,
                  label: "Services",
                },
                {
                  key: "/specialities",
                  icon: <StarOutlined />,
                  label: "Specialities",
                },
                {
                  key: "/appointments",
                  icon: <ScheduleOutlined />,
                  label: "Appointments",
                },
                {
                  key: "/posts-list",
                  icon: <PictureOutlined />,
                  label: "Posts",
                },
                {
                  key: "/clips-list",
                  icon: <VideoCameraOutlined />,
                  label: "Clips",
                },
                {
                  key: "/banner",
                  icon: <FlagOutlined />,
                  label: "Banner",
                },
                {
                  key: "/faqs",
                  icon: <QuestionOutlined />,
                  label: "FAQs",
                },
                {
                  key: "/product-category",
                  icon: <ShoppingCartOutlined />,
                  label: "Ecommerce",
                  children: [
                    {
                      key: "/product-category",
                      icon: <AppstoreOutlined />,
                      label: "Product Category",
                    },
                    {
                      key: "/product-list",
                      icon: <ShopOutlined />,
                      label: (
                        <span>
                          Product{" "}
                          {pendingProductCount > 0 && (
                            <Badge
                              count={pendingProductCount}
                              size="small"
                              style={{
                                backgroundColor: "var(--color-warning)",
                                marginLeft: "10px",
                              }}
                            />
                          )}
                        </span>
                      ),
                    },

                    {
                      key: "/orders",
                      icon: <ContainerOutlined />,
                      label: "Orders",
                    },
                  ],
                },
                {
                  key: "/adminList",
                  icon: <UserSwitchOutlined />,
                  label: "Access Management",
                },
              ]}
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
