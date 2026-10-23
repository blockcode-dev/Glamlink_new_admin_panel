/** @format */

import React, { useEffect, useState } from "react";
import { Table, type TableColumnsType } from "antd";
import { GetAllBanner } from "../../services/Api/Banner";
import dayjs from "dayjs";
import { type WithIndex } from "../../utils/table";
import type { Banner } from "../../types/content";

const Banner = () => {
	const [locationData, setLocationData] = useState<WithIndex<Banner>[]>([]);
	const [loading, setLoading] = useState(false);

	// Fetch all locations
	const getData = async () => {
		try {
			setLoading(true);
			let result = await GetAllBanner();
			const formattedData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1,
			}));
			setLocationData(formattedData);
		} catch (e) {
			console.error("Error loading banners:", e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
	}, []);

	const columns: TableColumnsType<WithIndex<Banner>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			width: "10%",
			sorter: (a, b) => a.index - b.index,
		},
		{
			title: "Media",
			dataIndex: "file_name",
			key: "media",
			width: "40%",
			render: (text, record) => {
				if (record.file_type === "Image") {
					return (
						<img
							src={record.file_name}
							alt="Banner"
							style={{ width: "100px", height: "auto", borderRadius: "8px" }}
						/>
					);
				} else if (record.file_type === "Video") {
					return (
						<video
							controls
							width="160"
							height="90"
							style={{ borderRadius: "8px" }}
						>
							<source src={record.file_name} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					);
				}
				return "Unsupported media";
			},
		},
		{
			title: "Uploaded By",
			dataIndex: ["banner_user", "user_profile", "name"],
			sorter: (a, b) => a.banner_user.user_profile.name.localeCompare(b.banner_user.user_profile.name),
			width: "20%",
		},
		{
			title: "Uploaded On",
			dataIndex: "created_at",
			width: "30%",
			render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
		},

	];

	return (
		<div>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					marginBottom: "40px",
				}}
			>
				<div>
					<h3 className="page-title">BANNER CONTENT</h3>
					<p className="page-sub-title">View Banner Content</p>
				</div>
			</div>
			<Table
				columns={columns}
				dataSource={locationData}
				rowKey="id"
				loading={loading}
			/>
		</div>
	);
};

export default Banner;
