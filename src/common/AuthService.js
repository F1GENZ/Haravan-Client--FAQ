import httpClient from "../config/AxiosConfig";
import { toResult } from "./apiResult";

export async function requestLoginUrl() {
  const response = await httpClient.get("/api/oauth/install/login");
  return toResult(response);
}
