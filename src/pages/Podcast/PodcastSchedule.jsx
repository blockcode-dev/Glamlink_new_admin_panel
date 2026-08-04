// src/pages/PodcastSchedule/index.js

/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Button, Input, Modal, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { DeletePodcastSchedule, GetAllPodcastSchedule } from "../../services/Api/PodcastScheduleApi";


const { Search } = Input;

const PodcastSchedule = () => {
	const [data, setData] = useState([]);
	const [backupData, setBackupData] = useState([]);
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

	const columns = [
		{
			title: "S.No.",
			dataIndex: "index",
			width: "8%",
		},
		{
			title: "Guest Name",
			dataIndex: "name",
			width: "25%",
		},
		{
			title: "Description",
			dataIndex: "short_description",
			width: "35%",
			render: (text) =>
				text?.length > 80 ? text.substring(0, 80) + "..." : text,
		},
		{
			title: "Schedule Date",
			dataIndex: "schedule_date",
			width: "20%",
			render: (date) => {
				const isPast = moment(date).isBefore(moment(), "day");

				return (
					<Space direction="vertical" size={0}>
					<span>{moment(date).format("MM/DD/YYYY")}</span>

						<Tag color={isPast ? "red" : "green"}>
							{isPast ? "Past" : "Upcoming"}
						</Tag>
					</Space>
				);
			},
		},
		{
			title: "Action",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						onClick={() =>
							navigate(`/edit-podcast-schedule/${record.id}`)
						}
					>
						Edit
					</Button>

					<Button
						type="link"
						danger
						onClick={() => handleDelete(record.id)}
					>
						Delete
					</Button>
				</Space>
			),
		},
	];

	const getData = async () => {
		try {
			setLoading(true);

			const result = await GetAllPodcastSchedule(
				localStorage.getItem("adminToken"),
			);

			const newData = result?.data?.data?.map((item, index) => ({
				...item,
				index: index + 1,
			}));

			setData(newData);
			setBackupData(newData);
		} catch (err) {
			message.error("Failed to load podcast schedules");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
	}, []);

	const onSearch = (value) => {
		const filtered = backupData.filter((item) =>
			item.name.toLowerCase().includes(value.toLowerCase()),
		);

		setData(filtered);
	};

	const handleDelete = (id) => {
		Modal.confirm({
			title: "Delete Schedule",
			content: "Are you sure you want to delete this schedule?",

			onOk: async () => {
				try {
					await DeletePodcastSchedule([id]);

					message.success("Schedule deleted successfully");

					getData();
				} catch (err) {
					message.error("Failed to delete schedule");
				}
			},
		});
	};

	return (
		<Box>
			<Box display="flex" justifyContent="space-between" marginBottom="20px">
				<div>
					<h3>PODCAST SCHEDULES</h3>
					<p>Manage all podcast schedules</p>
				</div>

				<Space>
					<Search
						placeholder="Search guest..."
						allowClear
						onChange={(e) => onSearch(e.target.value)}
						style={{ width: 250 }}
					/>

					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={() => navigate("/add-podcast-schedule")}
					>
						Add Schedule
					</Button>
				</Space>
			</Box>

			<Table
				columns={columns}
				dataSource={data}
				rowKey="id"
				loading={loading}
			/>
		</Box>
	);
};

export default PodcastSchedule;