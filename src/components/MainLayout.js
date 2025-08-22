/** @format */

import React, { useState, useRef, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { AiOutlineDashboard } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { LuSettings } from "react-icons/lu";
import { FaRegCircleUser } from "react-icons/fa6";
import { FiActivity } from "react-icons/fi";
import { CiLogin } from "react-icons/ci";
import { Layout, theme, Menu } from "antd";
import { IoLayers } from "react-icons/io5";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaPhotoVideo } from "react-icons/fa";
import { LuLayers } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { FaUsersGear } from "react-icons/fa6";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { PiFlagBannerBold } from "react-icons/pi";
import { PiFilmReelFill } from "react-icons/pi";
import { MdManageAccounts } from "react-icons/md";
import { FaSpeakerDeck } from "react-icons/fa";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { RiProductHuntLine } from "react-icons/ri";
import { FiBox } from "react-icons/fi";
import { BsGraphUpArrow } from "react-icons/bs";
import { message } from "antd";
import Login from "../pages/Login/Login";
import {
	GetAdminProfile,
	GetPendingFormCount,
	GetPendingProductCount,
} from "../services/Api/Api";
import { TbBrandBooking } from "react-icons/tb";
import { MdOutlineCategory } from "react-icons/md";
import logo from "../assets/glamlink in black (1).png";
import { IoInformationCircle } from "react-icons/io5";
import { Badge } from "antd";
import "./MainLayout.scss";
const { Header, Sider, Content } = Layout;

const MainLayout = () => {
	const [idData, setIdData] = React.useState({});
	const [applicantCount, setApplicantCount] = useState(0);
	const getData = async () => {
		try {
			let result = await GetAdminProfile(localStorage.getItem("adminToken"));

			// Checking if result contains an error status and message
			if (result.status === 500) {
				const errorMessage = result.data?.message || result.message;
				if (errorMessage === "jwt expired") {
					navigate("/Login");
					message.error("Session Expired");
					return; // Prevent further execution
				}
			}

			// If no error, update the state with the data
			setIdData(result.data.data);
		} catch (e) {
			// Log the full error object for debugging
			console.log("Error: ", e);

			// Check if the error response status is 500 and the message is "jwt expired"
			if (e.response && e.response.status === 500) {
				const errorMessage = e.response.data?.message || e.response.message;
				if (errorMessage === "jwt expired") {
					message.error("Session Expired");
					navigate("/login");
				} else {
					console.log("Server error. Please try again later.");
				}
			} else {
				console.log("Error loading data. Please try again later.");
			}
		}
	};

	useEffect(() => {
		getData();
	}, []);

	useEffect(() => {
		async function fetchApplicantCount() {
			try {
				const res = await GetPendingFormCount();
				console.log(res.data.data, "ddsd");
				const count = parseInt(res.data.data, 10);
				setApplicantCount(isNaN(count) ? 0 : count);

				// setApplicantCount(parseInt(res.data.data.count, 10));
			} catch (err) {
				console.error("Failed to fetch applicant count:", err);
			}
		}

		fetchApplicantCount();
	}, []);

	const [pendingProductCount, setPendingProductCount] = useState(0);

	useEffect(() => {
		async function fetchPendingProductCount() {
			try {
				const res = await GetPendingProductCount();
				const count = parseInt(res.data?.data, 10);
				setPendingProductCount(isNaN(count) ? 0 : count);
			} catch (err) {
				console.error("Failed to fetch pending product count:", err);
			}
		}

		fetchPendingProductCount();
	}, []);

	const [collapsed, setCollapsed] = useState(false);
	const {
		token: { colorBgContainer },
	} = theme.useToken();
	const navigate = useNavigate();

	function logout() {
		localStorage.removeItem("adminToken");
		message.success(" Logged Out Successfully");
		setTimeout(() => {
			navigate("/login");
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
						<div className="logo ">
							{collapsed ? (
								<img src={logo} className="logo-image-1" alt="logo" />
							) : (
								<img src={logo} className="logo-image" alt="logo" />
							)}
						</div>
						{/* <div className="logo">
							<h2 className="text-white text-center py-3 mb-0 custom-logo-size">
								<span className="sm-logo">GL</span>
								<span className="lg-logo">
									<img
										src={logo}
										alt="Logo"
										style={{
											width: "120px",
											objectFit: "contain",
										}}
									/>
								</span>
							</h2>
						</div> */}

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
									key: "/users",
									icon: <FaUsers className="fs-4" />,
									label: "Users",
								},
								{
									key: "/professionals",
									icon: <FaUsersGear className="fs-4" />,
									label: "Professionals",
								},
								// {
								// 	key: "/promotion-request",
								// 	icon: <BsGraphUpArrow className="fs-4" />,
								// 	label: "Promotion Request",
								// },
								{
									key: "/form",
									icon: <IoInformationCircle className="fs-4" />,
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
									key: "/service-categories",
									icon: <BiSolidCategoryAlt className="fs-4" />,
									label: "Services",
								},
								{
									key: "/blogs",
									icon: <TbBrandBooking className="fs-4" />,
									label: "Blogs",
									children: [
										{
											key: "/blogs",
											icon: <TbBrandBooking className="fs-4" />,
											label: "Blogs",
										},
										{
											key: "/blogs-categories",
											icon: <TbBrandBooking className="fs-4" />,
											label: "Categories",
										},
									],
								},
								{
									key: "/specialities",
									icon: <FaSpeakerDeck className="fs-4" />,
									label: "Specialities",
								},
								{
									key: "/appointments",
									icon: <FaRegCalendarAlt className="fs-4" />,
									label: "Appointments",
								},
								{
									key: "/posts-list",
									icon: <FaPhotoVideo className="fs-4" />,
									label: "Posts",
								},
								{
									key: "/clips-list",
									icon: <PiFilmReelFill className="fs-4" />,
									label: "Clips",
								},
								{
									key: "/banner",
									icon: <PiFlagBannerBold className="fs-4" />,
									label: "Banner",
								},
								{
									key: "/faqs",
									icon: <LuLayers className="fs-4" />,
									label: "FAQs",
								},
								{
									key: "/product-category",
									icon: <AiOutlineShoppingCart className="fs-4" />,
									label: "Ecommerce",
									children: [
										{
											key: "/product-category",
											icon: <MdOutlineCategory className="fs-4" />,
											label: "Product Category",
										},
										{
											key: "/product-list",
											icon: <RiProductHuntLine className="fs-4" />,
											label: (
												<span>
													Product{" "}
													{pendingProductCount > 0 && (
														<Badge
															count={pendingProductCount}
															size="small"
															style={{
																backgroundColor: "#faad14",
																marginLeft: "10px",
															}}
														/>
													)}
												</span>
											),
										},

										{
											key: "/orders",
											icon: <FiBox className="fs-4" />,
											label: "Orders",
										},
									],
								},
								// {
								// 	key: "/t&c1",
								// 	icon: <IoLayers className="fs-4" />,
								// 	label: "Content",
								// 	children: [
								// 		{
								// 			key: "support",
								// 			icon: <LuLayers className="fs-4" />,
								// 			label: "Support",
								// 		},
								// 	],
								// },
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
								{/* <div className="position-relative clicked">
									<FiMail className="fs-3" onClick={handleMailClick} />
								</div> */}

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
													to="/reset-password"
												>
													<LuSettings style={{ marginRight: "10px" }} />
													Change Password
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
											{/* <li>
												<Link
													className="dropdown-item py-1 mb-1"
													style={{ height: "auto", lineHeight: "30px" }}
													to="/loginLogs"
												>
													<FiActivity style={{ marginRight: "10px" }} />
													Server Logs
												</Link>
											</li> */}
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
