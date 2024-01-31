import React, { useEffect, useState } from "react";
import "../TermsConditions/TermsAndCondition.scss";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { GetTermsAndConditions } from "../../../services/Api/ContentApi";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [contentData, setContentData] = useState([]);

  const getData = async () => {
    try {
      let result = await GetTermsAndConditions(
        localStorage.getItem("adminToken")
      );
      setContentData(result.data.data);
      console.log("GetTermsAndConditions==>", result.data.data);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const navigateToEditTAndC = () => {
    navigate("/editTermsAndConditions");
  };
  return (
    <div className="main_tc_container">
      <div className="upper_tc_container">
        <h1>Terms & Conditions</h1>
        <p>
          We are on a mission to make the web a better place. The following{" "}
          <br /> terms, as well as our Policy and Terms of Service, apply to all
          users.
        </p>
        <p>Last update : {contentData[0]?.updated_at}</p>
      </div>
      <div className="lower_tc_container">
        <div>
          <h2>{contentData[0]?.heading}</h2>
          <p>{contentData[0]?.description}</p>
        </div>
        <div style={{ position: "relative" }}>
          <Button
            label=" Edit T&C"
            icon="pi pi-pencil"
            severity="info"
            onClick={navigateToEditTAndC}
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              marginTop: "16px",
              marginRight: "16px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
