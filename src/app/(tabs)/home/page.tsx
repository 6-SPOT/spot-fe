"use client";

import { useEffect, useState, useRef, useCallback } from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import API_Manager from "../../../lib/API_Manager";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import MapComponent from "@/components/MapComponent";
import { JobDetailData } from "@/types"; // API 응답 타입 정의
import { useInView } from "react-intersection-observer";

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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("위치 확인 중...");
  const [zoomLevel, setZoomLevel] = useState(17);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobDetail, setJobDetail] = useState<JobDetailData | null>(null);
  const [isTmapLoaded, setIsTmapLoaded] = useState(false);

  const { ref, inView } = useInView();


  // ✅ Geolocation 동적 import
  useEffect(() => {
    const fetchLocation = async () => {
      if (typeof window === "undefined") return;

      try {
        const isNative = (await import("@capacitor/core")).Capacitor.isNativePlatform();

        if (isNative) {
          const { Geolocation } = await import("@capacitor/geolocation");
          const coordinates = await Geolocation.getCurrentPosition();
          const coords = {
            lat: coordinates.coords.latitude,
            lng: coordinates.coords.longitude,
          };
          setLocation(coords);
          fetchAddress(coords.lat, coords.lng);
          fetchJobs(0, coords, zoomLevel, true);
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setLocation(coords);
              fetchAddress(coords.lat, coords.lng);
              fetchJobs(0, coords, zoomLevel, true);
            },
            (error) => console.error("❌ 위치 가져오기 실패", error)
          );
        }
      } catch (err) {
        console.error("❌ 위치 정보 에러:", err);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    if (inView && hasMore && location) {
      fetchJobs(page, { lat: location.lat, lng: location.lng }, zoomLevel, false);
    }
  }, [inView, hasMore, location]);
  
  useEffect(() => {
    console.log("✅ Tmap 로딩 체크");

    if (window.Tmapv2 && typeof window.Tmapv2.LatLng === "function") {
      console.log("✅ Tmap이 이미 로드됨");
      setIsTmapLoaded(true);
      return;
    }

    console.log("📢 Tmap 스크립트 추가 로드");
    const script = document.createElement("script");
    script.id = "tmap-script";
    script.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${process.env.NEXT_PUBLIC_TMAP_API_KEY}`;
    script.async = true;
    script.onload = () => {
      console.log("✅ Tmap API 로드 완료");
      setIsTmapLoaded(true);
    };
    script.onerror = () => console.error("❌ Tmap API 로드 실패");
    document.head.appendChild(script);
  }, []);

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
  const fetchJobs = async (newPage: number, coords: { lat: number; lng: number }, zoom: number, isFirstLoad: boolean) => {
    console.log("🚀 fetchJobs 실행됨! 위치:", coords, "줌 레벨:", zoom);
    const params = {
      lat: coords.lat,
      lng: coords.lng,
      zoom,
      page: newPage,
      size: 20,
      sort: "string",
    };
  
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("❌ AccessToken이 없습니다. 로그인 필요.");
      return;
    }
  
    try {
      const response = await API_Manager.get("/api/job/worker/search", params, {
        Authorization: `Bearer ${accessToken}`,
      });
  
      const newJobs: JobData[] = response.data.content || [];
      console.log("추가 데이터 불러옴 : ", newJobs.length);
  
      if (newJobs.length > 0) {
        const uniqueJobs: JobData[] = Array.from(
          new Map<number, JobData>([
            ...tasks.map((task) => [task.id, task] as [number, JobData]),
            ...newJobs.map((task) => [task.id, task] as [number, JobData]),
          ]).values()
        );
        setTasks(uniqueJobs);
        setPage(newPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("❌ 작업 목록 가져오기 실패:", error);
      setTasks([]);
    } finally {
      setLoading(false);
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
    if(location){
      setPage(0);
      setTasks([]);
      setHasMore(true);
      setLocation(coords);
      setIsModalOpen(false);
      setAddress(address);

      fetchJobs(0, { lat: location.lat, lng: location.lng }, zoom, true); // ✅ 최신 줌 레벨을 반영하여 API 호출
    }
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
              {/* ✅ Tmap이 로드된 이후에만 MapComponent 렌더링 */}
              {isTmapLoaded && (
                <MapComponent mode="reverse-geocoding" onConfirm={handleConfirmLocation} onZoomChange={handleZoomChange} />
              )}
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
            {hasMore && <div ref={ref} className="h-10 flex justify-center items-center text-gray-500">불러오는 중...</div>}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-4">주변에 등록된 작업이 없습니다.</p>
        )
      )}
    </div>
);

}
