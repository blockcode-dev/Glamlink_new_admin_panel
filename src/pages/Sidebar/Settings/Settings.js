import React from "react";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LockOpenSharpIcon from "@mui/icons-material/LockOpenSharp";
import PersonOutlineSharpIcon from "@mui/icons-material/PersonOutlineSharp";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import PersonalInformation from "./PersonalInformation/PersonalInformation";
import ChangePassword from "./ChangePassword/ChangePassword";
import AdminActivity from "./AdminActivity/AdminActivity";
import Notification from "./Notification/Notification";
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
      case 2:
        return <AdminActivity />;
      case 3:
        return <Notification />;
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
            <ListItemButton
              selected={selectedIndex === 2}
              onClick={(event) => handleListItemClick(event, 2)}
              sx={{
                backgroundColor:
                  selectedIndex === 2 ? "lightgrey" : "transparent",
                borderRight: selectedIndex === 2 ? "2px solid #1976D2" : "none",
              }}
            >
              <ListItemIcon>
                <InsertChartOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Account Activity" />
            </ListItemButton>
            <ListItemButton
              selected={selectedIndex === 3}
              onClick={(event) => handleListItemClick(event, 3)}
              sx={{
                backgroundColor:
                  selectedIndex === 3 ? "lightgrey" : "transparent",
                borderRight: selectedIndex === 3 ? "2px solid #1976D2" : "none",
              }}
            >
              <ListItemIcon>
                <NotificationsOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Notification" />
            </ListItemButton>
          </List>
        </div>
        <div className="setting_right_container">{renderContent()}</div>
      </div>
    </>
  );
};

export default Settings;
