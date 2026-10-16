import React from "react";
import { ExclamationCircleFilled, DeleteOutlined } from "@ant-design/icons";
import { Modal, Space, Button } from "antd";
const { confirm } = Modal;
interface AlertProps {
  handleDelete: () => void;
  title: string;
}

const Alert = ({ handleDelete, title }: AlertProps) => {
  const showDeleteConfirm = () => {
    confirm({
      title: `Are you sure you want to delete this ${title}?`,
      icon: <ExclamationCircleFilled />,
      content: "",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",

      onOk() {
        handleDelete(); // Call the handleDelete function provided via props
      },
      onCancel() {
      },
    });
  };
  return (
    <Space wrap>
      <Button
        style={{  borderRadius: "25px" }}
        onClick={showDeleteConfirm}
        icon={<DeleteOutlined />}
        danger
        shape="circle"></Button>
    </Space>
  );
};
export default Alert;
