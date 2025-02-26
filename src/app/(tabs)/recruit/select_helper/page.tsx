"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import API_Manager from "@/lib/API_Manager";

export default function SelectHelperPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobData, setJobData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // URL에서 전달된 데이터 가져오기
  useEffect(() => {
    const encodedData = searchParams.get("data");
    if (encodedData) {
      setJobData(JSON.parse(decodeURIComponent(encodedData)));
    }
  }, [searchParams]);

  // 공고 올리기 API 호출
  const handlePostJob = async () => {
    if (!jobData) {
      alert("잘못된 요청입니다.");
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    const jsonRequest = JSON.stringify({
      title: "구인 요청",
      content: jobData.description,
      money: Number(jobData.fee),
      point: 500,
      lat: jobData.lat,
      lng: jobData.lng,
    });

    formData.append("request", new Blob([jsonRequest], { type: "application/json" }));

    try {
      const response = await API_Manager.put(
        "/api/job/register",
        formData,
        { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      );

      console.log("✅ 구인 등록 성공! 응답 데이터:", response);
      alert("공고가 등록되었습니다!");
      router.replace("/home");
    } catch (error) {
      console.error("❌ 구인 등록 실패:", error);
      alert("공고 등록 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold">해결사 선택</h1>
      <button onClick={handlePostJob} disabled={loading} className="mt-4 p-2 bg-blue-500 text-white rounded-lg w-full max-w-md">
        {loading ? "등록 중..." : "공고 올리기"}
      </button>
    </div>
  );
}
