import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { GetServices, DeleteService } from "../../../services/Api/ServiceApi";
import { toast } from "react-toastify";
import { Button } from "primereact/button";
import { BASE_URL_IMAGE } from "../../../services/Host";
import "./Service.css"

const Service = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(50);
  const [dataGridHeight, setDataGridHeight] = useState("550px");
  const [serviceData, setServiceData] = useState([]);
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
      let result = await GetServices(localStorage.getItem("adminToken"));
      setServiceData(result.data.data);
      console.log("product==>", result.data.data);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getData();
  }, []);

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

  //delete role
  const removeRole = async (e, role_id) => {
    const confirmed = window.confirm(
      "Do you really want to delete this Product?"
    );
    if (!confirmed) return;

    try {
      const result = await DeleteService(
        role_id,
        localStorage.getItem("adminToken")
      );

      toast.success("Product deleted successfully!", {
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
        navigate("/role-list");
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

  const navigateToAddService = () => {
    navigate("/addService");
  };

  const navigateToViewService = () => {
    navigate("/viewService");
  };
  const navigateToEditService = (event, id) => {
    navigate(`/editService/${id}`);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 150 },
    {
      field: "name",
      headerName: "Product Name",
      width: 350,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
    },

    {
      field: "image",
      headerName: "Image",
      width: 150,
      flex: 1,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      sortable: false,
      renderCell: (cellValues) => {
        const service = cellValues.row;
        const imageUrl = service.file_name
          ? `${BASE_URL_IMAGE}${service.file_name}`
          : null;

        return imageUrl ? (
          <div>
            <img
              src={imageUrl}
              alt="Service Icon"
              className="category-icon-preview_in_list"
              style={{ width: "100px", height: "60px" }}
            />
          </div>
        ) : (
          <div>No Image Available</div>
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
              onClick={(event) => navigateToViewService(event, cellValues.id)}
            />
            <Button
              icon="pi pi-pencil"
              rounded
              outlined
              className="mr-2"
              style={{ margin: "0px 10px", borderRadius: "25px" }}
              onClick={(event) => navigateToEditService(event, cellValues.id)}
            />
            <Button
              icon="pi pi-trash"
              rounded
              outlined
              severity="danger"
              style={{ borderRadius: "25px" }}
              onClick={(e) => removeRole(e, cellValues.id)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 className="page-title">Services</h3>
        <Box>
          <Button
            label=" Add Service"
            icon="pi pi-plus"
            severity="info"
            onClick={navigateToAddService}
            style={{ margin: "0px 0px", borderRadius: "5px",height:"40px" }}
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
          rows={serviceData}
          columns={columns}
          pageSize={pageSize}
          rowHeight={80}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[50, 75, 100]}
          experimentalFeatures={{ newEditingApi: true }}
          onSelectionModelChange={(id) => {
            const selectedIDs = new Set([id]);
            const selectedRowData = serviceData.filter((row) =>
              selectedIDs.has(row.id.toString())
            );
            setUserId(selectedIDs);
          }}
        />
      </div>
    </Box>
  );
};

export default Service;
