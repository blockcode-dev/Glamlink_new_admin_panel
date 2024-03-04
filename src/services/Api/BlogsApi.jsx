import axios from "axios";
import { BASE_URL } from "../Host";


export const GetAllBlogs = async (adminToken, role_id) => {
  try {
    const res = await axios.get(BASE_URL + "blog/getAllBlogs", {
      headers: {
        "x-access-token": `${adminToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

//get products byid
export const GetBlogById = async (id) => {
  return await axios.get(BASE_URL + `blog/findBlogById/${id}`);
};

//create products
export const CreateBlog = async (formData) => {
  return await axios.post(BASE_URL + "blog/createBlog", formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

//update products
export const UpdateBlog = async (id, formData) => {
  return await axios.put(BASE_URL + `blog/updateBlog/${id}`, formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

//delete products
export const DeleteBlog = async (id) => {
  return axios.delete(BASE_URL + `blog/deleteBlog/${id}`);
};
