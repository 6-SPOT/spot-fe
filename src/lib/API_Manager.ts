import axios, { AxiosResponse } from "axios";
import { getServerTokens, refreshTokens, logout } from "./serverTokenManager";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-api.com";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60초 타임아웃
  headers: {
    Accept: "application/json;charset=UTF-8;",
    "Content-Type": "application/json;charset=UTF-8;",
  },
  withCredentials: true, // 쿠키 기반 인증 사용 가능
});

// 요청 인터셉터 (액세스 토큰 자동 추가)
api.interceptors.request.use(
  async (config) => {
    const tokens = await getServerTokens();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (토큰 만료 시 자동 갱신)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    console.error("API 호출 오류:", error.toJSON ? error.toJSON() : error);

    if (error.response) {
      console.error("Response data:", error.response.data);

      // 액세스 토큰 만료 시 자동 갱신
      if (
        error.response.status === 401 &&
        error.response.data?.message === "액세스 토큰이 만료되었습니다."
      ) {
        console.log("토큰 만료 감지, 갱신 시도");
        const newAccessToken = await refreshTokens();

        if (newAccessToken) {
          console.log("토큰 갱신 성공, 요청 재시도");

          // 원래 요청을 새로운 토큰과 함께 재시도
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          console.log("토큰 갱신 실패, 로그아웃 처리");
          await logout();
          return Promise.reject("로그아웃됨");
        }
      }
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error("Request:", error.request);
      throw new Error("서버와 연결할 수 없습니다.");
    } else {
      throw new Error(error.message);
    }
  }
);

// API 요청 함수 정의
export const API_Manager = {
  get: async <T>(endpoint: string, params = {}, headers = {}): Promise<T> => {
    try {
      const response = await api.get<T>(endpoint, { params, headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  post: async <T>(endpoint: string, data = {}, headers = {}): Promise<T> => {
    try {
      const response = await api.post<T>(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  patch: async <T>(endpoint: string, data = {}, headers = {}): Promise<T> => {
    try {
      const response = await api.patch<T>(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async <T>(endpoint: string, data = {}, headers = {}): Promise<T> => {
    try {
      const response = await api.delete<T>(endpoint, {
        headers,
        data, // DELETE 요청에서 body 전달
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default API_Manager;
