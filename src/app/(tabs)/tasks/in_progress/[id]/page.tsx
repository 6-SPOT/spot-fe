"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import SockJS from "sockjs-client";
import * as Stomp from "webstomp-client";
import {API_Manager} from "@/lib/API_Manager";

declare global {
  interface Window {
    Tmapv2: any;
    mapInstance?: any;
    solverMarker?: any;
  }
}

const TMAP_API_KEY = process.env.NEXT_PUBLIC_TMAP_API_KEY;
const WS_SERVER_URL = `${process.env.NEXT_PUBLIC_API_URL}api/connect`; // ✅ 팀원의 WebSocket 경로 적용

export default function TaskInProgressPage() {
  const router = useRouter();
  const { id } = useParams(); // 작업 ID

  const mapRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [stompClient, setStompClient] = useState<Stomp.Client | null>(null);

  const [isJobStarted, setIsJobStarted] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 🔹 작업 위치 (서울 시청)
  const [taskLocation, setTaskLocation] = useState<{lat: number; lng: number;}>({ lat: 37.5665, lng: 126.9780 });
  // 🔹 해결사 초기 위치 (강남역)
  const [solverLocation, setSolverLocation] = useState<{lat: number; lng: number;}>({ lat: 37.4979, lng: 127.0276 });

  const searchParams = useSearchParams();
  const isOwner = searchParams.get("owner") === "true"; // URL에서 owner 값을 가져옴

  /** 📌 작업 상세 정보 가져오기 */
  const fetchJobDetails = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await API_Manager.get(
        `/api/job/worker/get?id=${id}`,
        {},
        {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        }
      );

      if (response.status === "success") {
        console.log("📌 작업 좌표 불러오기 성공:", response.data);
        setTaskLocation({ lat: response.data.lat, lng: response.data.lng });
        initMap(response.data.lat, response.data.lng);
      }
    } catch (error) {
      console.error("❌ 작업 좌표 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchJobDetails();
    console.log("✅ Tmap API 키:", TMAP_API_KEY);

    if (!TMAP_API_KEY) {
      console.error("❌ Tmap API 키가 설정되지 않았습니다.");
      return;
    }

    if (window.Tmapv2 && typeof window.Tmapv2.LatLng === "function") {
      console.log("✅ Tmap이 이미 로드됨, 지도 생성 시작");
    } else {
      console.log("📢 Tmap 스크립트 추가 로드");
      const script = document.createElement("script");
      script.id = "tmap-script";
      script.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${TMAP_API_KEY}`;
      script.async = true;
      script.onload = () => {
        console.log("✅ Tmap API 로드 완료");
        if (taskLocation) {
          initMap(taskLocation.lat, taskLocation.lng);
        }
      };
      script.onerror = () => console.error("❌ Tmap API 로드 실패");
      document.head.appendChild(script);
    }

    connectStompWebSocket();
    startTrackingSolverLocation();

    return () => {
      disconnectStompWebSocket();
    };
  }, []);

  /** 🗺️ Tmap 지도 초기화 */
  const initMap = (taskLat: number, taskLng: number) => {
    if (!window.Tmapv2 || typeof window.Tmapv2.LatLng !== "function") {
      console.error("❌ Tmap 라이브러리가 아직 로드되지 않았습니다.");
      return;
    }

    console.log("✅ Tmap 지도 생성 시작");

    if (!mapRef.current) {
      console.error("❌ mapRef가 아직 연결되지 않음");
      return;
    }

    // ✅ 기존 지도 인스턴스 제거 후 새로 생성
    if (window.mapInstance) {
      console.log("🔄 기존 지도 삭제 후 재초기화");
      window.mapInstance.destroy();
      window.mapInstance = null;
    }

    if (!window.mapInstance) {
      window.mapInstance = new window.Tmapv2.Map(mapRef.current, {
        center: new window.Tmapv2.LatLng(taskLat, taskLng),
        width: "100%",
        height: "400px",
        zoom: 13,
      });

      console.log("✅ 지도 초기화 완료");

      // 🔹 작업 위치 마커 추가
      new window.Tmapv2.Marker({
        position: new window.Tmapv2.LatLng(taskLat, taskLng),
        map: window.mapInstance,
        title: "작업 위치",
      });

      // 🔹 해결사 위치 마커 추가
      const solverMarkerInstance = new window.Tmapv2.Marker({
        position: new window.Tmapv2.LatLng(0, 0),
        map: window.mapInstance,
        title: "해결사 위치",
      });

      window.solverMarker = solverMarkerInstance;
    }
  };

  /** 🔌 WebSocket 연결 */
  const connectStompWebSocket = () => {
    if (stompClient && stompClient.connected) {
      console.log("⚠️ 이미 STOMP WebSocket이 연결됨");
      return;
    }
  
    console.log("🟢 WebSocket 연결 시도:", WS_SERVER_URL);
  
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("❌ Access Token 없음 - WebSocket 연결 실패");
      return;
    }
  
    // ✅ SockJS WebSocket 생성
    const sockJs = new SockJS(WS_SERVER_URL);
    const client = Stomp.over(sockJs);
  
    // ✅ ConnectionHeaders 타입 지정
    const headers: Stomp.ConnectionHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  
    client.connect(
      headers,
      () => {
        console.log("✅ WebSocket 연결 성공");
        setStompClient(client);
        setIsConnected(true);
  
        // ✅ 구독 설정
        const topic = `/api/topic/job/${id}`;
        client.subscribe(
          topic,
          (message: Stomp.Message) => {
            const data = JSON.parse(message.body);
            console.log("🔄 WebSocket 수신 데이터:", data);
            
            if (data.lat && data.lng) {
              console.log("📍 해결사 실시간 위치 업데이트:", data.lat, data.lng);
              updateSolverLocation(data.lat, data.lng);
            }

            if (data.url) {
              console.log("📸 새 작업 증명 사진 추가됨:", data.url);
              setUploadedImages((prevImages) => [...prevImages, data.url]); // 새로운 이미지 추가
            }
          },
          headers // ✅ 헤더 포함
        );
      },
      (error: Stomp.Frame | CloseEvent) => {
        console.error("❌ WebSocket 연결 실패:", error);
      }
    );
  };
  

  /** ❌ WebSocket 연결 해제 */
  const disconnectStompWebSocket = () => {
    console.log("🔴 WebSocket 연결 해제");

    try {
      if (stompClient && stompClient.connected) {
        stompClient.unsubscribe(`/api/topic/job/${id}`);
        stompClient.disconnect();
        console.log("✅ WebSocket 정상적으로 종료됨");
        setIsConnected(false);
      }
    } catch (error) {
      console.error("❌ WebSocket 종료 중 오류 발생:", error);
    }
  };

  /** 📍 해결사 위치 실시간 업데이트 */
  const updateSolverLocation = (lat: number, lng: number) => {
    setSolverLocation({ lat, lng });

    if (window.solverMarker) {
      window.solverMarker.setPosition(new window.Tmapv2.LatLng(lat, lng));
    }
  };

  /** 📡 해결사의 GPS 추적 시작 */
  const startTrackingSolverLocation = () => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocation API를 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("📍 해결사 현재 위치:", latitude, longitude);

        setSolverLocation({ lat: latitude, lng: longitude });

        if (stompClient && stompClient.connected) {
          stompClient.send(
            `/api/topic/job/${id}/location`,
            JSON.stringify({ lat: latitude, lng: longitude })
          );
        }
      },
      (error) => {
        console.error("❌ GPS 추적 실패:", error);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  }

  // 작업 시작 API 호출
  const startJob = async () => {
    try {
      if (!id) {
        console.error("❌ 작업 ID가 존재하지 않습니다.");
        return;
      }
  
      console.log("📝 작업 시작 요청:", id);
  
      const accessToken = localStorage.getItem("accessToken");
      const response = await API_Manager.post(
        "/api/job/worker/start",
        { jobId: id },
        {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        }
      );
  
      console.log("✅ 작업 시작 성공:", response);
      setIsJobStarted(true);
    } catch (error) {
      console.error("❌ 작업 시작 실패:", error);
    }
  };

  /** 작업 완료 승인/반려 */
  const confirmOrRejectJob = async (isConfirmed: boolean) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await API_Manager.patch("/api/job/confirm-or-reject", {
        jobId: id,
        isYes: isConfirmed,
      }, {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      });

      alert(isConfirmed ? "작업이 승인되었습니다." : "작업이 반려되었습니다.");
      router.push("/tasks");
    } catch (error) {
      console.error("❌ 작업 승인/반려 실패:", error);
    }
  };

  // ✅ 작업 증명 제출 버튼 클릭 시 파일 선택창 열기
  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // 파일 선택 창 열기
    }
  };

/** ✅ 작업 증명 파일 업로드 API 호출 */
const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files || event.target.files.length === 0) return;

  const imageFile = event.target.files[0];
  const accessToken = localStorage.getItem("accessToken");
  const formData = new FormData();

  formData.append("file", imageFile);
  formData.append("request", JSON.stringify({ jobId: id }));

  try {
    const response = await API_Manager.post("/api/job/worker/certificate", formData, {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    });

    console.log("✅ 작업 증명 제출 성공:", response);

    if (response.data.url) {
      // 🔹 기존 배열을 새로운 배열로 업데이트 (불변성 유지)
      setUploadedImages((prevImages) => [...prevImages, response.data.url]);
    } else {
      console.error("⚠️ 응답 데이터에 imageUrl이 없음:", response);
    }

    // 🔹 파일 input 초기화 (같은 파일 다시 업로드 가능하도록)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    alert("작업 증명 사진이 제출되었습니다.");
  } catch (error) {
    console.error("❌ 작업 증명 제출 실패:", error);
  }
};

  

return (
  <div className="flex flex-col p-4">
    <h1 className="text-xl font-bold">이거 해주세요</h1>

    {/* ✅ WebSocket 상태 표시 */}
    <div className="mt-2 text-sm">
      {isConnected ? (
        <p className="text-green-500">✅ WebSocket 연결됨</p>
      ) : (
        <p className="text-red-500">❌ WebSocket 미연결</p>
      )}
    </div>

    {/* ✅ 지도 표시 */}
    <div ref={mapRef} id="tmap" className="w-full mt-4 rounded-lg" style={{ height: "400px" }}></div>

    {/* ✅ 해결사 UI */}
    {!isOwner ? (
      <>
        {/* ✅ 작업 시작 버튼 */}
        <button
          onClick={startJob}
          disabled={isJobStarted}
          className={`mt-4 px-4 py-2 rounded-lg text-white ${
            isJobStarted ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isJobStarted ? "작업 시작됨" : "작업 시작"}
        </button>

        {/* ✅ 작업 증명 제출 버튼 */}
        <button
          onClick={handleUploadButtonClick}
          className="mt-2 px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600"
        >
          작업 증명 제출
        </button>

        {/* ✅ 실제 파일 선택 Input (숨김 처리) */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </>
    ) : (
      <>
        {/* ✅ 작업 완료 승인/반려 버튼 (의뢰자만 사용) */}
        <div className="mt-4 flex gap-4">
          <button onClick={() => confirmOrRejectJob(true)} className="px-4 py-2 rounded-lg text-white bg-green-500">
            작업 승인
          </button>
          <button onClick={() => confirmOrRejectJob(false)} className="px-4 py-2 rounded-lg text-white bg-red-500">
            작업 반려
          </button>
        </div>
      </>
    )}

    {/* ✅ 작업 증명 사진 목록 (해결사/의뢰자 공통) */}
    {uploadedImages.length > 0 ? (
      <div className="mt-4">
        <h2 className="text-lg font-bold">제출된 작업 증명 사진</h2>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {uploadedImages.map((url, index) => (
            <img key={index} src={url} alt="작업 증명" className="w-full rounded-lg" />
          ))}
        </div>
      </div>
    ) : (
      <p className="text-gray-500 mt-4">아직 제출된 작업 증명 사진이 없습니다.</p>
    )}
  </div>
);
}
