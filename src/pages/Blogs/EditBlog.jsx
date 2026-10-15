/** @format */

import React, {
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card, Form, Input, Select, Button, message } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
	GetBlogById,
	GetBlogCategoryName,
	UpdateBlog,
} from "../../services/Api/BlogsApi";
import { BASE_URL_IMAGE } from "../../services/Host";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";

const { Option } = Select;

const EditBlog = () => {
	const { id } = useParams();
	const [form] = Form.useForm();
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState({
		title: "",
		description: "",
		blog_category_ids: [],
		blog_attachments: [],
	});
	const [blogData, setBlogData] = useState([]);
	const [selectedImage, setSelectedImage] = useState(null);

	const fileInputRef = useRef(null);
	useLayoutEffect(() => {
		GetBlogById(id)
			.then((res) => {
				setServiceData(res.data.data);
				form.setFieldsValue({
					title: res.data.data.title,
					blog_category_ids: res.data.data.blog_categories.map((cat) => cat.id),
				});
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, [id]);

	useLayoutEffect(() => {
		GetBlogCategoryName()
			.then((res) => {
				setBlogData(res.data);
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, []);

	const handleSubmit = () => {
		const formData = new FormData();
		formData.append("title", serviceData?.title || "");
		formData.append("description", serviceData?.description || "");

		serviceData.blog_category_ids.forEach((id) => {
			formData.append("blog_category_ids[]", id);
		});

		formData.append("images", selectedImage || "");

		UpdateBlog(id, formData)
			.then((res) => {
				if (res.status === 200) {
					message.success("Blog edited successfully!");
					navigate("/blogs");
				}
			})
			.catch((err) => {
				if (err.response && err.response.status === 401) {
					message.error("Token expired!");
					localStorage.removeItem("adminToken");
					setTimeout(() => {
						navigate("/login");
					}, 3000);
				} else {
					message.error("Something went wrong");
				}
			});
	};

	const handleProfilePhotoClick = useCallback(() => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	}, []);

	const handleFileChange = useCallback((event) => {
		const file = event.target.files[0];
		if (file) {
			const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
			if (!allowedTypes.includes(file.type)) {
				message.error("Only Images(.jpeg, .jpg, .png) are allowed!");
				return;
			}
			setSelectedImage(file);
		}
	}, []);

	const profileImageUrl = useMemo(() => {
		if (selectedImage) {
			return URL.createObjectURL(selectedImage);
		} else if (serviceData?.blog_attachments?.length === 0) {
			return "https://cdn.icon-icons.com/icons2/1378/PNG/512/avatardefault_92824.png";
		} else if (
			serviceData?.blog_attachments[0]?.file_name.startsWith("https:")
		) {
			return serviceData?.blog_attachments[0]?.file_name;
		} else {
			return `${BASE_URL_IMAGE}${serviceData?.blog_attachments[0]?.file_name}`;
		}
	}, [selectedImage, serviceData]);

	const handleEditorChange = (event, editor) => {
		const data = editor.getData();
		setServiceData((prevData) => ({
			...prevData,
			description: data,
		}));
	};

	const navigateToService = () => {
		navigate("/blogs");
	};

	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="30px"
			>
				<div>
					<h3 className="page-title">Update Blog</h3>
					<p className="page-sub-title">Edit Details of Blog</p>
				</div>
				<Button
					type="primary"
					icon={<ArrowLeftOutlined />}
					onClick={navigateToService}
					style={{ backgroundColor: "#64748B" }}
					size="large"
				>
					Return To Blogs
				</Button>
			</Box>
			<Card style={{ width: "100%" }}>
				<Form form={form} layout="vertical" onFinish={handleSubmit}>
					<Form.Item label="Blog Title:" name="title">
						<Input
							value={serviceData?.title}
							onChange={(e) =>
								setServiceData({ ...serviceData, title: e.target.value })
							}
						/>
					</Form.Item>

					<Form.Item label="Blog Category:" name="blog_category_ids">
						<Select
							mode="multiple"
							placeholder="Select Blog Category"
							value={serviceData?.blog_category_ids}
							onChange={(value) =>
								setServiceData({ ...serviceData, blog_category_ids: value })
							}
						>
							{blogData.map((category) => (
								<Option key={category.id} value={category.id}>
									{category.title}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item label="Blog Images:">
						<div className="profile">
							<div>
								<Button
									icon={<PlusOutlined />}
									className="changePhoto"
									onClick={handleProfilePhotoClick}
								>
									Select File
								</Button>
								<input
									type="file"
									ref={fileInputRef}
									style={{ display: "none" }}
									onChange={handleFileChange}
								/>
							</div>
							<div style={{
										marginTop: "20px",
										border: "1px solid #d9d9d9",
										padding: "8px ",
										borderRadius: "8px",
										height:"76px"
									}}>
								<img
									src={profileImageUrl}
									width={100}
									height={100}
									alt="Profile"
									className="Profile_top_images"
									style={{width:"56px",height:"56px"}}
									
								/>
							</div>
						</div>
					</Form.Item>

					<Form.Item label="Description:" name="description">
						<CKEditor
							editor={ClassicEditor}
							data={serviceData.description}
							onChange={handleEditorChange}
						/>
					</Form.Item>

					<Button type="primary" htmlType="submit" >
						Save
					</Button>
					<Button
						style={{ marginLeft: "10px" }}
						onClick={() => navigate("/blogs")}
					>
						Cancel
					</Button>
				</Form>
			</Card>
		</Box>
	);
};

export default EditBlog;
