import React from "react";

import '../TermsConditions/TermsAndCondition.scss'
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {

  const navigate = useNavigate();

  const navigateToEditTAndC = () => {
    navigate("/editTermsAndConditions")
  }
  return (
    <div className="main_tc_container">
      <div className="upper_tc_container">
        <h1>Terms & Policy</h1>
        <p>We are on a mission to make the web a better place. The following <br /> terms, as well as our Policy and Terms of Service, apply to all users.</p>
         <p >Last update :</p>
         
      </div>
      <div className="lower_tc_container">
      <Button
      // className="editBtn"
            label=" Edit"
            icon="pi pi-pencil"
            severity="info"
             onClick={navigateToEditTAndC}
            style={{ margin: "0px 10px", borderRadius: "5px" }}
          />
        
      </div>
    </div>
  );
};

export default TermsAndConditions;
