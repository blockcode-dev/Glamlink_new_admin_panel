/** @format */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GetUserById } from "../../services/Api/UserApi";
import { GetPage } from "../../services/Api/ProfilesApi";
import "./Professionals.css";
import { BASE_URL_IMAGE } from "../../services/Host";
import { Alert, Avatar, Button, Card, Col, Descriptions, Row, Skeleton, Space, Tag, Typography } from "antd";
import { ArrowLeftOutlined, GlobalOutlined, UserOutlined } from "@ant-design/icons";
import { useIdParam } from "../../utils/routing";
import { apiErrorStatus } from "../../utils/apiError";
import { websiteUrl } from "../../utils/website";
import AccountFields from "./AccountFields";
import type { UserDetail } from "../../types/user";
import type { PageView } from "../../types/profile";

const HIDDEN_BECAUSE: Record<string, string> = {
	no_live_card: "Hidden: no live Access card or approved directory listing",
	unlisted: "Hidden: unlisted by an admin",
};

const longDate = (date?: string) =>
	date
		? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
		: "Not Provided";

const ViewProfessionals = () => {
	const navigate = useNavigate();
	const id = useIdParam();
	const [userData, setUserData] = useState<Partial<UserDetail>>({});
	// The account's page on the website; null once we know it has none.
	const [page, setPage] = useState<PageView | null | undefined>(undefined);

	useEffect(() => {
		GetUserById(id)
			.then((res) => {
				setUserData(res.data.data);
			})
			.catch((err) => {
				console.error(err, "error");
			});
		GetPage(id)
			.then((res) => setPage(res.data.data))
			.catch((err) => {
				// 404: not a professional account any more (deleted or merged).
				if (apiErrorStatus(err) !== 404) console.error("Error loading the page:", err);
				setPage(null);
			});
	}, [id]);

	const photo = userData?.user_attachments?.[0]?.file_name;
	const publicPage = page?.public;

	return (
		<div>
			{/* Header Section */}
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "30px"
				}}>
				<div>
					<h3 className="page-title">Professional</h3>
					<p className="page-sub-title">
						The account, and how it shows on the website
					</p>
				</div>
				<Button
					onClick={() => navigate("/professionals")}
					style={{
					    borderRadius: "5px"
					}}
					icon={<ArrowLeftOutlined />}
					size="large"
				>
					<span style={{ marginLeft: "5px" }}>Return to Professionals</span>
				</Button>
			</div>

			<Row gutter={[16, 16]}>
				{/* Card 1: Personal Information */}
				<Col xs={24} md={8}>
					<Card style={{ padding: "10px", height: "100%" }}>
						<div
							style={{
							    textAlign: "center",
							    marginBottom: "20px"
							}}>
							<Avatar
								alt={userData?.user_profile?.name}
								src={photo ? (photo.startsWith("https:") ? photo : `${BASE_URL_IMAGE}${photo}`) : undefined}
								icon={<UserOutlined />}
								size={120}
								style={{
								    display: "block",
								    margin: "0 auto"
								}} />

							<Typography.Text
								style={{
								    display: "block",
								    margin: 0,
								    fontSize: 24,
								    fontWeight: "bold",
								    marginTop: "10px"
								}}>
								{userData?.user_profile?.name}
							</Typography.Text>
							{userData?.user_name && (
								<Typography.Text
									style={{
									    display: "block",
									    margin: 0,
									    fontSize: 16,
									    color: "var(--color-text-tertiary)"
									}}>
									@{userData.user_name}
								</Typography.Text>
							)}
							{/* A professional made without a profession has none. */}
							{userData?.user_profile?.profession && (
								<Typography.Text
									style={{
									    display: "block",
									    margin: 0,
									    fontSize: 14,
									    fontWeight: 500,
									    color: "var(--color-text-tertiary)",
									    marginTop: "5px"
									}}>
									Profession: {userData.user_profile.profession}
								</Typography.Text>
							)}
						</div>

						<div className="personal_informtaion_box">
							<UserOutlined style={{ fontSize: "25px", marginRight: "15px" }} />
							<h5 className="personal_informtaion">Personal Information</h5>
						</div>

						<div style={{
						    padding: "20px"
						}}>
							<h4 className="heading_pi">About me:</h4>
							<p style={{ marginBottom: "20px", fontSize: "13px" }}>
								{userData?.user_profile?.about || "Not Provided"}
							</p>

							<h4 className="heading_pi">Email:</h4>
							<p style={{ marginBottom: "20px", fontSize: "13px" }}>
								{userData?.email || "Not Provided"}
							</p>

							<AccountFields user={userData} />

							<h4 className="heading_pi">Address:</h4>
							<p style={{ marginBottom: "20px", fontSize: "13px" }}>
								{userData?.user_profile?.address || "Not Provided"}
							</p>

							<h4 className="heading_pi">Account Created On:</h4>
							<p style={{ marginBottom: "20px", fontSize: "13px" }}>
								{longDate(userData?.created_at || userData?.user_profile?.created_at)}
							</p>
						</div>
					</Card>
				</Col>

				{/* Card 2: On the website */}
				<Col xs={24} md={16}>
					<Card style={{ padding: "20px", height: "100%" }}>
						<div className="personal_informtaion_box">
							<GlobalOutlined style={{ fontSize: "25px", marginRight: "15px" }} />
							<h5 className="personal_informtaion">On the Website</h5>
						</div>

						{page === undefined ? (
							<Skeleton active />
						) : !page || !publicPage ? (
							<Alert type="info" showIcon title="This account has no page on the website." />
						) : (
							<>
								<Space wrap style={{ marginBottom: 16 }}>
									{page.visible ? (
										<Tag color="green">Page shown</Tag>
									) : (
										<Tag color="orange">{HIDDEN_BECAUSE[page.hidden_because ?? ""] ?? "Page hidden"}</Tag>
									)}
									{publicPage.type === "brand" && <Tag color="purple">Brand</Tag>}
									{page.page.is_featured && <Tag color="gold">Featured {page.page.featured_order}</Tag>}
									{page.page.created_by_admin && <Tag>Brand page made by an admin</Tag>}
								</Space>

								<Descriptions column={1} size="small" bordered>
									<Descriptions.Item label="Page">
										{page.visible && page.slug ? (
											<a href={websiteUrl(`/profiles/${page.slug}`)} target="_blank" rel="noopener noreferrer">
												{websiteUrl(`/profiles/${page.slug}`)}
											</a>
										) : page.slug ? (
											`/profiles/${page.slug} (not shown)`
										) : (
											"No address yet"
										)}
									</Descriptions.Item>
									<Descriptions.Item label="Access card">
										{publicPage.access_card ? (
											<a href={publicPage.access_card.url} target="_blank" rel="noopener noreferrer">
												{publicPage.access_card.url}
											</a>
										) : (
											"No live card"
										)}
									</Descriptions.Item>
									<Descriptions.Item label="Directory listing">
										{publicPage.listing ? "An approved directory listing" : "None"}
									</Descriptions.Item>
									{publicPage.tagline && (
										<Descriptions.Item label="Tagline">{publicPage.tagline}</Descriptions.Item>
									)}
									{(publicPage.city || publicPage.state) && (
										<Descriptions.Item label="Location">
											{[publicPage.city, publicPage.state].filter(Boolean).join(", ")}
										</Descriptions.Item>
									)}
									{publicPage.specialties.length > 0 && (
										<Descriptions.Item label="Specialties">
											{publicPage.specialties.map((s) => <Tag key={s}>{s}</Tag>)}
										</Descriptions.Item>
									)}
									{publicPage.topics.length > 0 && (
										<Descriptions.Item label="Journal topics">
											{publicPage.topics.map((t) => <Tag key={t.id}>{t.name}</Tag>)}
										</Descriptions.Item>
									)}
								</Descriptions>

								<Space style={{ marginTop: 16 }} wrap>
									<Button type="primary" onClick={() => navigate(`/pages/${id}`)}>
										Edit page
									</Button>
									<Button onClick={() => navigate(`/pages/${id}/analytics`)}>Page analytics</Button>
								</Space>
							</>
						)}
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default ViewProfessionals;
