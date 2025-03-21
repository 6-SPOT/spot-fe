"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import API_Manager from "@/lib/API_Manager";
import { ABILITIES } from "./abilities"; // ✅ ENUM 목록 불러오기

export default function MyPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const [strong, setStrong] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ GPS 좌표 가져오기
  useEffect(() => {
    if (isModalOpen) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLat(position.coords.latitude);
            setLng(position.coords.longitude);
          },
          (error) => {
            console.error("GPS 오류:", error);
            alert("위치를 가져올 수 없습니다. 위치 서비스를 활성화해주세요.");
          }
        );
      } else {
        alert("이 브라우저에서는 위치 서비스를 지원하지 않습니다.");
      }
    }
  }, [isModalOpen]);

  // ✅ 강점 체크박스 핸들러
  const handleStrongChange = (value: string) => {
    setStrong((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

    // ✅ 로그아웃 함수 추가
    const handleLogout = () => {
      if (window.confirm("정말 로그아웃하시겠습니까?")) {
        localStorage.removeItem("accessToken"); // ✅ 토큰 삭제
        router.push("/login"); // ✅ 로그인 페이지로 이동
      }
    };

  // ✅ 해결사 등록 API 호출
  const handleRegister = async () => {
    if (!lat || !lng || !content || strong.length === 0) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
  
    if (loading) {
      alert("⚠️ 등록 요청을 처리 중입니다. 잠시만 기다려주세요.");
      return;
    }
  
    setLoading(true);
  
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
      }
  
      console.log("📢 PUT 요청 전송 중...");
  
      const response = await API_Manager.put(
        "/api/job/worker/register",
        { lat, lng, content, strong },
        { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }
      );
  
      console.log("📢 해결사 등록 응답:", response.data); // ✅ `response.data` 그대로 사용
  
      // ✅ 서버 응답을 그대로 처리
      alert(`✅ ${response.message}`);
      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ 해결사 등록 중 오류 발생:", error);
      alert("🚨 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold">마이 페이지</h1>

      <div className="w-full mt-4 p-4 bg-gray-200 rounded-lg">
        <p>📌 닉네임</p>
        <p>⭐ 평점</p>
        <p>📊 구인 횟수 | 구직 횟수</p>
      </div>

      <div className="mt-4 space-y-2">
        <button onClick={() => router.push("/mypage/history")} className="w-full text-left p-2 border-b">
          히스토리
        </button>
        <button onClick={() => router.push("/mypage/reviews")} className="w-full text-left p-2 border-b">
          리뷰 확인
        </button>
        <button onClick={() => router.push("/mypage/favorites")} className="w-full text-left p-2 border-b">
          찜 목록
        </button>
        <button onClick={() => setIsModalOpen(true)} className="w-full text-left p-2 border-b">
          해결사 등록
        </button>
        <button onClick={handleLogout} className="w-full text-left p-2 border-b">
          로그아웃
        </button>
        <button className="w-full text-left p-2 border-b text-red-500">회원 탈퇴</button>
      </div>

      {/* ✅ 해결사 등록 모달 */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)} />

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg w-4/5 max-w-md z-50 flex flex-col max-h-[70vh]">
            <h2 className="text-xl font-bold p-4 border-b">🛠 해결사 등록</h2>

            {/* ✅ 모달 내부 내용 (스크롤 가능) */}
            <div className="p-4 overflow-y-auto flex-1">
              <div className="mb-2">
                <label className="block text-sm font-medium">📍 위치 정보</label>
                <p className="text-gray-500">{lat && lng ? `위도: ${lat}, 경도: ${lng}` : "위치 정보를 가져오는 중..."}</p>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium">📜 자기소개</label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="자신을 소개해주세요"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium">🎯 강점 선택</label>
                <div className="grid grid-cols-2 gap-2">
                  {ABILITIES.map(({ value, label }) => (
                    <label key={value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={strong.includes(value)}
                        onChange={() => handleStrongChange(value)}
                        className="w-4 h-4"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* ✅ 버튼 영역: 항상 하단 고정 */}
            <div className="border-t bg-white p-4">
              <button
                className="w-full p-2 bg-blue-500 text-white rounded-lg"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? "등록 중..." : "등록하기"}
              </button>
              <button className="w-full p-2 bg-gray-300 rounded-lg mt-2" onClick={() => setIsModalOpen(false)}>
                닫기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
