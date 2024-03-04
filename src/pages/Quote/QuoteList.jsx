import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";
import { GetAllQuote, DeleteQuote } from "../../services/Api/QuoteApi";
import { Button } from "primereact/button";
import { message } from "antd";
import Alert from "../../pages/Customer/Alert";

const QuoteList = () => {
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(50);
  const [dataGridHeight, setDataGridHeight] = useState("550px");
  const [blogData, setBlogData] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState();
  const [userId, setUserId] = useState();
  const [userIdToNavigate, setUserIdToNavigate] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = (event, value) => {
    setUserIdToNavigate(value);
    setAnchorEl(event.currentTarget);
  };

  //get all specialist
  const getData = async () => {
    try {
      setLoading(true);
      let result = await GetAllQuote(localStorage.getItem("adminToken"));
      setBlogData(result.data.data);
      console.log("product==>", result.data.data);
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

  const handleDelete = (id) => {
    setIsModalVisible(false);
    DeleteQuote(id)
      .then((res) => {
        console.log(res, "res");
        message.success(res?.data?.message);
        getData();
      })
      .catch((error) => {
        console.log(error, "error");
      });
  };

  const navigateToAddBlog = () => {
    navigate("/addBlog");
  };
  const navigateToEditBlog = (event, id) => {
    navigate(`/editBlog/${id}`);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "name",
      headerName: "Name",
      width: 150,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      // flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      // flex: 1,
    },
    {
      field: "contact_number",
      headerName: "Number",
      width: 150,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      // flex: 1,
    },
    {
      field: "subject",
      headerName: "Subject",
      width: 200,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      // flex: 1,
    },
    {
      field: "messages",
      headerName: "Messages",
      width: 250,
      headerClassName: "custom-header",
      cellClassName: "custom-cell",
      // flex: 1,
    },

    // {
    //   field: "action",
    //   headerName: "Actions",
    //   headerClassName: "custom-header",
    //   cellClassName: "custom-cell",
    //   width: "350",
    //   //   flex: 1,
    //   renderCell: (cellValues) => {
    //     return (
    //       <div>
    //         <Button
    //           icon="pi pi-pencil"
    //           rounded
    //           outlined
    //           className="mr-2"
    //           style={{ marginLeft: "10px", borderRadius: "25px" }}
    //           onClick={(event) => navigateToEditBlog(event, cellValues.id)}
    //         />
    //         <Alert
    //           title="Blog"
    //           handleDelete={() => handleDelete(cellValues.id)}
    //         />
    //       </div>
    //     );
    //   },
    // },
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
            <h3 className="page-title">Quotes List</h3>
          </Box>
          <div
            style={{
              height: dataGridHeight,
              width: "100%",
              marginTop: "20px",
            }}
          >
            <DataGrid
              rows={blogData}
              columns={columns}
              pageSize={pageSize}
              rowHeight={80}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[50, 75, 100]}
              experimentalFeatures={{ newEditingApi: true }}
              onSelectionModelChange={(id) => {
                const selectedIDs = new Set([id]);
                const selectedRowData = blogData.filter((row) =>
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

export default QuoteList;
