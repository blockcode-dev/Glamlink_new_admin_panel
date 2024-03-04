import axios from "axios";
import { BASE_URL } from "../Host";

//admin login
export const AdminLogin = async (formdata) => {
  console.log("result", formdata);
  return await axios.post(BASE_URL + "admin/auth/login", formdata);
};

//get all user
export const GetUsers = async (adminToken, role_id) => {
  try {
    const res = await axios.post(
      BASE_URL + "admin/user/getAllUsers",
      { role_id: role_id },
      {
        headers: {
          "x-access-token": `${adminToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res;
  } catch (error) {
    // Handle error if needed
    console.error("Error fetching users:", error);
    throw error;
  }
};

//get userby id
export const GetUserById = async (id) => {
  return await axios.get(BASE_URL + "admin/user/getUserById?id=" + id);
};

export const GetAllDriver = async (id) => {
  return await axios.get(BASE_URL + "admin/user/getAllDrivers");
};

//admin add user
export const AddUser = async ({ email, name, role_id }) => {
  const formData = new FormData();

  formData.append("email", email);
  formData.append("name", name);
  formData.append("role_id", role_id);

  return await axios.post(BASE_URL + "admin/user/createUser", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

//delete user
export const DeleteUser = async (user_id, adminToken) => {
  const formData = new FormData();
  formData.append("user_id", user_id);
  return axios.delete(BASE_URL + "admin/user/deleteUser", {
    data: formData,
  });
};

//get all roles
export const GetAllRoles = async () => {
  const res = await axios.get(BASE_URL + "role");

  return res;
};

//get role byid
export const GetRoleById = async (id) => {
  return await axios.get(BASE_URL + "role/getRolebyId?id=" + id);
};

//create role
export const CreateRole = async (formData) => {
  return await axios.post(BASE_URL + "role/create", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

//update role
export const UpdateRoles = async (formData) => {
  return await axios.put(BASE_URL + "role/editRole", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

//delete role
export const DeleteRole = async (role_id, adminToken) => {
  const formData = new FormData();
  formData.append("role_id", role_id);
  return axios.delete(BASE_URL + "role/deleteRole", {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
      "x-access-token": adminToken,
    },
  });
};

// ********************************ADMIN API***********************************************************
export const ChangeAdminPassword = async (data) => {
  return axios.post(BASE_URL + "admin/auth/change-password", data, {
    headers: {
      "Content-Type": "multipart/form-data",
      "x-access-token": `${localStorage.getItem("adminToken")}`,
    },
  });
};

export const GetAdmins = async (adminToken, role_id) => {
  try {
    const res = await axios.get(BASE_URL + "admin/auth/getAllAdmins", {
      headers: {
        "x-access-token": `${adminToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res;
  } catch (error) {
    // Handle error if needed
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const GetAdminById = async (id) => {
  return await axios.get(BASE_URL + "admin/auth/findAdminById?id=" + id);
};

export const UpdateAdmin = async (formData) => {
  return await axios.put(BASE_URL + "admin/auth/updateAdmin", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const DeleteAdmin = async (admin_id, adminToken) => {
  const formData = new FormData();
  formData.append("admin_id", admin_id);
  return axios.delete(BASE_URL + "admin/auth/deleteAdmin", {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
      "x-access-token": adminToken,
    },
  });
};

export const GetAdminProfile = async (adminToken) => {
  return axios.get(BASE_URL + "admin/auth/getProfile", {
    headers: {
      "Content-Type": "multipart/form-data",
      "x-access-token": adminToken,
    },
  });
};

export const CreateAdmin = async (formData) => {
  return await axios.post(BASE_URL + "admin/auth/register", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const ChangePaymentStatus = async ({ user_id, payment_status }) => {
  const formData = new FormData();
  formData.append("user_id", user_id);
  formData.append("payment_status", payment_status);

  return await axios.post(BASE_URL + "admin/updatepaymentStatus", formData);
};

export const GetUserCount = async () => {
  const res = await axios.get(BASE_URL + "/admin/user/getUserCount");
  return res;
};

export const GetDriverCount = async () => {
  const res = await axios.get(BASE_URL + "/admin/user/getDriverCount");
  return res;
};

export const GetBlogCount = async () => {
  const res = await axios.get(BASE_URL + "admin/user/getBlogCount");
  return res;
};

export const GetProductCount = async () => {
  const res = await axios.get(BASE_URL + "admin/user/getProductCount");
  return res;
};

export const GetServiceCount = async () => {
  const res = await axios.get(BASE_URL + "admin/user/getServiceCount");
  return res;
};

export const GetOrderCount = async () => {
  const res = await axios.get(BASE_URL + "admin/user/getOrderCount");
  return res;
};

export const GetBookingCount = async () => {
  const res = await axios.get(BASE_URL + "admin/user/getBookingCount");
  return res;
};

export const GetSalesCountByMonth = async () => {
  const res = await axios.get(BASE_URL + "admin/user/getSalesCountByMonth");
  return res;
};

export const GetMostBookedService = async () => {
  const res = await axios.get(BASE_URL + "admin/user/getMostBookedService");
  return res;
};


export const getUserLoginTimings = async () => {
  const res = await axios.get(BASE_URL + "admin/user/login/timings", {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};

export const clearUserLoginTimings = async () => {
  const res = await axios.delete(BASE_URL + "admin/user/login/timings/clear",{
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
};


