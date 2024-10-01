import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { GetAdmins, DeleteAdmin } from "../../services/Api/Api";
import { Button } from "primereact/button";
import Alert from "../Customer/Alert";
import { message } from "antd";

const AdminUser = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(50);
  const [dataGridHeight, setDataGridHeight] = useState("550px");
  const [roleData, setRoleData] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState();
  const [userId, setUserId] = useState();
  const [userIdToNavigate, setUserIdToNavigate] = useState();
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClick = (event, value) => {
    setUserIdToNavigate(value);
    setAnchorEl(event.currentTarget);
  };

  //get all specialist
  const getData = async () => {
    try {
      setLoading(true);
      let result = await GetAdmins(localStorage.getItem("adminToken"));
      setRoleData(result.data.data);
      console.log("admins", result.data.data);
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
  useEffect(() => {
    getData();
  }, []);

  const navigateToAddAdmin = () => {
    navigate("/addAdmin");
  };
  const navigateToEditAdmin = (event, id) => {
    navigate(`/editAdmin/${id}`);
  };

  const removeUser = (user_id) => {
    setIsModalVisible(false);
    DeleteAdmin(user_id, localStorage.getItem("adminToken"))
      .then((res) => {
        console.log(res, "res");
        message.success(res?.data?.message);
        getData();
      })

      .catch((error) => {
        console.log(error, "error");
      });
  };

  const columns = [
    { field: "id", headerName: "ID", width: 150 },
    {
      field: "name",
      headerName: "Name",
      width: 350,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      width: 350,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
    },
    {
      field: "role",
      headerName: "Role",
      width: 350,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
      valueGetter: (params) => params.row.admin_role?.name || "",
    },

    {
      field: "action",
      headerName: "Actions",
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      width: "350",
      flex: 1,
      renderCell: (cellValues) => {
        return (
          <div>
            <Button
              icon="pi pi-pencil"
              rounded
              outlined
              className="mr-2"
              style={{ marginRight: "10px", borderRadius: "25px"  }}
              onClick={(event) => navigateToEditAdmin(event, cellValues.id)}
            />
           <Alert
              title="Admin"
              handleDelete={() => removeUser(cellValues.id)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      {loading ? (
        <p style={{ fontSize: "16px" }}>Loading...</p>
      ) : (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
          <div>
          <h3 className="page-title">Admin List</h3>
            <p className="page-sub-title">View, Edit, Delete and Create Admin</p>
          </div>
            <Box>
            <Button
                label=" Add New Admin"
                icon="pi pi-plus"
                severity="info"
                style={{ margin: "0px 10px", borderRadius: "5px" }}
                onClick={navigateToAddAdmin}
              />
            </Box>
          </Box>
          <div
            style={{
              height: dataGridHeight,
              width: "100%",
              // marginLeft: "10%",
              marginTop: "20px",
            }}
          >
            <DataGrid
              rows={roleData}
              columns={columns}
              pageSize={pageSize}
              rowHeight={80}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[50, 75, 100]}
              experimentalFeatures={{ newEditingApi: true }}
              onSelectionModelChange={(id) => {
                const selectedIDs = new Set([id]);
                const selectedRowData = roleData.filter((row) =>
                  selectedIDs.has(row.id.toString())
                );
                setUserId(selectedIDs);
              }}
            />
          </div>
        </>
      )}
    </Box>
  );
};

export default AdminUser;
