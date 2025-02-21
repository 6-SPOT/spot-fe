"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecruitPage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("의뢰 위치 선택");
  const [fee, setFee] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // 이미지 업로드 핸들러
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 의뢰 위치 선택 (실제 지도 기능 연결 필요)
  const handleLocationSelect = () => {
    // 여기에 지도 팝업 로직 추가 가능
    setLocation("서울특별시 강남구 테헤란로 123"); // 예제 주소
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">구인 등록</h1>

      {/* 이미지 업로드 */}
      <div className="w-full flex flex-col items-center">
        <label className="w-full max-w-md h-48 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer">
          {imagePreview ? (
            <img src={imagePreview} alt="업로드 이미지" className="w-full h-full object-cover rounded-lg" />
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
          onClick={handleLocationSelect}
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

      {/* 해결사 선택 버튼 */}
      <button
        onClick={() => router.push("/recruit/select_helper")}
        className="mt-6 p-3 bg-blue-500 text-white rounded-lg w-full max-w-md"
      >
        해결사 선택
      </button>
    </div>
  );
}
