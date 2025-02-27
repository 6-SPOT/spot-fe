"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

  // ✅ 위치 선택 핸들러
  const handleConfirmLocation = (address: string, coords: { lat: number; lng: number }) => {
    setLocation(address);
    setSelectedCoords(coords);
    setIsModalOpen(false);
  };

  // ✅ 데이터 `sessionStorage`에 저장 후 이동
  const handleNext = () => {
    if (!description || !fee || !selectedCoords || !imageFile) {
      alert("모든 필드를 입력하고 이미지를 업로드하세요.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = () => {
      const imageBase64 = reader.result;

      const data = {
        description,
        fee,
        selectedCoords,
        location,
        imageBase64, // ✅ Base64로 변환하여 저장
        imageType: imageFile.type, // ✅ 파일 타입 저장
        imageName: imageFile.name, // ✅ 파일 이름 저장
      };

      sessionStorage.setItem("recruitData", JSON.stringify(data));
      router.push("/recruit/select_helper");
    };
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">구인 등록</h1>

      {/* ✅ 이미지 업로드 */}
      <label className="w-full max-w-md h-48 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer">
        {imagePreview ? (
          <Image src={imagePreview} alt="업로드 이미지" width={150} height={150} className="object-cover rounded-lg" />
        ) : (
          <span className="text-gray-500">사진을 업로드하세요</span>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
          }
        }} />
      </label>

      {/* ✅ 의뢰 내용 입력 */}
      <div className="w-full max-w-md mt-4">
        <label className="block font-semibold">📌 의뢰 내용</label>
        <textarea
          className="w-full p-2 border rounded-lg mt-2"
          rows={4}
          placeholder="의뢰 내용을 입력하세요."
          value={description}
          onChange={(e) => setDescription(e.target.value)} />
      </div>

      {/* ✅ 위치 선택 */}
      <div className="w-full max-w-md mt-4">
        <label className="block font-semibold">📍 의뢰 위치</label>
        <button
          className="w-full p-2 border rounded-lg mt-2 text-left"
          onClick={() => setIsModalOpen(true)}
        >
          {location}
        </button>
      </div>
      
      {/* ✅ 보수 입력 */}
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

      {/* ✅ 지도 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg w-4/5 h-3/5 relative">
            <h2 className="text-xl font-bold mb-4">📍 위치 확인</h2>
            <div className="w-full h-64 relative">
              <MapComponent mode="reverse-geocoding" onConfirm={handleConfirmLocation} />
            </div>
            <button className="w-full p-2 bg-red-500 text-white rounded-lg mt-4" onClick={() => setIsModalOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      )}

      {/* ✅ 다음 페이지 이동 버튼 */}
      <button onClick={handleNext} className="mt-6 p-3 bg-blue-500 text-white rounded-lg w-full max-w-md">
        다음 단계로 이동
      </button>
    </div>
  );
}
