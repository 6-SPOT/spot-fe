"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_Manager from "@/lib/API_Manager";

export default function SelectHelperPage() {
  const router = useRouter();
  const [pgToken, setPgToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("recruitData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);

      // ✅ Base64를 `File` 객체로 변환
      const byteCharacters = atob(parsedData.imageBase64.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const file = new File([byteArray], parsedData.imageName, { type: parsedData.imageType });
      setImageFile(file);
    }

    // ✅ `window.location.search`에서 `pg_token` 직접 감지
    const urlParams = new URLSearchParams(window.location.search);
    const pgTokenFromUrl = urlParams.get("pg_token");

    if (pgTokenFromUrl) {
      console.log("✅ URL에서 감지된 PG 토큰:", pgTokenFromUrl);
      setPgToken(pgTokenFromUrl);
      localStorage.setItem("pg_token", pgTokenFromUrl);

      // ✅ 즉시 `/recruit`로 이동
      router.replace("src/app/(tabs)/recruit/page.tsx");
    }
  }, [router]);

  // ✅ 결제 요청 (PUT 요청 → 결제 URL 반환 후 이동)
  const handlePayment = async () => {
    if (!data || !imageFile) {
      alert("데이터가 없습니다.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("accessToken");
    const jobId = localStorage.getItem("jobId");

    if (!token) {
      alert("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    // ✅ 현재 실행 환경에 따라 `redirect_url`을 동적으로 설정
    const redirectUrl = `${window.location.origin}/recruit/select_helper`;
    console.log("✅ 설정된 리디렉트 URL:", redirectUrl);


    try {
      // ✅ 결제 요청 (POST)
      const response = await API_Manager.post("/api/pay/ready",
        {
          content: data.description,
          amount: Number(data.fee),
          point: Number(data.payPoint),
          jobId: Number(jobId)
        },
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",  // ✅ JSON 요청을 위해 필요
        }
      );

      // ✅ 결제 URL로 이동
      const { redirectMobileUrl, redirectPCUrl, tid } = response.data;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      localStorage.setItem("tid", tid);
      window.location.href = isMobile ? redirectMobileUrl : redirectPCUrl;
    } catch (error) {
      console.error("❌ 결제 실패:", error);
      alert("결제 요청 실패: 서버에서 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">결제 진행</h1>
      {pgToken ? (
        <p className="text-green-600">✅ 결제 완료! 이동 중...</p>
      ) : (
        <button onClick={handlePayment} disabled={loading} className="mt-6 p-3 bg-blue-500 text-white rounded-lg">
          {loading ? "결제 중..." : "결제하기"}
        </button>
      )}
    </div>
  );
}
