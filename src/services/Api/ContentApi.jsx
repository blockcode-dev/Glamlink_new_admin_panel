import axios from "axios";
import { BASE_URL } from "../Host";


export const GetTermsAndConditions = async () => {
    const res = await axios.get(BASE_URL + "content/getAllTermsAndConditons");
    return res;
  };