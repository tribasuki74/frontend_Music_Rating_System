import axios from "axios";
import { AUTHORIZATION, BACKEND_FASTAPI } from "./constant";

const AXIOS_INSTANCE = axios.create({
  baseURL: BACKEND_FASTAPI,
  headers: { Authorization: AUTHORIZATION },
});

export default AXIOS_INSTANCE;
