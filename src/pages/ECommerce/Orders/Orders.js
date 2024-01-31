import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { GetAllOrders } from "../../../services/Api/OrderApi";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import moment from "moment";

const Orders = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(50);
  const [dataGridHeight, setDataGridHeight] = useState("550px");
  const [orderData, setOrderData] = useState([]);
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
      let result = await GetAllOrders(localStorage.getItem("adminToken"));
      setOrderData(result.data.data);
      console.log("orderData==>", result.data.data);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const navigateToViewProduct = (event, id) => {
    navigate(`/viewOrder/${id}`);
  };
  const navigateToEditRole = (event, id) => {
    navigate(`/editOrder/${id}`);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    {
      field: "order_id",
      headerName: "Order Id",
      width: 150,
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
      valueGetter: (params) => params.row.order_user?.user_profile?.name || "",
    },
    {
      field: "created_at",
      headerName: "Date",
      width: 350,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
      valueFormatter: (params) =>
        moment(params?.value).format("DD/MM/YYYY hh:mm A"),
    },

    {
      field: "order_status",
      headerName: "Order Status",
      width: 350,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
      renderCell: (cellValues) => {
        const orderStatus = cellValues.row.order_status;
        let statusText, statusColor, fontSize, fontWeight;

        switch (orderStatus) {
          case "BOOKED":
            statusText = "Booked";
            statusColor = "#f4bd0e";
            fontSize = "16px";
            fontWeight = "500";
            break;
          case "ACCEPTED":
            statusText = "Accepted";
            statusColor = "green";
            fontSize = "16px";
            fontWeight = "500";
            break;
          case "SHIPPED":
            statusText = "Shipped";
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
          case "DELIVERED":
            statusText = "DELIVERED";
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
              onClick={(event) => navigateToViewProduct(event, cellValues.id)}
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
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3>ORDERS</h3>
      </Box>
      <div
        style={{
          height: dataGridHeight,
          width: "100%",
          marginTop: "20px",
        }}
      >
        <DataGrid
          rows={orderData}
          columns={columns}
          pageSize={pageSize}
          rowHeight={80}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[50, 75, 100]}
          experimentalFeatures={{ newEditingApi: true }}
          onSelectionModelChange={(id) => {
            const selectedIDs = new Set([id]);
            const selectedRowData = orderData.filter((row) =>
              selectedIDs.has(row.id.toString())
            );
            setUserId(selectedIDs);
          }}
        />
      </div>
    </Box>
  );
};

export default Orders;
