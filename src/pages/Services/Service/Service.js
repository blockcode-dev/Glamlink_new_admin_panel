import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { GetServices, DeleteService } from "../../../services/Api/ServiceApi";
import { Button } from "primereact/button";
import "./Service.css";
import { message } from "antd";
import Alert from "../../Customer/Alert";

const Service = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(50);
  const [dataGridHeight, setDataGridHeight] = useState("550px");
  const [serviceData, setServiceData] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState();
  const [userId, setUserId] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  const handleDelete = (id) => {
    setIsModalVisible(false);
    DeleteService(id)
      .then((res) => {
        console.log(res, "res");
        message.success(res?.data?.message);
        getData();
      })
      .catch((error) => {
        console.log(error, "error");
      });
  };

  const navigateToAddService = () => {
    navigate("/addService");
  };

  const navigateToViewService = (event, id) => {
    navigate(`/viewService/${id}`);
  };

  const navigateToEditService = (event, id) => {
    navigate(`/editService/${id}`);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 150 },
    {
      field: "name",
      headerName: "Service Name",
      width: 350,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
    },

    // {
    //   field: "image",
    //   headerName: "Image",
    //   width: 150,
    //   flex: 1,
    //   headerClassName: "custom-header",
    //   cellClassName: "custom-cell",
    //   sortable: false,
    //   renderCell: (cellValues) => {
    //     const service = cellValues.row;
    //     const imageUrl = service.file_name
    //       ? `${BASE_URL_IMAGE}${service.file_name}`
    //       : null;

    //     return imageUrl ? (
    //       <div>
    //         <img
    //           src={imageUrl}
    //           alt="Service Icon"
    //           className="category-icon-preview_in_list"
    //           style={{ width: "100px", height: "60px" }}
    //         />
    //       </div>
    //     ) : (
    //       <div>No Image Available</div>
    //     );
    //   },
    // },

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
              style={{ marginLeft: "10px", borderRadius: "25px" }}
              onClick={(event) => navigateToEditService(event, cellValues.id)}
            />
           <Alert
          //  style={{marginLeft:"0px"}}
              title="Service"
              handleDelete={() => handleDelete(cellValues.id)}
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
            style={{ margin: "0px 0px", borderRadius: "5px", height: "40px" }}
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
