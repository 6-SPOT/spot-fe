"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import API_Manager from "../../../lib/API_Manager";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import MapComponent from "@/components/MapComponent";

// API 응답 타입 정의
interface JobData {
  id: number;
  title: string;
  price: number;
  time: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("위치 확인 중...");
  const [zoomLevel, setZoomLevel] = useState(21);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // ✅ 현재 위치 가져오기 (GPS)
  const getCurrentLocation = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const coordinates = await Geolocation.getCurrentPosition();
        const userCoords = { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude };
        setLocation(userCoords);
        fetchAddress(userCoords.lat, userCoords.lng);
        fetchJobs(userCoords, zoomLevel);
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
            setLocation(userCoords);
            fetchAddress(userCoords.lat, userCoords.lng);
            fetchJobs(userCoords, zoomLevel);
          },
          (error) => console.error("❌ 위치 정보를 가져올 수 없습니다.", error)
        );
      }
    } catch (error) {
      console.error("❌ 위치 정보 오류:", error);
    }
  };

  // ✅ 리버스 지오코딩 (좌표 → 주소 변환)
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await API_Manager.get(
        "https://apis.openapi.sk.com/tmap/geo/reversegeocoding",
        {
          version: "1",
          format: "json",
          appKey: process.env.NEXT_PUBLIC_TMAP_API_KEY,
          coordType: "WGS84GEO",
          addressType: "A02",
          lat,
          lon: lng,
        },
        {}
      );
      setAddress(response.addressInfo.roadAddress || response.addressInfo.fullAddress);
    } catch (error) {
      console.error("❌ 주소 가져오기 실패:", error);
      setAddress("주소를 가져올 수 없습니다.");
    }
  };

  // ✅ 작업 목록 가져오기 (API 호출)
  const fetchJobs = async (coords: { lat: number; lng: number }, zoom: number) => {
    const params = {
      lat: coords.lat,
      lng: coords.lng,
      zoom,
      page: 0,
      size: 10,
      sort: "string",
    };
  
    const accessToken = localStorage.getItem("accessToken"); // ✅ 토큰 가져오기
  
    if (!accessToken) {
      console.error("❌ AccessToken이 없습니다. 로그인 필요.");
      return;
    }
  
    try {
      const response = await API_Manager.get("/api/job/worker/search", params, {
        Authorization: `Bearer ${accessToken}`, // ✅ 인증 추가
      });
  
      setTasks(response?.data?.content || []);
    } catch (error) {
      console.error("❌ 작업 목록 가져오기 실패:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
  

  // ✅ 지도에서 위치 선택 후 호출
  const handleConfirmLocation = (address: string, coords: { lat: number; lng: number }) => {
    setLocation(coords);
    setZoomLevel(21);
    setIsModalOpen(false);
    setAddress(address); // ✅ 새 위치의 주소 업데이트
    fetchJobs(coords, 21);
  };

  return (
    <div className="flex flex-col items-center p-4 w-full">
      {/* 상단 네비게이션 */}
      <div className="w-full flex justify-between items-center py-2">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => setIsModalOpen(true)}>
          {address}
        </h1>
        <button onClick={() => router.push("/notification")} className="p-2">🔔</button>
      </div>

      {/* ✅ 지도 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg w-4/5 h-3/5 flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-center p-2">📍 위치 선택</h2>
          <div className="flex-1 relative">
            <MapComponent mode="reverse-geocoding" onConfirm={handleConfirmLocation} />
          </div>
          <button className="w-full p-3 bg-red-500 text-white rounded-b-lg mt-2" onClick={() => setIsModalOpen(false)}>
            닫기
          </button>
        </div>
      </div>
      
      )}

      {/* 작업 목록 */}
      {/* ✅ 작업 목록 */}
{loading ? (
  <p>불러오는 중...</p>
) : (
  tasks.length > 0 ? (
    <div className="w-full mt-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex justify-between items-center p-4 border-b cursor-pointer"
          onClick={() => router.push(`/detail/${task.id}`)}
        >
          {/* 왼쪽: 작업 정보 */}
          <div className="flex-1">
            <p className="font-semibold">{task.title}</p>
            <p className="text-sm text-gray-500">{task.price ? task.price.toLocaleString() : "가격 미정"}</p>
            <p className="text-sm text-gray-500">{task.time ? task.time : "시간 정보 없음"}</p>
          </div>

          {/* 오른쪽: 작업 이미지 */}
          <div className="w-24 h-24 bg-gray-300 flex items-center justify-center">
            <Image 
              src={require("@/assets/image/chillguy.png")} 
              alt="작업 이미지" 
              width={96} 
              height={96} 
            />
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center mt-4">주변에 등록된 작업이 없습니다.</p>
  )
)}

    </div>
  );
}
