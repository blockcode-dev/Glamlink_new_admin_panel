import React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LockOpenSharpIcon from "@mui/icons-material/LockOpenSharp";
import PersonOutlineSharpIcon from "@mui/icons-material/PersonOutlineSharp";
import PersonalInformation from "./PersonalInformation/PersonalInformation";
import ChangePassword from "./ChangePassword/ChangePassword";

import "./Settings.css";

const Settings = () => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const renderContent = () => {
    switch (selectedIndex) {
      case 0:
        return <PersonalInformation />;
      case 1:
        return <ChangePassword />;
    
      default:
        return <PersonalInformation />;
    }
  };

  return (
    <>
      <div className="setting_sidebar_container">
        <div className="setting_left_sidebar">
          <List>
            <ListItemButton
              selected={selectedIndex === 0}
              onClick={(event) => handleListItemClick(event, 0)}
              sx={{
                backgroundColor:
                  selectedIndex === 0 ? "lightgrey" : "transparent",
                borderRight: selectedIndex === 0 ? "2px solid #1976D2" : "none",
              }}
            >
              <ListItemIcon>
                <PersonOutlineSharpIcon />
              </ListItemIcon>
              <ListItemText primary="Personal Information" />
            </ListItemButton>
            <ListItemButton
              selected={selectedIndex === 1}
              onClick={(event) => handleListItemClick(event, 1)}
              sx={{
                backgroundColor:
                  selectedIndex === 1 ? "lightgrey" : "transparent",
                borderRight: selectedIndex === 1 ? "2px solid #1976D2" : "none",
              }}
            >
              <ListItemIcon>
                <LockOpenSharpIcon />
              </ListItemIcon>
              <ListItemText primary="Change Password" />
            </ListItemButton>
           
          </List>
        </div>
        <div className="setting_right_container">{renderContent()}</div>
      </div>
    </>
  );
};

export default Settings;
