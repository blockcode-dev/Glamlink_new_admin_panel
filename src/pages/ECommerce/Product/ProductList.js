import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { GetAllProducts, DeleteProduct } from "../../../services/Api/ProductApi";
import { Button } from "primereact/button";
import Alert from "../../Customer/Alert";
import { message } from "antd";

const ProductList = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(50);
  const [dataGridHeight, setDataGridHeight] = useState("550px");
  const [productData, setProductData] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState();
  const [userId, setUserId] = useState();
  const [userIdToNavigate, setUserIdToNavigate] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClick = (event, value) => {
    setUserIdToNavigate(value);
    setAnchorEl(event.currentTarget);
  };

  //get all specialist
  const getData = async () => {
    try {
      let result = await GetAllProducts(localStorage.getItem("adminToken"));
      setProductData(result.data.data);
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
    DeleteProduct(id)
      .then((res) => {
        console.log(res, "res");
        message.success(res?.data?.message);
        getData();
      })
      .catch((error) => {
        console.log(error, "error");
      });
  };


  const navigateToAddProduct = () => {
    navigate("/addProduct");
  };

  const navigateToViewProduct = (event, id) => {
    navigate(`/viewProduct/${id}`);
  };
  const navigateToEditProduct = (event, id) => {
    navigate(`/editProduct/${id}`);
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
      field: "stock",
      headerName: "Stock",
      width: 350,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      flex: 1,
      renderCell: (cellValues) => {
        const stockValue = cellValues.row.stock;
        const stockStatus = stockValue > 0 ? "In Stock" : "Out of Stock";
        const stockColor = stockValue > 0 ? "green" : "red";

        return <div style={{ color: stockColor }}>{stockStatus}</div>;
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
              style={{ borderRadius:"25px" }}
              onClick={(event) => navigateToViewProduct(event, cellValues.id)}
            />
            <Button
              icon="pi pi-pencil"
              rounded
              outlined
              className="mr-2"
              style={{  marginLeft: "10px",borderRadius:"25px" }}
              onClick={(event) => navigateToEditProduct(event, cellValues.id)}
            />
              <Alert
              title="Product"
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
        <h3>Products</h3>
        <Box>
          <Button
            label=" Add New Product"
            icon="pi pi-plus"
            severity="info"
            onClick={navigateToAddProduct}
            style={{ margin: "0px 10px", borderRadius: "5px" }}
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
          rows={productData}
          columns={columns}
          pageSize={pageSize}
          rowHeight={80}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[50, 75, 100]}
          experimentalFeatures={{ newEditingApi: true }}
          onSelectionModelChange={(id) => {
            const selectedIDs = new Set([id]);
            const selectedRowData = productData.filter((row) =>
              selectedIDs.has(row.id.toString())
            );
            setUserId(selectedIDs);
          }}
        />
      </div>
    </Box>
  );
};

export default ProductList;
