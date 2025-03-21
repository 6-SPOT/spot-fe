"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MapComponent from "@/components/MapComponent";
import API_Manager from "@/lib/API_Manager";

export default function RecruitPage() {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("의뢰 위치 선택");
  const [fee, setFee] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [payPoint, setPayPoint] = useState<string>("");
  const [userPoints, setUserPoints] = useState<number | null>(0);

  // ✅ 사용자의 포인트 가져오기
  useEffect(() => {
    const fetchUserPoints = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      try {
        const response = await API_Manager.get("/api/user/points", {
          Authorization: `Bearer ${token}`,
        });

        setUserPoints(response.data.points);
      } catch (error) {
        console.error("❌ 포인트 조회 실패:", error);
        alert("포인트 정보를 가져오는 데 실패했습니다.");
      }
    };

    fetchUserPoints();
  }, []);

  // ✅ 위치 선택 핸들러
  const handleConfirmLocation = (address: string, coords: { lat: number; lng: number }) => {
    setLocation(address);
    setSelectedCoords(coords);
    setIsModalOpen(false);
  };

  // ✅ 사용 포인트 입력 시 검증
  const handlePayPointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPayPoint(value);
  };

  // ✅ 데이터 `sessionStorage`에 저장 후 이동
  const handleNext = async () => {
    if (!title || !description || !fee || !payPoint|| !selectedCoords || !imageFile) {
      alert("모든 필드를 입력하고 이미지를 업로드하세요.");
      return;
    }

    if (userPoints !== null && Number(payPoint) > userPoints) {
      alert("⚠️ 사용 가능한 포인트를 초과할 수 없습니다. 다시 입력해주세요.");
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
      title ,
      content: description,
      money: Number(fee),
      point: Number(payPoint),
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

      const { jobId } = response.data;

      // if (!redirectMobileUrl || !redirectPCUrl) {
      // throw new Error("서버에서 반환된 URL이 없습니다.");
      // }

      // 모바일/PC 환경 판별 후 URL 실행
      // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      // if (isMobile) {
      //   console.log("📱 모바일 환경: ", redirectMobileUrl);
      //   window.location.href = redirectMobileUrl;
      // } else {
      //   console.log("💻 PC 환경: ", redirectPCUrl);
      //   window.location.href = redirectPCUrl;
      // }
      localStorage.setItem("jobTitle", description);
      localStorage.setItem("totalAmount", fee);
      localStorage.setItem("jobId", jobId);

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

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = () => {
      const imageBase64 = reader.result;

      const data = {
        description,
        fee,
        payPoint,
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

      {/* ✅ 제목 입력 */}
      <div className="w-full max-w-md mt-4">
        <label className="block font-semibold">📌 제목</label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg mt-2"
          placeholder="제목을 입력하세요."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

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

      {/* ✅ 사용 포인트 입력 */}
      <div className="w-full max-w-md mt-4">
        <div className="flex justify-between items-center">
          <label className="block font-semibold">💰 포인트 사용</label>
          {userPoints !== null && (
            <span className="text-gray-700 text-sm font-semibold">
              보유: {userPoints} P
            </span>
          )}
        </div>
        <input
          type="number"
          className="w-full p-2 border rounded-lg mt-2"
          placeholder="사용할 포인트를 입력하세요."
          value={payPoint}
          onChange={handlePayPointChange}
        />
        {/* 초과 시 경고 메시지 표시 */}
        {userPoints !== null && Number(payPoint) > userPoints && (
          <p className="text-red-500 text-sm mt-1">⚠️ 사용 가능한 포인트를 초과했습니다. 다시 입력하세요.</p>
        )}
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

