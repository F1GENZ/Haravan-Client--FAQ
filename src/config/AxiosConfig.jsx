import axios from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  withCredentials: true,
});

httpClient.interceptors.request.use(
  (config) => {
    const orgid = sessionStorage.getItem("orgid");
    if (orgid) config.params = { ...config.params, orgid: orgid };
    return config;
  },
  (err) => {
    console.log(err);
  }
);

export default httpClient;
