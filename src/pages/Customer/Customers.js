import { Box, Tab, Tabs } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { GetUsers, DeleteUser } from "../../services/Api/Api";
import { toast } from "react-toastify";
import { InputText } from "primereact/inputtext";
import "./Customers.css";
import PersonPinIcon from "@mui/icons-material/PersonPin";

const Customers = () => {
  const [pageSize, setPageSize] = useState(50);
  const [dataGridHeight, setDataGridHeight] = useState("550px");
  const [userData, setUserData] = useState([]);
  const [driverData, setDriverData] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState();
  const [userId, setUserId] = useState();
  const [userIdToNavigate, setUserIdToNavigate] = useState();
  const [globalFilter, setGlobalFilter] = useState(null);
  const [menteeDataBackup, setMenteeDataBackup] = useState([]);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClick = (event, value) => {
    setUserIdToNavigate(value);
    setAnchorEl(event.currentTarget);
  };

  //get all user
  const getData = async () => {
    try {
      // Fetch user data from your API with role_id 6 for customers
      let result = await GetUsers(localStorage.getItem("adminToken"), 6);
      setUserData(result.data.data);
      console.log("user", result.data.data);
      setMenteeDataBackup(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  const getDriverData = async () => {
    try {
      // Fetch driver data from your API with role_id 7 for drivers
      let result = await GetUsers(localStorage.getItem("adminToken"), 7);
      setDriverData(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (tabValue === 0) {
      getData();
    } else if (tabValue === 1) {
      getDriverData();
    }
  }, [tabValue]);

  //Code to get dynamic height
  useEffect(() => {
    // Update dataGridHeight based on the pageSize value
    if (pageSize === 50) {
      setDataGridHeight("550px");
    } else if (pageSize === 75) {
      setDataGridHeight("700px");
    } else if (pageSize === 100) {
      setDataGridHeight("850px");
    } else {
      // Set a default height if pageSize is not 10 or 15
      setDataGridHeight("550px");
    }
  }, [pageSize]);

  const removeUser = async (e, user_id) => {
    const confirmed = window.confirm("Do you really want to delete this user?");
    if (!confirmed) return;

    try {
      const result = await DeleteUser(
        user_id,
        localStorage.getItem("adminToken")
      );
      toast.success("User deleted successfully!", {
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
        navigate("/customers");
      }, 3000);
    } catch (error) {
      if (error.response.status == 401) {
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

  const navigateToAddUser = () => {
    navigate("/addCustomer");
  };

  const navigateToViewUser = (event, id) => {
    navigate(`/viewCustomer/${id}`);
  };

  const onSearch = (e) => {
    const backupData = [...menteeDataBackup];
    const finalData = [];
    for (let item in backupData) {
      if (
        // backupData[item].email_id?.includes(search) ||
        backupData[item].name?.toLowerCase()?.includes(e?.toLowerCase()) ||
        backupData[item].id
          .toString()
          ?.toLowerCase()
          ?.includes(e?.toLowerCase())
      ) {
        finalData.push(backupData[item]);
      }
    }
    setUserData(finalData);
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 100,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
    },
    {
      field: "name",
      headerName: "Name",
      width: 150,
      flex: 1,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      valueGetter: (params) => params.row.user_profile?.name || "",
    },
    {
      field: "email",
      headerName: "Email",
      width: 450,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
    },

    {
      field: "action",
      headerName: "Actions",
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      width: "250",
      flex: 1,
      sortable: false,

      renderCell: (cellValues) => {
        return (
          <div>
            <Button
              icon="pi pi-file"
              rounded
              outlined
              className="mr-2"
              style={{ margin: "0px ", borderRadius: "25px" }}
              onClick={(event) => navigateToViewUser(event, cellValues.id)}
            />
            <Button
              icon="pi pi-trash"
              rounded
              outlined
              severity="danger"
              style={{ margin: "0px 10px", borderRadius: "25px" }}
              onClick={(e) => removeUser(e, cellValues.id)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop="20px"
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          style={{ marginBottom: "10px" }}
        >
          <Tab
            icon={<PersonPinIcon />}
            iconPosition="start"
            label="Customers"
          />
          <Tab icon={<PersonPinIcon />} iconPosition="end" label="Drivers" />
        </Tabs>
        {/* <h3> Manage {tabValue === 0 ? "Customers" : "Drivers"}</h3> */}
        <Box>
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              type="search"
              // onInput={(e) => setGlobalFilter(e.target.value)}
              onChange={(e) => {
                onSearch(e.target.value);
              }}
              placeholder="Search..."
            />
          </span>
          <Button
            label=" Add New User"
            icon="pi pi-plus"
            severity="info"
            style={{ margin: "0px 10px", borderRadius: "5px" }}
            onClick={navigateToAddUser}
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
          rows={tabValue === 0 ? userData : driverData} // Use userData for Customers, driverData for Drivers
          columns={columns}
          pageSize={pageSize}
          rowHeight={80}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[50, 75, 100]}
          experimentalFeatures={{ newEditingApi: true }}
          onSelectionModelChange={(id) => {
            const selectedIDs = new Set([id]);
            const selectedRowData = userData.filter((row) =>
              selectedIDs.has(row.id.toString())
            );
            setUserId(selectedIDs);
          }}
        />
      </div>
    </Box>
  );
};

export default Customers;
