"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import SockJS from "sockjs-client";
import * as Stomp from "webstomp-client";

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

  // 🔹 작업 위치 (서울 시청)
  const taskLocation = { lat: 37.5665, lng: 126.9780 };
  // 🔹 해결사 초기 위치 (강남역)
  const solverLocation = { lat: 37.4979, lng: 127.0276 };

  useEffect(() => {
    console.log("✅ Tmap API 키:", TMAP_API_KEY);

    if (!TMAP_API_KEY) {
      console.error("❌ Tmap API 키가 설정되지 않았습니다.");
      return;
    }

    if (window.Tmapv2 && typeof window.Tmapv2.LatLng === "function") {
      console.log("✅ Tmap이 이미 로드됨, 지도 생성 시작");
      initMap();
    } else {
      console.log("📢 Tmap 스크립트 추가 로드");
      const script = document.createElement("script");
      script.id = "tmap-script";
      script.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${TMAP_API_KEY}`;
      script.async = true;
      script.onload = () => {
        console.log("✅ Tmap API 로드 완료");
        initMap();
      };
      script.onerror = () => console.error("❌ Tmap API 로드 실패");
      document.head.appendChild(script);
    }

    connectStompWebSocket();

    return () => {
      disconnectStompWebSocket();
    };
  }, []);

  /** 🗺️ Tmap 지도 초기화 */
  const initMap = () => {
    if (!window.Tmapv2 || typeof window.Tmapv2.LatLng !== "function") {
      console.error("❌ Tmap 라이브러리가 아직 로드되지 않았습니다.");
      return;
    }

    console.log("✅ Tmap 지도 생성 시작");

    if (!mapRef.current) {
      console.error("❌ mapRef가 아직 연결되지 않음");
      return;
    }

    if (!window.mapInstance) {
      window.mapInstance = new window.Tmapv2.Map(mapRef.current, {
        center: new window.Tmapv2.LatLng(taskLocation.lat, taskLocation.lng),
        width: "100%",
        height: "400px",
        zoom: 13,
      });

      console.log("✅ 지도 초기화 완료");

      // 🔹 작업 위치 마커 추가
      new window.Tmapv2.Marker({
        position: new window.Tmapv2.LatLng(taskLocation.lat, taskLocation.lng),
        map: window.mapInstance,
        title: "작업 위치",
      });

      // 🔹 해결사 위치 마커 추가
      const solverMarkerInstance = new window.Tmapv2.Marker({
        position: new window.Tmapv2.LatLng(solverLocation.lat, solverLocation.lng),
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
            updateSolverLocation(data.lat, data.lng);
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

  /** 📍 해결사 위치 업데이트 */
  const updateSolverLocation = (lat: number, lng: number) => {
    console.log(`📍 해결사 위치 업데이트: ${lat}, ${lng}`);

    if (window.solverMarker) {
      window.solverMarker.setPosition(new window.Tmapv2.LatLng(lat, lng));
    } else {
      console.warn("⚠️ 해결사 마커가 아직 생성되지 않음!");
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
    </div>
  );
}
