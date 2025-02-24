import axios from "axios";
import { Preferences } from "@capacitor/preferences"; // Capacitor Storage 사용 가능

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://your-api.com";

/**
 * 로컬에서 토큰 가져오기
 */
export const getServerTokens = async () => {
  const accessToken = await Preferences.get({ key: "accessToken" });
  const refreshToken = await Preferences.get({ key: "refreshToken" });

  if (!accessToken.value || !refreshToken.value) {
    return null;
  }

  return {
    accessToken: accessToken.value,
    refreshToken: refreshToken.value,
  };
};

/**
 * 새로운 토큰 저장하기
 */
export const saveTokens = async (accessToken: string, refreshToken?: string) => {
  await Preferences.set({ key: "accessToken", value: accessToken });

  if (refreshToken) {
    await Preferences.set({ key: "refreshToken", value: refreshToken });
  }
};

/**
 * 액세스 토큰 갱신
 */
export const refreshTokens = async (): Promise<string | null> => {
  try {
    const tokens = await getServerTokens();
    if (!tokens?.refreshToken) {
      console.log("리프레시 토큰 없음, 로그아웃 필요");
      return null;
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: tokens.refreshToken,
    });

    if (response.status === 200 && response.data.accessToken) {
      await saveTokens(response.data.accessToken, response.data.refreshToken);
      return response.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error("토큰 갱신 실패:", error);
    return null;
  }
};

/**
 * 로그아웃 (토큰 삭제)
 */
export const logout = async () => {
  await Preferences.remove({ key: "accessToken" });
  await Preferences.remove({ key: "refreshToken" });
};
