"use client";

import { useEffect, useRef, useState } from "react";
import API_Manager from "../lib/API_Manager";

declare global {
  interface Window {
    Tmapv2: any;
  }
}

interface MapComponentProps {
  mode: "geocoding" | "reverse-geocoding";
  address?: string;
  onConfirm?: (address: string, coords: { lat: number; lng: number }, currentZoom: number) => void;
  onZoomChange?: (zoom: number) => void;
}

export default function MapComponent({ mode, address, onConfirm, onZoomChange }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [centerCoords, setCenterCoords] = useState({ lat: 37.402399, lng: 127.101112 });
  const [currentAddress, setCurrentAddress] = useState("주소 검색 중...");
  const TMAP_API_KEY = process.env.NEXT_PUBLIC_TMAP_API_KEY;

  useEffect(() => {
    if (!mapRef.current) return;

    console.log("🟢 지도 생성 요청");

    // ✅ 기존 Tmap이 로드된 상태라면 새로 추가하지 않고 그대로 사용
    if (window.Tmapv2 && typeof window.Tmapv2.LatLng === "function") {
      console.log("✅ Tmap이 이미 로드됨, 기존 인스턴스 유지");
      if (!mapInstanceRef.current) initializeMap(); // 지도 인스턴스가 없으면 새로 생성
      return;
    }

    // ✅ Tmap 스크립트가 이미 추가되었는지 확인
    if (!document.getElementById("tmap-script")) {
      console.log("📢 Tmap 스크립트 추가 로드");
      const script = document.createElement("script");
      script.id = "tmap-script";
      script.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${TMAP_API_KEY}`;
      script.async = true;
      script.onload = () => {
        console.log("✅ Tmap API 로드 완료");
        initializeMap();
      };
      script.onerror = () => {
        console.error("❌ Tmap API 로드 실패");
        document.head.removeChild(script);
      };
      document.head.appendChild(script);
    }
  }, [mode]); // mode 변경 시마다 실행


  const initializeMap = () => {
    if (!mapRef.current) {
      console.error("🚨 mapRef가 존재하지 않음, 지도 초기화 중단");
      return;
    }

    if (!window.Tmapv2 || typeof window.Tmapv2.LatLng !== "function") {
      console.error("🚨 Tmap 라이브러리가 완전히 로드되지 않음. 초기화 중단");
      return;
    }

    console.log("🗺 지도 초기화 진행");

    if (mapInstanceRef.current) {
      console.log("⚠️ 기존 지도 인스턴스가 존재하여 새로 생성하지 않음");
      return;
    }

    const newMapInstance = new window.Tmapv2.Map(mapRef.current, {
      center: new window.Tmapv2.LatLng(centerCoords.lat, centerCoords.lng),
      width: "100%",
      height: "100%",
      zoom: 17,
      httpsMode: true,
    });

    mapInstanceRef.current = newMapInstance;

    if (mode === "geocoding") {
        console.log("📍 Detail 페이지 - 마커 추가");
        if (!markerRef.current) {
          markerRef.current = new window.Tmapv2.Marker({
            position: new window.Tmapv2.LatLng(centerCoords.lat, centerCoords.lng),
            map: newMapInstance,
          });
        } else {
          markerRef.current.setMap(newMapInstance);
        }
    }

    if (mode === "reverse-geocoding") {
      window.Tmapv2.event.addListener(newMapInstance, "dragend", () => {
        const newCenter = newMapInstance.getCenter();
        setCenterCoords({ lat: newCenter.lat(), lng: newCenter.lng() });
        console.log("🔄 지도 이동, 새로운 좌표:", newCenter.lat(), newCenter.lng());
      });
    }

    window.Tmapv2.event.addListener(newMapInstance, "zoom_changed", () => {
      const newZoomLevel = newMapInstance.getZoom();
      console.log("🔍 줌 레벨 변경:", newZoomLevel);
      if (onZoomChange) {
        onZoomChange(newZoomLevel);
      }
    });

    console.log("✅ 지도 로드 완료");
};



  // ✅ "확인" 버튼을 눌렀을 때 Reverse Geocoding 실행
  const handleConfirmClick = async () => {
    if (!mapInstanceRef.current) {
      console.error("🚨 지도 인스턴스를 찾을 수 없습니다.");
      return;
    }
  
    // ✅ 최신 지도 중심 좌표를 직접 가져옴
    const newCenter = mapInstanceRef.current.getCenter();
    const latestCoords = { lat: newCenter.lat(), lng: newCenter.lng() };
  
    console.log("✅ 확인 버튼 클릭됨. 최신 좌표:", latestCoords);
  
    const currentZoom = mapInstanceRef.current.getZoom();
    console.log("✅ 확인 버튼 클릭됨. 최신 좌표:", latestCoords, "줌 레벨:", currentZoom);

    const address = await requestReverseGeocoding(latestCoords.lat, latestCoords.lng);
    if (address && onConfirm) {
      onConfirm(address, latestCoords, currentZoom);
    }
  };
  

  async function requestReverseGeocoding(lat: number, lng: number) {
    if (!TMAP_API_KEY) {
      console.error("🚨 TMAP_API_KEY가 없습니다.");
      return "주소를 가져올 수 없습니다.";
    }
  
    console.log("🔄 Reverse Geocoding 요청 시작:", lat, lng);
  
    try {
      const response = await API_Manager.get(
        "https://apis.openapi.sk.com/tmap/geo/reversegeocoding",
        {
          version: "1",
          format: "json",
          appKey: TMAP_API_KEY,
          coordType: "WGS84GEO",
          addressType: "A02", // ✅ 도로명 주소 기준
          lat,
          lon: lng,
        },
        {},
      );
  
      console.log("✅ Reverse Geocoding 완료:", response);
  
      // ✅ 도로명 주소 전체 가져오기 (도로명 + 번지수 포함)
      const roadAddress = response.addressInfo.roadAddress || response.addressInfo.fullAddress;
  
      setCurrentAddress(roadAddress);
      return roadAddress;
    } catch (error) {
      console.error("🚨 Reverse Geocoding 요청 실패:", error);
      setCurrentAddress("주소를 가져올 수 없습니다.");
      return "주소를 가져올 수 없습니다.";
    }
  }
  

  

  return (
    <div className="w-full h-full relative">
      {/* 지도 컨테이너 */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Recruit 페이지에서 지도 중심 마커 표시 */}
      {mode === "reverse-geocoding" && (
        <>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl pointer-events-none"
          >
            📍
          </div>
          <button
            onClick={handleConfirmClick} // ✅ "확인" 버튼을 누를 때만 API 호출
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            확인
          </button>
        </>
      )}
    </div>
  );
}
