import React, { useState, useRef, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { AiOutlineDashboard } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { MdOutlineManageAccounts } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { VscBellDot } from "react-icons/vsc";
import { PiChatTextBold } from "react-icons/pi";
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
import "./MainLayout.scss";
import { message } from "antd";
import Login from "../pages/Login/Login";
import { GetAdminProfile } from "../services/Api/Api";
const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [idData, setIdData] = React.useState({});
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
  const handleMailClick = () => {
    // Redirect to the specified URL
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
    navigate("/chats");
  };

  const ref = useRef(null);

  // const notify = () =>{ }
  function logout() {
    localStorage.removeItem("adminToken");
    // notify()
    message.success(" Logged Out Successfully");
    setTimeout(() => {
      navigate("/Login");
    }, 1000);
  }

  const token = localStorage.getItem("adminToken");

  return (
    <>
      {token ? (
        <Layout /* onContextMenu={(e) => e.preventDefault()} */>
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
                    // {
                    //   key: "addProduct",
                    //   icon: <PiShoppingCartBold className="fs-4" />,
                    //   label: "Add Product",
                    // },
                    {
                      key: "orders",
                      icon: <PiShoppingCartBold className="fs-4" />,
                      label: "Orders",
                    },
                  ],
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
                  key: "/admin1",
                  icon: <MdManageAccounts className="fs-4" />,
                  label: "Admin Management",
                  children: [
                    {
                      key: "adminList",
                      icon: <MdOutlineManageAccounts className="fs-4" />,
                      label: "Admin's List",
                    },
                    {
                      key: "stories3",
                      icon: <MdOutlineManageAccounts className="fs-4" />,
                      label: "Departmemt",
                    },
                    {
                      key: "role-list",
                      icon: <MdOutlineManageAccounts className="fs-4" />,
                      label: "Role",
                    },
                  ],
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
                  {/* <span className="badge bg-warning rounded-circle p-1 position-absolute">
                    3
                  </span> */}
                </div>
                <div
                  role="button"
                  id="dropdownMenuLink"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  className="d-flex align-items-center"
                >
                  <div className="position-relative clicked">
                    <VscBellDot
                      className="fs-3"
                      onClick={(event) => handleClick(event)}
                    />

                    {/* <span className="badge bg-warning rounded-circle p-1 position-absolute">
                    3
                  </span> */}
                  </div>
                </div>
                <div
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuLink"
                  style={{
                    // margin: "10px !important",
                    borderTopColor: "blue",
                    borderTopWidth: "4px",
                    maxWidth: "300px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "center",
                    }}
                  >
                    <p>Notifications</p>
                    <p style={{ color: "blue" }}>Mark All as Read</p>
                  </div>
                  <hr></hr>
                  <div style={{ height: "250px", overflow: "auto" }}></div>
                  <button
                    style={{
                      color: "blue",
                      display: "block",
                      width: "100%",
                      backgroundColor: "white",
                      border: "none",
                    }}
                  >
                    View All
                  </button>
                </div>

                <div className="position-relative clicked">
                  <PiChatTextBold
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
                      className="dropdown-menu"
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
