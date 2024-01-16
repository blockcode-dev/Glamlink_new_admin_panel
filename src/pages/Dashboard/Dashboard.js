import React, { useEffect, useState } from "react";
import { Column } from "@ant-design/plots";
import { AiTwotoneLike } from "react-icons/ai";
import { FcReading } from "react-icons/fc";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import {
  GetUserCountByMonth,
  GetBlogCount,
  GetCategoryCount,
  GetUserCount,
  GetMostLiked,
  GetMostViewed,
} from "../../services/Api/Api";

const getAllMonths = () => {
  const months = [
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
  return months.map((month) => ({ type: month, sales: 0 }));
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [mostLikedData, setMostLikedData] = useState([]);
  const [mostViewedData, setMostViewedData] = useState([]);

  //get customer count
  const getCustomerData = async () => {
    try {
      const result = await GetUserCount(localStorage.getItem("adminToken"));
      setCustomerData(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getCustomerData();
  }, []);

  //get categroy count
  const getCategoryData = async () => {
    try {
      const result = await GetCategoryCount(localStorage.getItem("adminToken"));
      setCategoryData(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getCategoryData();
  }, []);

  //get blog count
  const getBlogData = async () => {
    try {
      const result = await GetBlogCount(localStorage.getItem("adminToken"));
      setBlogData(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getBlogData();
  }, []);

  //get likes count
  const getMostLikedData = async () => {
    try {
      const result = await GetMostLiked(localStorage.getItem("adminToken"));
      setMostLikedData(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getMostLikedData();
  }, []);

  //get views count
  const getMostViewedData = async () => {
    try {
      const result = await GetMostViewed(localStorage.getItem("adminToken"));
      setMostViewedData(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getMostViewedData();
  }, []);

  //get usercount by month api
  const getData = async () => {
    try {
      const result = await GetUserCountByMonth(
        localStorage.getItem("adminToken")
      );
      setUserData(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const formattedData =
    userData.length > 0
      ? userData.map(({ month, userCount }) => ({
          type: month,
          sales: userCount,
        }))
      : getAllMonths();

  const config = {
    data: formattedData,
    xField: "type",
    yField: "sales",
    color: ({ type }) => "#ffd333",
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 1,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      type: {
        alias: "Month",
      },
      sales: {
        alias: "User Count",
      },
    },
  };

  const navigateToViewLoginLogs = () => {
    navigate("/loginLogs");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20PX",
        }}
      >
        <h3 className="title">Dashboard</h3>

       
      </div>

      <div className="d-flex justify-content-between align-items-center gap-3 mb-3 ">
        <div className="d-flex justify-content-between align-items-end flex-grow-1 bg-white p-3 roudned-3">
          <div>
            <p className="desc">Most Liked Story</p>
            <h4 className="mb-0 sub-title">{mostLikedData.likes_count}</h4>
          </div>
          <div className="d-flex flex-column align-items-end">
            <h6 className="red">
              <AiTwotoneLike style={{ fontSize: "30px" }} />
            </h6>
            <p className="mb-0  desc">{mostLikedData.heading}</p>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-end flex-grow-1 bg-white p-3 roudned-3">
          <div>
            <p className="desc">Most Viewed Story</p>
            <h4 className="mb-0 sub-title">{mostViewedData.views_count}</h4>
          </div>
          <div className="d-flex flex-column align-items-end">
            <h6 className="red">
              <FcReading style={{ fontSize: "30px" }} />
            </h6>
            <p className="mb-0  desc">{mostViewedData.heading}</p>
          </div>
        </div>
        <div>
          {/* <div>
            <Button
              label="Click To View Login Logs"
              icon="pi pi-arrow-up-right"
              iconPos="right"
              rounded outlined aria-label="Filter"
              style={{
                borderRadius: "10px",
                marginLeft: "10px",
                marginTop: "10px",
              }}
            />

          
          </div> */}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
        <div className="d-flex justify-content-between align-items-end flex-grow-1 bg-white p-3 roudned-3">
          <div>
            <p className="desc">Total Users</p>
            <h4 className="mb-0 sub-title">{customerData}</h4>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-end flex-grow-1 bg-white p-3 roudned-3">
          <div>
            <p className="desc">Total Stories</p>
            <h4 className="mb-0 sub-title">{blogData}</h4>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-end flex-grow-1 bg-white p-3 roudned-3">
          <div>
            <p className="desc">Total Categories</p>
            <h4 className="mb-0 sub-title">{categoryData}</h4>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-5 title">User Registration Statistics by Month</h3>
        <div>
          <Column {...config} />
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
