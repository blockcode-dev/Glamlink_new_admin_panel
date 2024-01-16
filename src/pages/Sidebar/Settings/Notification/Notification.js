import React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Switch from "@mui/material/Switch";
import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';


const Notification = () => {
  const [checked, setChecked] = React.useState(["wifi"]);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };
  return (
    <List
      sx={{ width: "100%", bgcolor: "background.paper" }}
      subheader={<ListSubheader>Notification Settings</ListSubheader>}
    >
      <ListItem>
        <ListItemIcon>
          <BookmarksOutlinedIcon />
        </ListItemIcon>
        <ListItemText id="switch-list-label-wifi" primary="Get Notified for Everything" />
        <Switch
          edge="end"
          onChange={handleToggle("wifi")}
          checked={checked.indexOf("wifi") !== -1}
          inputProps={{
            "aria-labelledby": "switch-list-label-wifi",
          }}
        />
      </ListItem>
    </List>
  );
};

export default Notification;
