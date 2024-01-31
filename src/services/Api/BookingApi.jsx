import axios from "axios";
import { BASE_URL } from "../Host";

// ****************************************** GUEST BOOKING *****************************************
export const GetGuestBooking = async () => {
  const res = await axios.get(BASE_URL + "booking/getAllGuestBooking");

  return res;
};

export const GetGuestBookingById = async (id) => {
  return await axios.get(BASE_URL + `booking/getGuestBookingById/${id}`);
};

export const UpdateGuestBooking = async (formData) => {
  return await axios.post(
    BASE_URL + `booking/alotGuestBookingToDriver`,
    formData,
    {
      headers: {
        "x-access-token": `${localStorage.getItem("adminToken")}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// ****************************************** USER BOOKING *****************************************
export const GetUserBooking = async (adminToken, booking_status) => {
  try {
    const res = await axios.post(
      BASE_URL + "booking/getAllBookings",
      { booking_status: booking_status },
      {
        headers: {
          "x-access-token": `${adminToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const GetBookingById = async (id) => {
  return await axios.get(BASE_URL + `booking/getBookingById/${id}`);
};

export const UpdateBooking = async (formData) => {
  return await axios.post(BASE_URL + `booking/alotBookingToDriver`, formData, {
    headers: {
      "x-access-token": `${localStorage.getItem("adminToken")}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
