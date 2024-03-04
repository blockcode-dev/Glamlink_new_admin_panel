import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { GetGuestBooking } from "../../../services/Api/BookingApi";
import { Button } from "primereact/button";

const GuestBookings = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(50);
  const [dataGridHeight, setDataGridHeight] = useState("550px");
  const [bookingData, setBookingData] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState();
  const [userId, setUserId] = useState();
  const [userIdToNavigate, setUserIdToNavigate] = useState();
  const [loading, setLoading] = useState(false);

  const handleClick = (event, value) => {
    setUserIdToNavigate(value);
    setAnchorEl(event.currentTarget);
  };

  //get all booking
  const getData = async () => {
    try {
      setLoading(true);
      let result = await GetGuestBooking(localStorage.getItem("adminToken"));
      setBookingData(result.data.data);
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

  const navigateToViewBooking = (event, id) => {
    navigate(`/viewGuestBooking/${id}`);
  };

  const navigateToEditRole = (event, id) => {
    navigate(`/editGuestBooking/${id}`);
  };

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
              onClick={(event) => navigateToEditRole(event, cellValues.id)}
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
            <h3>Guest Booking</h3>
            {/* <Box>
          <Button
            label=" Add New Product"
            icon="pi pi-plus"
            severity="info"
            onClick={navigateToAddRole}
            style={{ margin: "0px 10px", borderRadius: "5px" }}
          />
        </Box> */}
          </Box>
          <div
            style={{
              height: dataGridHeight,
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

export default GuestBookings;
