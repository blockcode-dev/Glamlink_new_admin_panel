import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import "./Bookings.css";
import { GetUserBooking } from "../../../services/Api/BookingApi";

const Bookings = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(50);
  const [bookingData, setBookingData] = useState([]);
  const [userId, setUserId] = useState();
  const [userIdToNavigate, setUserIdToNavigate] = useState();
  const [loading, setLoading] = useState(false);

  const handleClick = (event, value) => {
    setUserIdToNavigate(value);
    // setAnchorEl(event.currentTarget);
  };

  const onChange = (key) => {
    switch (key) {
      case "1":
        getData("all");
        break;
      case "2":
        getData("ONGOING");
        break;
      case "3":
        getData("COMPLETED");
        break;
      default:
        break;
    }
  };

  //get all booking
  const getData = async (booking_status) => {
    try {
      setLoading(true);
      let result = await GetUserBooking(
        localStorage.getItem("adminToken"),
        booking_status
      );
      setBookingData(result.data.data);
      console.log("userbooking==>", result.data.data);
    } catch (e) {
      console.log(e);
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
    getData("all");
  }, []);

  const navigateToViewBooking = (event, id) => {
    navigate(`/viewBooking/${id}`);
  };
  const navigateToEditBooking = (event, id) => {
    navigate(`/editBooking/${id}`);
  };
  const tabsContent = [
    { label: "All", key: "1" },
    { label: "Ongoing", key: "2" },
    { label: "Completed", key: "3" },
  ];

  const columns = [
    { field: "id", headerName: "ID", width: 150 },
    {
      field: "booking_id",
      headerName: "Booking Id",
      width: 350,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Name",
      width: 350,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
      valueGetter: (params) =>
        params.row.booking_user?.user_profile?.name || "",
    },
    {
      field: "booking_status",
      headerName: "Booking Status",
      width: 350,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
      renderCell: (cellValues) => {
        const bookingStatus = cellValues.row.booking_status;
        let statusText, statusColor, fontSize, fontWeight;

        switch (bookingStatus) {
          case "PENDING":
            statusText = "Pending";
            statusColor = "#f4bd0e";
            fontSize = "16px";
            fontWeight = "500";
            break;
          case "SUCCESS":
            statusText = "Success";
            statusColor = "green";
            fontSize = "16px";
            fontWeight = "500";
            break;
          case "ACCEPTED":
            statusText = "Accepted";
            statusColor = "blue";
            fontSize = "16px";
            fontWeight = "500";
            break;
          case "REJECTED":
            statusText = "Rejected";
            statusColor = "red";
            fontSize = "16px";
            fontWeight = "500";
            break;
          case "ONGOING":
            statusText = "Ongoing";
            statusColor = "purple";
            fontSize = "16px";
            fontWeight = "500";
            break;
          default:
            statusText = "Unknown";
            statusColor = "black";
        }

        return (
          <div
            style={{
              color: statusColor,
              fontSize: fontSize,
              fontWeight: fontWeight,
            }}
          >
            {statusText}
          </div>
        );
      },
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
              icon="pi pi-info-circle"
              rounded
              outlined
              severity="warning"
              className=" product"
              style={{ borderRadius: "25px" }}
              onClick={(event) => navigateToViewBooking(event, cellValues.id)}
            />
            <Button
              icon="pi pi-pencil"
              rounded
              outlined
              className="mr-2"
              style={{ margin: "0px 10px", borderRadius: "25px" }}
              onClick={(event) => navigateToEditBooking(event, cellValues.id)}
            />
          </div>
        );
      },
    },
  ];
  return (
    <Box>
      {loading ? (
        <p style={{ fontSize: "16px" }}>Loading...</p>
      ) : (
        <>
          <div className="booking_container">
            <div>
              <h3 className="page-title">USER BOOKINGS</h3>
              <p className="page-sub-title">View User's Bookings</p>
            </div>
            <div>
              <Tabs
                defaultActiveKey="1"
                type="card"
                size="large"
                onChange={onChange}
              >
                {tabsContent.map((tab) => (
                  <Tabs.TabPane tab={tab.label} key={tab.key}>
                    {tab.children}
                  </Tabs.TabPane>
                ))}
              </Tabs>
            </div>
          </div>

          <div
            style={{
              height: "550px",
              width: "100%",
              marginTop: "20px",
            }}
          >
            <DataGrid
              rows={bookingData}
              columns={columns}
              pageSize={pageSize}
              rowHeight={80}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[50, 75, 100]}
              experimentalFeatures={{ newEditingApi: true }}
              onSelectionModelChange={(id) => {
                const selectedIDs = new Set([id]);
                const selectedRowData = bookingData.filter((row) =>
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

export default Bookings;
