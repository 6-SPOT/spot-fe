"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API_Manager from "@/lib/API_Manager"; // API Manager 가져오기

export default function LoginPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!id) {
      alert("ID를 입력하세요.");
      return;
    }
  
    setLoading(true);
  
    try {
      // 🔥 API_Manager를 사용하여 로그인 요청
      const response = await API_Manager.get("/api/member/developer-get-token", { id });
  
      console.log("📢 로그인 성공! 응답 데이터:", response);
  
      // ✅ 올바르게 accessToken 값만 저장
      if (response && response.data && response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken); // ✅ 토큰만 저장
        console.log("✅ 저장된 accessToken:", response.data.accessToken);
        router.replace("/home"); // 홈 화면으로 이동
      } else {
        throw new Error("토큰을 받을 수 없습니다.");
      }
    } catch (error: any) {
      console.error("로그인 실패:", error);
      alert(`로그인 실패: ${error.message || "다시 시도해주세요."}`);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">로그인</h1>
      <input
        type="number"
        placeholder="개발자 ID 입력"
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="border p-2 mb-4 w-64"
      />
      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>
    </div>
  );
}
