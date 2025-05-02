/** @format */

import React, { useLayoutEffect, useState } from "react";
import { Box } from "@mui/material";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { message, Form, Input, Select, Upload, Button } from "antd";
import { CreateBlog, GetBlogCategoryName } from "../../services/Api/BlogsApi";
import {
	UploadOutlined,
	CheckOutlined,
	ArrowLeftOutlined,
} from "@ant-design/icons";
import { RxCross2 } from "react-icons/rx";

const { Option } = Select;

const AddBlog = () => {
	const [form] = Form.useForm();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [blogCategoryId, setBlogCategoryId] = useState("");
	const [blogData, setBlogData] = useState([]);
	const [disable, setDisable] = useState(false);
	const [fileList, setFileList] = useState([]);
	const navigate = useNavigate();

	useLayoutEffect(() => {
		GetBlogCategoryName()
			.then((res) => {
				setBlogData(res.data);
				console.log(res, "ddd");
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, []);

	const handleEditorChange = (event, editor) => {
		const data = editor.getData();
		setDescription(data);
	};

	const handleSubmit = async () => {
		try {
			await form.validateFields();
			setDisable(true);

			const formData = new FormData();
			formData.append("title", title);
			formData.append("description", description);

			// Instead of appending the blogCategoryId as a single string, loop through the array
			blogCategoryId.forEach((id) => {
				formData.append("blog_category_ids[]", id); // Append each category ID separately
			});

			if (fileList.length > 0) {
				// Get the first file from the fileList and append it to FormData
				const imageFile = fileList[0].originFileObj;
				formData.append("images", imageFile, imageFile.name);
			}

			const response = await CreateBlog(formData);

			if (response.status === 201) {
				message.success("Blog added successfully!");
				navigate("/blogs");
			}
		} catch (error) {
			if (error?.response?.status === 401) {
				message.error("Token expired");
				localStorage.removeItem("adminToken");
				setTimeout(() => {
					navigate("/Login");
				}, 1000);
			} else {
				message.error("Something went wrong");
			}
		} finally {
			setDisable(false);
		}
	};

	const navigateToService = () => {
		navigate("/blogs");
	};
	const onPreview = async (file) => {
		let src = file.url;
		if (!src) {
			src = await new Promise((resolve) => {
				const reader = new FileReader();
				reader.readAsDataURL(file.originFileObj);
				reader.onload = () => resolve(reader.result);
			});
		}
		const image = new Image();
		image.src = src;
		const imgWindow = window.open(src);
		imgWindow?.document.write(image.outerHTML);
	};

	const handleFileChange = ({ fileList }) => {
		setFileList(fileList);
	};

	return (
		<Box >
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="30px"
			>
				<div>
					<h3 className="page-title">Create BLOG</h3>
					<p className="page-sub-title">Add new Blog</p>
				</div>
				<div>
					<Button
						type="primary"
						icon={<ArrowLeftOutlined />}
						onClick={navigateToService}
						style={{ backgroundColor: "#64748B" }}
						size="large"
					>
						Return To Blogs
					</Button>
				</div>
			</Box>
			<Card style={{padding:"20px"}}>
				<Form layout="vertical" form={form} onFinish={handleSubmit}>
					<Form.Item
						label="Blog Title"
						name="title"
						rules={[{ required: true, message: "Please enter title" }]}
					>
						<Input
							placeholder="Enter Blog Title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</Form.Item>

					<Form.Item
						label="Blog Category"
						name="blogCategoryId"
						// rules={[
						// 	{ required: true, message: "Please select a blog category" },
						// ]}
					>
						<Select
							mode="multiple"
							placeholder="Select Blog Category"
							value={blogCategoryId}
							onChange={(value) => setBlogCategoryId(value)}
						>
							{blogData?.map((category) => (
								<Option key={category.id} value={category.id}>
									{category?.title}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item
						label="Image"
						name="images"
						rules={[{ required: true, message: "Please upload an image" }]}
					>
						<Upload
							fileList={fileList}
							beforeUpload={() => false}
							onChange={handleFileChange}
							multiple={false}
							listType="picture"
							onPreview={onPreview}
							maxCount={1}
						>
							<Button icon={<UploadOutlined />}>Upload Images</Button>
						</Upload>
					</Form.Item>

					<Form.Item
						label="Description"
						name="description"
						rules={[{ required: true, message: "Please enter Description" }]}
					>
						<CKEditor
							editor={ClassicEditor}
							onChange={handleEditorChange}
							config={{
								height: "50%",
							}}
						/>
					</Form.Item>

					<Button
						type="primary"
						icon={<CheckOutlined />}
						size="large"
						onClick={handleSubmit}
					>
						Save
					</Button>
					<Button
						type="primary"
						size="large"
						icon={<RxCross2 />}
						onClick={navigateToService}
						style={{ backgroundColor: "#64748B", marginLeft: "20px" }}
					>
						Cancel
					</Button>
				</Form>
			</Card>
		</Box>
	);
};

export default AddBlog;
