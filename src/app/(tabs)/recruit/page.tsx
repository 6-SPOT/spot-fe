"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import API_Manager from "@/lib/API_Manager";
import MapComponent from "@/components/MapComponent";

export default function RecruitPage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("의뢰 위치 선택");
  const [fee, setFee] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // 이미지 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 지도에서 선택된 위치 저장
  const handleConfirmLocation = (address: string, coords: { lat: number; lng: number }) => {
    console.log("🛠 위치 선택됨:", address, coords);
    setLocation(address);
    setSelectedCoords(coords);
    setIsModalOpen(false);
  };

  // 🔥 해결사 선택 버튼 클릭 시 API 요청 후 URL 실행
  const handleSubmit = async () => {
    if (!description || !fee || !selectedCoords || !imageFile) {
      alert("모든 필드를 입력하고 이미지를 업로드하세요.");
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

    // ✅ request 값을 Blob으로 변환하여 Content-Type 명시적으로 추가
    const jsonRequest = JSON.stringify({
      title: "구인 요청",
      content: description,
      money: Number(fee),
      point: 500,
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
    });

    const requestBlob = new Blob([jsonRequest], { type: "application/json" });
    formData.append("request", requestBlob);
    formData.append("file", imageFile);

    try {
      const response = await API_Manager.put(
        "/api/job/register",
        formData,
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        }
      );

      console.log("✅ 구인 등록 성공! 응답 데이터:", response);

      // 서버 응답에서 redirect URL 가져오기
      const { redirectMobileUrl, redirectPCUrl, tid } = response.data;

      if (!redirectMobileUrl || !redirectPCUrl) {
        throw new Error("서버에서 반환된 URL이 없습니다.");
      }

      // 모바일/PC 환경 판별 후 URL 실행
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        console.log("📱 모바일 환경: ", redirectMobileUrl);
        window.location.href = redirectMobileUrl;
      } else {
        console.log("💻 PC 환경: ", redirectPCUrl);
        window.location.href = redirectPCUrl;
      }
      localStorage.setItem("tid", tid);
      localStorage.setItem("jobTitle", description);
      localStorage.setItem("totalAmount", fee);

    } catch (error) {
      if (error instanceof Error) {
        console.error("❌ 구인 등록 실패:", error);
        alert(`구인 등록 실패: ${error.message || "서버 오류"}`);
      } else {
        console.error("❌ 예상치 못한 오류:", error);
        alert("예상치 못한 오류 발생");
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">구인 등록</h1>

      {/* 이미지 업로드 */}
      <div className="w-full flex flex-col items-center">
        <label className="w-full max-w-md h-48 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer">
          {imagePreview ? (
            <Image src={imagePreview} alt="업로드 이미지" width={150} height={150} className="object-cover rounded-lg" />
          ) : (
            <span className="text-gray-500">사진을 업로드하세요</span>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      {/* 의뢰 내용 입력 */}
      <div className="w-full max-w-md mt-4">
        <label className="block font-semibold">📌 의뢰 내용</label>
        <textarea
          className="w-full p-2 border rounded-lg mt-2"
          rows={4}
          placeholder="의뢰 내용을 입력하세요."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* 의뢰 위치 선택 */}
      <div className="w-full max-w-md mt-4">
        <label className="block font-semibold">📍 의뢰 위치</label>
        <button
          className="w-full p-2 border rounded-lg mt-2 text-left"
          onClick={() => setIsModalOpen(true)}
        >
          {location}
        </button>
      </div>

      {/* 보수 입력 */}
      <div className="w-full max-w-md mt-4">
        <label className="block font-semibold">💰 보수</label>
        <input
          type="number"
          className="w-full p-2 border rounded-lg mt-2"
          placeholder="보수를 입력하세요."
          value={fee}
          onChange={(e) => setFee(e.target.value)}
        />
      </div>

      {/* 해결사 선택 버튼 → API 요청 후 URL 실행 */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 p-3 bg-blue-500 text-white rounded-lg w-full max-w-md disabled:bg-gray-400"
      >
        {loading ? "등록 중..." : "해결사 선택"}
      </button>

      {/* 지도 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg w-4/5 h-3/5 relative">
            <h2 className="text-xl font-bold mb-4">📍 위치 확인</h2>
            <div className="w-full h-64 relative">
              <MapComponent mode="reverse-geocoding" onConfirm={handleConfirmLocation} />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-3xl">
                📍
              </div>
            </div>
            <button className="w-full p-2 bg-red-500 text-white rounded-lg mt-4" onClick={() => setIsModalOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
