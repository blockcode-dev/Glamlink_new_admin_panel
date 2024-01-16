import axios from "axios";
import { BASE_URL } from "../Host";


export const GetGuestBooking = async () => {
    const res = await axios.get(BASE_URL + "booking/getAllGuestBooking");
  
    return res;
  };