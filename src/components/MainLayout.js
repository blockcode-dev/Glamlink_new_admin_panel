import React, { useState, useRef, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { AiOutlineDashboard } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { MdOutlineManageAccounts } from "react-icons/md";
import { FaRegBell } from "react-icons/fa6";
import { FiUser } from "react-icons/fi";
import { VscBellDot } from "react-icons/vsc";
import { MdContactPhone } from "react-icons/md";
import { FiMail } from "react-icons/fi";
import { LuSettings } from "react-icons/lu";
import { FaRegCircleUser } from "react-icons/fa6";
import { FiActivity } from "react-icons/fi";
import { CiLogin } from "react-icons/ci";
import { Layout, theme, Menu } from "antd";
import { IoLayers } from "react-icons/io5";
import { LuLayers } from "react-icons/lu";
import { PiShoppingCartBold } from "react-icons/pi";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BiCategoryAlt } from "react-icons/bi";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { MdManageAccounts } from "react-icons/md";
import { FiTruck } from "react-icons/fi";
import { MdOutlineMarkUnreadChatAlt } from "react-icons/md";
import { IoMdChatboxes } from "react-icons/io";
import { SiStoryblok } from "react-icons/si";
import "./MainLayout.scss";
import { message } from "antd";
import Login from "../pages/Login/Login";
import { GetAdminProfile } from "../services/Api/Api";
import { GetNotifications } from "../services/Api/NotificationApi";
import { Button } from "primereact/button";
const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [idData, setIdData] = React.useState({});
  const [notificationData, setNotification] = React.useState([]);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const getData = async () => {
    try {
      let result = await GetAdminProfile(localStorage.getItem("adminToken"));
      setIdData(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getData();
  }, []);

  // const getNotifications = async () => {
  //   try {
  //     let result = await GetNotifications(localStorage.getItem("adminToken"));
  //     const notificationsArray = result?.data?.data || []; // Ensure it's an array or set to an empty array if undefined
  //     setNotification(notificationsArray);
  //     console.log("notificationsArray", notificationsArray);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // useEffect(() => {
  //   getNotifications();
  // }, []);

  useEffect(() => {
    // Function to fetch notifications
    const fetchNotifications = async () => {
      try {
        let result = await GetNotifications(localStorage.getItem("adminToken"));
        const notificationsArray = result?.data?.data || [];
        setNotification(notificationsArray);
        console.log("notificationsArray", notificationsArray);
      } catch (e) {
        console.log(e);
      }
    };

    // Fetch notifications initially
    fetchNotifications();

    // Set up interval to fetch notifications every 10 seconds
    const intervalId = setInterval(fetchNotifications, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleMailClick = () => {
    window.location.href =
      "https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox";
  };

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const navigateToAllNotifications = () => {
    navigate("/notifications");
  };
  const navigateToChats = () => {
    navigate("/redirection");
  };

  function logout() {
    localStorage.removeItem("adminToken");
    message.success(" Logged Out Successfully");
    setTimeout(() => {
      navigate("/Login");
    }, 1000);
  }

  const token = localStorage.getItem("adminToken");

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
            <div className="logo">
              <h2 className="text-white fs-5 text-center py-3 mb-0">
                <span className="sm-logo">NM</span>
                <span className="lg-logo">NUNAMOVING APP</span>
              </h2>
            </div>

            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={[""]}
              onClick={({ key }) => {
                if (key === "signout") {
                } else {
                  navigate(key);
                }
              }}
              items={[
                {
                  key: "/",
                  icon: <AiOutlineDashboard className="fs-4" />,
                  label: "Dashboard",
                },
                {
                  key: "/customers",
                  icon: <FaUsers className="fs-4" />,
                  label: "Users",
                },
                {
                  key: "/service",
                  icon: <BiSolidCategoryAlt className="fs-4" />,
                  label: "Services",
                  children: [
                    {
                      key: "services",
                      icon: <BiCategoryAlt className="fs-4" />,
                      label: "Service List",
                    },
                    {
                      key: "bookings",
                      icon: <BiCategoryAlt className="fs-4" />,
                      label: "User Bookings",
                    },
                    {
                      key: "guestBookings",
                      icon: <BiCategoryAlt className="fs-4" />,
                      label: "Guest Bookings",
                    },
                  ],
                },
                {
                  key: "/eCommerce",
                  icon: <FaShoppingCart className="fs-4" />,
                  label: "E-Commerce",
                  children: [
                    {
                      key: "productList",
                      icon: <PiShoppingCartBold className="fs-4" />,
                      label: "Product List",
                    },
                    {
                      key: "orders",
                      icon: <FiTruck className="fs-4" />,
                      label: "Orders",
                    },
                  ],
                },
                {
                  key: "/redirection",
                  icon: <IoMdChatboxes className="fs-4" />,
                  label: "Chat",
                },
                {
                  key: "/blogs",
                  icon: <SiStoryblok className="fs-4" />,
                  label: "Blogs",
                },
                {
                  key: "/quotes",
                  icon: <MdContactPhone className="fs-4" />,
                  label: "Quote Request",
                },
                {
                  key: "/t&c1",
                  icon: <IoLayers className="fs-4" />,
                  label: "Content",
                  children: [
                    {
                      key: "termsAndConditions",
                      icon: <LuLayers className="fs-4" />,
                      label: "T&C",
                    },
                    {
                      key: "aboutUs",
                      icon: <LuLayers className="fs-4" />,
                      label: "About Us",
                    },
                    {
                      key: "support",
                      icon: <LuLayers className="fs-4" />,
                      label: "Support",
                    },
                  ],
                },

                {
                  key: "/adminList",
                  icon: <MdManageAccounts className="fs-4" />,
                  label: "Access Management",
                },
              ]}
            />
          </Sider>
          <Layout className="site-layout">
            <Header
              className="d-flex justify-content-between ps-1 pe-5"
              style={{
                padding: 0,
                background: colorBgContainer,
              }}
            >
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: "trigger",
                  onClick: () => setCollapsed(!collapsed),
                }
              )}
              <div className="d-flex gap-4 align-items-center">
                <div className="position-relative clicked">
                  <FiMail className="fs-3" onClick={handleMailClick} />
                </div>
                <div
                  role="button"
                  id="dropdownMenuLink"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  className="d-flex align-items-center"
                >
                  <div className="position-relative clicked">
                    <FaRegBell
                      className="fs-3"
                      onClick={(event) => handleClick(event)}
                    />

                    <span className="badge bg-warning rounded-circle p-1 position-absolute">
                      {notificationData.activeNotificationCount}
                    </span>
                  </div>
                </div>

                <div
                  className="dropdown-menu notification"
                  aria-labelledby="dropdownMenuLink"
                  style={{
                    borderTopColor: "purple",
                    borderTopWidth: "4px",
                    maxWidth: "300px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "17px",
                      marginLeft: "5px",
                      marginTop: "5px",
                    }}
                  >
                    Notifications
                  </h4>

                  <hr style={{ margin: "5px 0" }} />

                  <div style={{ overflow: "auto" }}>
                    {notificationData &&
                    notificationData.notifications &&
                    notificationData.notifications.length > 0 ? (
                      notificationData.notifications
                        .slice(0, 5)
                        .map((item, index) => (
                          <div key={index}>
                            {/* Render your notification item here */}
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                padding: "10px",
                              }}
                            >
                              <h5>{item.title}</h5>
                              {item.notification_user &&
                                item.notification_user.user_profile && (
                                  <p>
                                    {item.notification_user.user_profile.name}
                                  </p>
                                )}
                            </div>

                            <p>{item.notification}</p>

                            {index < 4 && <hr />}
                          </div>
                        ))
                    ) : (
                      <p>No active notifications found</p>
                    )}
                  </div>

                  <div style={{ lineHeight: "0px !important" }}>
                    <a href="/notifications">View All</a>
                  </div>
                </div>

                <div className="position-relative clicked">
                  <MdOutlineMarkUnreadChatAlt
                    onClick={() => navigateToChats()}
                    className="fs-3"
                  />
                </div>
                <div className="vertical-line"></div>
                <div className="position-relative">
                  <div className="d-flex align-items-center">
                    <div
                      role="button"
                      id="dropdownMenuLink"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      className="d-flex align-items-center"
                    >
                      <FaRegCircleUser className="fs-3 me-2" />
                      <div className="d-flex flex-column">
                        {" "}
                        <p className="mb-0" style={{ fontWeight: "700" }}>
                          {idData?.name}
                        </p>
                        <p className="mb-0">{idData?.admin_role?.name || ""}</p>
                      </div>
                    </div>
                    <div
                      className="dropdown-menu admin"
                      aria-labelledby="dropdownMenuLink"
                      style={{
                        // margin: "10px !important",
                        borderTopColor: "purple",
                        borderTopWidth: "4px",
                      }}
                    >
                      <li to="/viewAdmin">
                        <Link
                          className="dropdown-item py-1 mb-1"
                          style={{ height: "auto", lineHeight: "30px" }}
                          to="/viewAdmin"
                        >
                          <FiUser style={{ marginRight: "10px" }} />
                          View Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item py-1 mb-1"
                          style={{ height: "auto", lineHeight: "30px" }}
                          to="/settings"
                        >
                          <LuSettings style={{ marginRight: "10px" }} />
                          Account Settings
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="dropdown-item py-1 mb-1"
                          style={{ height: "auto", lineHeight: "30px" }}
                          to="/loginLogs"
                        >
                          <FiActivity style={{ marginRight: "10px" }} />
                          User Login Activity
                        </Link>
                      </li>
                      <div className="dropdown-divider"></div>
                      <li>
                        <Link
                          className="dropdown-item py-1 mb-1"
                          style={{ height: "auto", lineHeight: "30px" }}
                          onClick={() => logout()}
                        >
                          <CiLogin style={{ marginRight: "10px" }} />
                          Sign Out
                        </Link>
                      </li>
                    </div>
                  </div>
                </div>
              </div>
            </Header>
            <Content
              style={{
                margin: "24px 16px",
                padding: 24,
                minHeight: 280,
                background: colorBgContainer,
              }}
            >
              <ToastContainer
                position="top-right"
                autoClose={250}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme="light"
              />
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
