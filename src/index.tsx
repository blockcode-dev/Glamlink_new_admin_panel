import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import "./config/dayjs";
import "./index.css";
import App from "./App";
import { installSessionHandler } from "./utils/session";

installSessionHandler();

// index.html always has <div id="root">.
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <>
    <App />
  </>
);
