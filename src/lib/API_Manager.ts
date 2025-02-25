import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: false, // 기본적으로 CORS 문제 방지
});

// 🔥 공통 에러 처리 함수
const handleError = async (error: any) => {
  console.error("API 호출 오류:", error.toJSON ? error.toJSON() : error);
  if (error.response) {
    console.error("Response data:", error.response.data);
    throw error.response.data;
  } else if (error.request) {
    console.error("Request:", error.request);
    throw new Error("서버와 연결할 수 없습니다.");
  } else {
    throw new Error(error.message);
  }
};

// 🔥 API 요청 함수 (모든 요청에서 `headers` 명시해야 함)
const request = async (
  method: "get" | "post" | "put" | "patch" | "delete",
  endpoint: string,
  paramsOrData = {},
  headers = {}
) => {
  try {
    console.log(`${method.toUpperCase()} 요청 헤더:`, headers);

    const response =
      method === "get"
        ? await api[method](endpoint, { params: paramsOrData, headers })
        : await api[method](endpoint, paramsOrData, { headers });

    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// 🔥 API Manager 객체 내보내기 (토큰 자동 추가 X, 호출 시 명시해야 함)
export const API_Manager = {
  get: (endpoint: string, params = {}, headers = {}) =>
    request("get", endpoint, params, headers),
  post: (endpoint: string, data = {}, headers = {}) =>
    request("post", endpoint, data, headers),
  put: (endpoint: string, data = {}, headers = {}) =>
    request("put", endpoint, data, headers),
  patch: (endpoint: string, data = {}, headers = {}) =>
    request("patch", endpoint, data, headers),
  delete: (endpoint: string, data = {}, headers = {}) =>
    request("delete", endpoint, data, headers),
};

export default API_Manager;
