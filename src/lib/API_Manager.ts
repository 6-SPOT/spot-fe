import axios from "axios";
import { getServerTokens, refreshTokens } from "./serverTokenManager";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-api.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60초 타임아웃
  headers: {
    Accept: "application/json;charset=UTF-8;",
    "Content-Type": "application/json;charset=UTF-8;",
  },
  withCredentials: false, // 기본적으로 CORS 정책 문제 방지
});

// 공통 에러 처리 함수
const handleError = async (error: any, retryCallback: () => Promise<any>) => {
  console.error("API 호출 오류:", error.toJSON ? error.toJSON() : error);
  if (error.response) {
    console.error("Response data:", error.response.data);

    if (
      error.response.status === 401 &&
      error.response.data?.message === "액세스 토큰이 만료되었습니다."
    ) {
      console.log("토큰 만료 감지, 갱신 시도");
      const newAccessToken = await refreshTokens();
      if (newAccessToken) {
        console.log("토큰 갱신 성공, 요청 재시도");
        return retryCallback();
      }
    }

    throw error.response.data;
  } else if (error.request) {
    console.error("Request:", error.request);
    throw new Error("서버와 연결할 수 없습니다.");
  } else {
    throw new Error(error.message);
  }
};

// 공통 API 요청 함수
const request = async (
  method: "get" | "post" | "patch" | "delete",
  endpoint: string,
  paramsOrData = {},
  headers = {},
  options: { skipAuth?: boolean; useSerializer?: boolean } = {}
) => {
  const { skipAuth = false, useSerializer = false } = options;
  const retryCallback = async () =>
    request(method, endpoint, paramsOrData, headers, options);

  try {
    const tokens = await getServerTokens();
    const finalHeaders = !skipAuth && tokens?.accessToken
      ? { ...headers, Authorization: `Bearer ${tokens.accessToken}` }
      : { ...headers };

    console.log(`${method.toUpperCase()} 요청 헤더:`, finalHeaders);

    const config: any = {
      headers: finalHeaders,
      withCredentials: false, // CORS 문제 방지
    };

    if (useSerializer) {
      config.paramsSerializer = (params: any) =>
        Object.entries(params)
          .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
          .join("&");
    }

    const response =
      method === "get"
        ? await api[method](endpoint, { params: paramsOrData, ...config })
        : await api[method](endpoint, paramsOrData, config);

    return response.data;
  } catch (error) {
    return handleError(error, retryCallback);
  }
};

// API Manager 객체 내보내기
export const API_Manager = {
  get: (endpoint: string, params = {}, headers = {}, options = {}) =>
    request("get", endpoint, params, headers, options),
  post: (endpoint: string, data = {}, headers = {}, options = {}) =>
    request("post", endpoint, data, headers, options),
  patch: (endpoint: string, data = {}, headers = {}, options = {}) =>
    request("patch", endpoint, data, headers, options),
  delete: (endpoint: string, data = {}, headers = {}, options = {}) =>
    request("delete", endpoint, data, headers, options),
};

export default API_Manager;
