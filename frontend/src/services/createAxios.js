import axios from "axios";
export default function createAxios() {
  const instance = axios.create({
    baseURL: "/api/v1",
    headers: { "csrf-token": `${localStorage.getItem("csrf-token")}` },
  });
  return instance;
}
