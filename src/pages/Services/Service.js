import React, { useEffect, useState } from "react";
import { Table, Space, message } from "antd";
import { DeleteService, GetServices } from "../../services/Api/ServiceApi";
import { useNavigate } from "react-router";
import { Box } from "@material-ui/core";
import { InputText } from "primereact/inputtext";
import Alert from "../Customer/Alert";

const Service = () => {
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState([]);
  const [serviceBackupData, setServiceBackupData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 100,
    },
    sortField: null,
    sortOrder: null,
  });

  const columns = [
    {
      title: "S.No.",
      dataIndex: "index",
      sorter: (a, b) => a.index - b.index,
    },
    {
      title: "Name",
      dataIndex: "name",
      width: "20%",
    },
    {
      title: "Price",
      dataIndex: "price",
      width: "20%",
    },
    {
      title: "Published Date",
      dataIndex: "created_at",
      width: "20%",
      render: (text) => text.split("T")[0],
    },
    {
      title: "Published By",
      dataIndex: ["created_by", "user_profile", "name"],
      key: "name",
      width: "20%",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_, record) => (
        <Space size="middle">
          <Alert title="Service" handleDelete={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  const getData = async (params = {}) => {
    try {
      setLoading(true);
      const { pagination, sortField, sortOrder } = params;
      const result = await GetServices(localStorage.getItem("adminToken"), {
        page: pagination.current,
        pageSize: pagination.pageSize,
        sortBy: sortField,
      });

      // Adding index for serial number
      const newData = result.data.rows.map((item, index) => ({
        ...item,
        index: index + 1 + (pagination.current - 1) * pagination.pageSize,
      }));
      
      setServiceData(newData);
      setServiceBackupData(newData);
      setTableParams({
        ...tableParams,
        pagination: {
          ...pagination,
          total: result.count,
        },
      });
    } catch (e) {
      console.log(e);
      if (e.response && e.response.status === 401) {
        navigate("/error401");
        console.log("You do not have access to this page as a sub-admin.");
      } else {
        console.log("Error loading data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      sortField: sorter.field,
      sortOrder: sorter.order,
    });
  };

  const onSearch = (searchField) => {
    const LIST = [...serviceBackupData];
    const searchList = LIST.filter((item) =>
      item.name.toLowerCase().includes(searchField.toLowerCase()) ||
      item.created_by.user_profile.name.toLowerCase().includes(searchField.toLowerCase())
    );
    setServiceData(searchList);
  };

  const handleDelete = (id) => {
    DeleteService(id)
      .then((res) => {
        message.success(res?.data?.message);
        getData({
          pagination: tableParams.pagination,
          sortField: tableParams.sortField,
          sortOrder: tableParams.sortOrder,
        });
      })
      .catch((error) => {
        console.log(error, "error");
      });
  };

  useEffect(() => {
    getData({
      pagination: tableParams.pagination,
      sortField: tableParams.sortField,
      sortOrder: tableParams.sortOrder,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom="20px"
      >
        <div>
          <h3 className="page-title">Services</h3>{" "}
          <p className="page-sub-title">View Service Details</p>
        </div>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                type="search"
                onChange={(e) => {
                  onSearch(e.target.value);
                }}
                placeholder="Search..."
              />
            </span>
          </Box>
        </Box>
      </Box>
      <Table
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={serviceData}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </Box>
  );
};

export default Service;
