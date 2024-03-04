import { Box, Tab, Tabs } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { GetUsers, DeleteUser } from "../../services/Api/Api";
import { InputText } from "primereact/inputtext";
import "./Customers.css";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import { message } from "antd";
import Alert from "./Alert";
import { CoPresentOutlined } from "@mui/icons-material";

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [combinedData, setCombinedData] = useState([]);

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
      setLoading(true);
      let result = await GetUsers(localStorage.getItem("adminToken"), 6);
      setUserData(result.data.data);
      console.log("user", result.data.data);
      setMenteeDataBackup(result.data.data);
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

  const getDriverData = async () => {
    try {
      // Fetch driver data from your API with role_id 7 for drivers
      let result = await GetUsers(localStorage.getItem("adminToken"), 7);
      setDriverData(result.data.data);
      setMenteeDataBackup(result.data.data);
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

  const removeUser = (user_id) => {
    setIsModalVisible(false);
    DeleteUser(user_id, localStorage.getItem("adminToken"))
      .then((res) => {
        console.log(res, "res");
        message.success(res?.data?.message);
        getData();
        getDriverData();
      })

      .catch((error) => {
        console.log(error, "error");
      });
  };

  const navigateToAddUser = () => {
    navigate("/addCustomer");
  };

  const navigateToViewUser = (event, id) => {
    navigate(`/viewCustomer/${id}`);
  };

  const onSearch = (e) => {
    const backupData = [...menteeDataBackup];
    const finalData = backupData.filter((item) => {
      const lowerCaseName = item.name?.toLowerCase() || "";
      const lowerCaseId = item.id?.toString().toLowerCase() || "";
      const lowerCaseEmail = item.email?.toLowerCase() || "";

      return (
        lowerCaseName.includes(e.toLowerCase()) ||
        lowerCaseId.includes(e.toLowerCase()) ||
        lowerCaseEmail.includes(e.toLowerCase())
      );
    });

    setUserData(finalData.filter((item) => item.role_id === 6)); // Filter customers
    setDriverData(finalData.filter((item) => item.role_id === 7)); // Filter drivers
  };

  useEffect(() => {
    setCombinedData([...userData, ...driverData]);
  }, [userData, driverData]);

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
            <Alert
              title="User"
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
              <Tab
                icon={<PersonPinIcon />}
                iconPosition="end"
                label="Drivers"
              />
            </Tabs>

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
        </>
      )}
    </Box>
  );
};

export default Customers;
