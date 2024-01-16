import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { GetLoginLogs } from "../../../services/Api/Api";
import { InputText } from "primereact/inputtext";
import moment from "moment";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const LoginLogs = () => {
  const [pageSize, setPageSize] = useState(50);
  const [dataGridHeight, setDataGridHeight] = useState("550px");
  const [userData, setUserData] = useState([]);
  const [menteeDataBackup, setMenteeDataBackup] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState();
  const [userId, setUserId] = useState();
  const [userIdToNavigate, setUserIdToNavigate] = useState();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleClick = (event, value) => {
    setUserIdToNavigate(value);
    setAnchorEl(event.currentTarget);
  };

  //get all user
  const getData = async () => {
    try {
      let result = await GetLoginLogs({
        month: selectedMonth,
        year: selectedYear,
      });
      const loginCountData = result?.data?.data;

      setUserData(loginCountData || []);
      setMenteeDataBackup(result?.data?.data)
      console.log("loginCountData", loginCountData);
    } catch (e) {
      console.log(e);
      setUserData([]);
    }
  };

  useEffect(() => {
    getData();
  }, [selectedMonth, selectedYear]);

  const onSearch = (e) => {
    const backupData = [...menteeDataBackup];
    const finalData = [];
    for (let item in backupData) {
      if (
        // backupData[item].email_id?.includes(search) ||
        backupData[item].userName?.toLowerCase()?.includes(e?.toLowerCase()) ||
        backupData[item].userEmail?.toLowerCase()?.includes(e?.toLowerCase()) ||
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
      width: 150,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
    },
    {
      field: "userName",
      headerName: " User's Name",
      width: 150,
      flex: 1,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
    },
    {
      field: "userEmail",
      headerName: "Email Address",
      width: 150,
      flex: 1,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
    },
    {
      field: "logincount",
      headerName: "Login Count",
      width: 150,
      flex: 1,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
    },

    // {
    //   field: "created_at",
    //   headerName: "Login Timing",
    //   width: 450,
    //   headerClassName: "custom-header",
    //   cellClassName: "custom-cell",
    //   flex: 1,
    //   valueFormatter: (params) =>
    //     moment(params?.value).format("DD/MM/YYYY hh:mm A"),
    // },
    // {
    //     field: "updated_at",
    //     headerName: "Logout Timing",
    //     width: 450,
    //     headerClassName: "custom-header",
    //     cellClassName: "custom-cell",
    //     flex: 1,
    //     valueFormatter: params =>
    //     moment(params?.value).format("DD/MM/YYYY hh:mm A"),
    //   },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {/* <Header title="USER MANAGEMENT" subtitle="Create Category" /> */}
        <h3> User Login Activity:</h3>
        <Box>
          <span className="p-input-icon-left" style={{ marginRight: "20px" }}>
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

          <FormControl>
            <InputLabel style={{ marginTop: "-10px" }}>Month</InputLabel>
            <Select value={selectedMonth} onChange={handleMonthChange}>
              {/* Populate dropdown with month numbers */}
              {Array.from({ length: 12 }, (_, index) => (
                <MenuItem key={index + 1} value={index + 1}>
                  {MONTHS[index]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl style={{ marginLeft: "20px" }}>
            <InputLabel style={{ marginTop: "-10px" }}>Year</InputLabel>
            <Select value={selectedYear} onChange={handleYearChange}>
              {/* Populate dropdown with years, you can adjust the range as needed */}
              {Array.from(
                { length: 10 },
                (_, index) => new Date().getFullYear() - index
              ).map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          rows={userData}
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

export default LoginLogs;
