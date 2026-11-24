import httpClient from "../config/AxiosConfig";
import { toResult } from "./apiResult";

export async function requestLoginUrl(orgid) {
  const response = await httpClient.get("/api/oauth/install/login", {
    params: orgid ? { orgid } : undefined,
  });
  return toResult(response);
}
