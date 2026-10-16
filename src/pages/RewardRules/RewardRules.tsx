/** @format */
import React, { useEffect, useState } from "react";
import {
    Space,
	Table,
	Modal,
	Form,
	Input,
	InputNumber,
	message,
	Button,
	type TableColumnsType,
} from "antd";
import { useNavigate } from "react-router";
import { GetAllRewardRules, UpdateGlamCoinRules } from "../../services/Api/UserApi";
import { EditOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../utils/table";
import type { RewardRule } from "../../types/user";

const RewardRules = () => {
	const navigate = useNavigate();
	const [data, setData] = useState<WithIndex<RewardRule>[]>([]);
	const [loading, setLoading] = useState(false);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingRule, setEditingRule] = useState<RewardRule | null>(null);
	const [form] = Form.useForm<Pick<RewardRule, "title" | "coins">>();

	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 20,
		},
		sortField: null,
		sortOrder: null,
	});

	// Fetch Reward Rules
	const getData = async () => {
		try {
			setLoading(true);
			let result = await GetAllRewardRules();
			const newData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1,
			}));
			setData(newData);
		} catch (e) {
			console.error(e);
			if (apiErrorStatus(e) === 403) {
				navigate("/error401");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
	}, []);

	const handleTableChange: TableChangeHandler<WithIndex<RewardRule>> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
			filters,
			sortField: field,
			sortOrder: order,
		});
	};

	// Open modal for editing
	const handleEdit = (record: RewardRule) => {
		setEditingRule(record);
		form.setFieldsValue({
			title: record.title,
			coins: record.coins,
		});
		setIsModalOpen(true);
	};

	// Save changes
	const handleSave = async () => {
		// The modal that calls this only opens through handleEdit.
		if (!editingRule) return;
		try {
			const values = await form.validateFields();
			await UpdateGlamCoinRules(values, editingRule.id); // call your API
			message.success("Reward rule updated successfully!");
			setIsModalOpen(false);
			getData(); // refresh table
		} catch (err) {
			console.error(err);
			message.error("Failed to update reward rule.");
		}
	};

	const columns: TableColumnsType<WithIndex<RewardRule>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			width: "10%",
		},
		{
			title: "Title",
			dataIndex: "title",
			width: "30%",
		},
		{
			title: "Coin",
			dataIndex: "coins",
			width: "20%",
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (_, record) => (
				<Space size="middle">
					<Button
						style={{ borderRadius: "25px" }}
						onClick={() => handleEdit(record)}
						icon={<EditOutlined />}
						shape="circle" />
				</Space>
			),
		},
	];

	return (
		<div>
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "20px"
				}}>
				<div>
					<h3 className="page-title">Glam Rewards Rules</h3>
					<p className="page-sub-title">
						Manage how users earn Glam Coins.
					</p>
				</div>
			</div>

			<Table
				columns={columns}
				rowKey={(record) => record.id}
				dataSource={data}
				pagination={tableParams.pagination}
				loading={loading}
				onChange={handleTableChange}
				scroll={{ x: 900 }}
			/>

			{/* Edit Modal */}
			<Modal
				title="Edit Reward Rule"
				open={isModalOpen}
				onOk={handleSave}
				onCancel={() => setIsModalOpen(false)}
				okText="Save"
				cancelText="Cancel"
			>
				<Form form={form} layout="vertical">
					<Form.Item
						name="title"
						label="Title"
						rules={[{ required: true, message: "Please enter title" }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						name="coins"
						label="Coins"
						rules={[{ required: true, message: "Please enter coin value" }]}
					>
						<InputNumber min={1} style={{ width: "100%" }} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default RewardRules;
