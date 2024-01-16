import React, { useState, useRef } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { AiOutlineDashboard } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { FaUsers, FaRegSun } from "react-icons/fa";
import { MdOutlineManageAccounts } from "react-icons/md";
import { MdOutlineAutoStories } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import { VscBellDot } from "react-icons/vsc";
import { PiChatTextBold } from "react-icons/pi";
import { FiMail } from "react-icons/fi";
import { LuSettings } from "react-icons/lu";
import { FaRegCircleUser } from "react-icons/fa6";
import { FiActivity } from "react-icons/fi";
import { CiLogin } from "react-icons/ci";
import { toast } from "react-toastify";
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
// import {
//   Menu,
//   MenuItem,
// } from "@mui/material";
import { Toast } from "primereact/toast";
import Login from "../pages/Login/Login";
const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
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
    toast.warn("Logged Out!", {
      position: "top-right",
      autoClose: 500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
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
                <span className="sm-logo">LAP</span>
                <span className="lg-logo">LOGISTIC APP</span>
              </h2>
            </div>
            {/* <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem>Notifications</MenuItem>
              <Divider />
              <MenuItem>
                <ListItemIcon>
                  <PersonAdd fontSize="small" />
                </ListItemIcon>
                You have requested to Widthdrawl
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <PersonAdd fontSize="small" />
                </ListItemIcon>
                You have requested to Widthdrawl
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <PersonAdd fontSize="small" />
                </ListItemIcon>
                You have requested to Widthdrawl
              </MenuItem>
              <MenuItem fontSize="small">
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                You have requested to Widthdrawl
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => navigateToAllNotifications()}>
                View All
              </MenuItem>
            </Menu> */}
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
                  key: "services",
                  icon: <BiSolidCategoryAlt className="fs-4" />,
                  label: "Services",
                  children: [
                    {
                      key: "services",
                      icon: <BiCategoryAlt className="fs-4" />,
                      label: "Service List",
                    },
                    // {
                    //   key: "addService",
                    //   icon: <BiCategoryAlt className="fs-4" />,
                    //   label: "Add Service",
                    // },
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
                  key: "productList",
                  icon: <FaShoppingCart className="fs-4" />,
                  label: "E-Commerce",
                  children: [
                    {
                      key: "productList",
                      icon: <PiShoppingCartBold className="fs-4" />,
                      label: "Product List",
                    },
                    {
                      key: "addProduct",
                      icon: <PiShoppingCartBold className="fs-4" />,
                      label: "Add Product",
                    },
                    {
                      key: "orders",
                      icon: <PiShoppingCartBold className="fs-4" />,
                      label: "Orders",
                    },
                  ],
                },
                {
                  key: "termsAndConditions",
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
                  key: "stories",
                  icon: <MdManageAccounts className="fs-4" />,
                  label: "Admin Management",
                  children: [
                    {
                      key: "addStory",
                      icon: <MdOutlineManageAccounts className="fs-4" />,
                      label: "Admin's List",
                    },
                    {
                      key: "stories",
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
                        maxWidth: "300px"
                      }}
                    >
                      <div style={{display : "flex", justifyContent:"space-around", alignItems: "center" }}>
                     <p>Notifications</p>
                     <p style={{ color: "blue"}} >Mark All as Read</p>
                     </div>
                     <hr></hr>
                     <div style={{height:"250px" , overflow:"auto"}}>
                        
                     </div>
                     <button style={{color : "blue", display:"block", width:"100%" , backgroundColor:"white" , border:"none" }}>View All</button>

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
                          SUPER ADMIN NAME
                        </p>
                        <p className="mb-0">DESIGNATION</p>
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
                      <div class="dropdown-divider"></div>
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
