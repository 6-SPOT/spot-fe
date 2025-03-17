"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import API_Manager from "../../../lib/API_Manager";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import MapComponent from "@/components/MapComponent";
import { JobDetailData } from "@/types"; // API 응답 타입 정의


// API 응답 타입 정의
interface JobData {
  id: number;
  title: string;
  money: number;
  time: string;
  content: string;
  picture: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("위치 확인 중...");
  const [zoomLevel, setZoomLevel] = useState(17);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobDetail, setJobDetail] = useState<JobDetailData | null>(null);


  useEffect(() => {
    console.log("✅ useEffect 실행됨 - getCurrentLocation 호출");
    getCurrentLocation();
  }, []);

  // ✅ 현재 위치 가져오기 (GPS)
  const getCurrentLocation = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const coordinates = await Geolocation.getCurrentPosition();
        const userCoords = { lat: coordinates.coords.latitude, lng: coordinates.coords.longitude };
        console.log("✅ 위치 가져옴: ", userCoords);  // ✅ GPS 좌표 가져왔는지 확인
        setLocation(userCoords);
        fetchAddress(userCoords.lat, userCoords.lng);
        fetchJobs(userCoords, zoomLevel);
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
            console.log("✅ 위치 가져옴: ", userCoords);  // ✅ GPS 좌표 가져왔는지 확인
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
    console.log("🚀 fetchJobs 실행됨! 위치:", coords, "줌 레벨:", zoom); // ✅ 실행 여부 확인
    const params = {
      lat: coords.lat,
      lng: coords.lng,
      zoom,
      page: 0,
      size: 100,
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
  
      console.log("✅ API 응답 데이터:", response); // ✅ API 응답 데이터 확인
      setTasks(response?.data?.content || []);
    } catch (error) {
      console.error("❌ 작업 목록 가져오기 실패:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 작업 상세 API 호출하여 owner 여부 확인
  const checkOwnerAndNavigate = async (taskId: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("❌ AccessToken이 없습니다. 로그인 필요.");
        return;
      }

      // API 요청
      const response = await API_Manager.get(`/api/job/worker/get`, { id: taskId }, {
        Authorization: `Bearer ${accessToken}`,
      });

      console.log("✅ 작업 상세 데이터:", response);
      
      // ✅ owner 값 확인 후 이동 처리
      if (response?.data?.owner) {
        router.push(`/tasks/request/${taskId}`); // 본인이 등록한 작업이면 Request 페이지로 이동
      } else {
        router.push(`/detail/${taskId}`); // 일반 상세 페이지로 이동
      }
    } catch (error) {
      console.error("❌ 작업 상세 가져오기 실패:", error);
      router.push(`/detail/${taskId}`); // 오류 시 기본 상세 페이지로 이동
    }
  };
  
  // ✅ 줌 레벨이 변경될 때 상태 업데이트
  const handleZoomChange = (zoom: number) => {
    console.log("🔍 줌 레벨 변경됨:", zoom);
    setZoomLevel(zoom);
  };

  // ✅ "확인" 버튼을 눌렀을 때 최신 줌 레벨 반영
  const handleConfirmLocation = (address: string, coords: { lat: number; lng: number }, zoom: number) => {
    console.log("🟢 확인 버튼 클릭됨. 최신 줌 레벨:", zoomLevel);

    setZoomLevel(zoom);
    setLocation(coords);
    setIsModalOpen(false);
    setAddress(address);

    fetchJobs(coords, zoomLevel); // ✅ 최신 줌 레벨을 반영하여 API 호출
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
            <MapComponent mode="reverse-geocoding" onConfirm={handleConfirmLocation} onZoomChange={handleZoomChange}/>
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
          onClick={() => checkOwnerAndNavigate(task.id)}
        >
          {/* 왼쪽: 작업 정보 */}
          <div className="flex-1">
            <p className="font-semibold">{task.title}</p>
            <p className="text-sm text-gray-500">{task.money ? task.money.toLocaleString() : "가격 미정"}</p>
            <p className="text-sm text-gray-500">{task.content ? task.content : "내용 없음"}</p>
          </div>

          {/* 오른쪽: 작업 이미지 */}
          <div className="w-24 h-24 bg-gray-300 flex items-center justify-center">
            <Image 
              src={task.picture} 
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
