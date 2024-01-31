import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";

import { useNavigate } from "react-router-dom";
import { GetAdmins, DeleteAdmin } from "../../services/Api/Api";
import { toast } from "react-toastify";
import { Button } from "primereact/button";

const AdminUser = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(50);
  const [dataGridHeight, setDataGridHeight] = useState("550px");
  const [roleData, setRoleData] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState();
  const [userId, setUserId] = useState();
  const [userIdToNavigate, setUserIdToNavigate] = useState();

  const handleClick = (event, value) => {
    setUserIdToNavigate(value);
    setAnchorEl(event.currentTarget);
  };

  //get all specialist
  const getData = async () => {
    try {
      let result = await GetAdmins(localStorage.getItem("adminToken"));
      setRoleData(result.data.data);
      console.log("admins",result.data.data);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getData();
  }, []);


  //delete role
  const removeAdmin = async (e, admin_id) => {
    const confirmed = window.confirm(
      "Do you really want to delete this admin?"
    );
    if (!confirmed) return;

    try {
      const result = await DeleteAdmin(
        admin_id,
        localStorage.getItem("adminToken")
      );

      toast.success("Role deleted successfully!", {
        position: "top-right",
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      window.location.reload(true);
      setTimeout(() => {
        navigate("/adminList");
      }, 3000);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Token expired", {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
      localStorage.removeItem("adminToken");
      setTimeout(() => {
        navigate("/Login");
      }, 3000);
    }
  };

  const navigateToAddAdmin = () => {
    navigate("/addAdmin");
  };
  const navigateToEditAdmin = (event, id) => {
    navigate(`/editAdmin/${id}`);
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
              style={{ margin: "0px 10px" }}
              onClick={(event) => navigateToEditAdmin(event, cellValues.id)}
            />
            <Button
              icon="pi pi-trash"
              rounded
              outlined
              severity="danger"
              onClick={(e) => removeAdmin(e, cellValues.id)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3>Admin List</h3>
        <Box>
          <Button
            label=" Add New Admin"
            icon="pi pi-plus"
            severity="success"
            onClick={navigateToAddAdmin}
            style={{ margin: "0px 10px" }}
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
    </Box>
  );
};

export default AdminUser;
