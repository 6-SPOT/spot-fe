"use client";

import { useEffect, useRef, useState } from "react";
import API_Manager from "../lib/API_Manager";

declare global {
  interface Window {
    Tmapv2: any;
  }
}

interface MapComponentProps {
  mode: "geocoding" | "reverse-geocoding" | "select-location"; // ✅ 새로운 모드 추가
  address?: string;
  onConfirm?: (coords: { lat: number; lng: number }, zoom: number) => void; // ✅ 모드에 따라 다르게 동작
}

export default function MapComponent({ mode, address, onConfirm }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [centerCoords, setCenterCoords] = useState({ lat: 37.402399, lng: 127.101112 });
  const [currentZoom, setCurrentZoom] = useState<number>(17);
  const [currentAddress, setCurrentAddress] = useState("주소 검색 중...");
  const TMAP_API_KEY = process.env.NEXT_PUBLIC_TMAP_API_KEY;

  useEffect(() => {
    if (!mapRef.current) return;

    console.log("🟢 지도 생성 요청");

    if (mapInstanceRef.current) {
      console.log("⚠️ 기존 지도 인스턴스가 존재하여 새로 생성하지 않음");
      return;
    }

    console.log("🗺 지도 초기화 진행");

    const newMapInstance = new window.Tmapv2.Map(mapRef.current, {
      center: new window.Tmapv2.LatLng(centerCoords.lat, centerCoords.lng),
      width: "100%",
      height: "100%",
      zoom: currentZoom,
      httpsMode: true,
    });

    mapInstanceRef.current = newMapInstance;

    // ✅ 지도 이동 이벤트
    window.Tmapv2.event.addListener(newMapInstance, "dragend", () => {
      const newCenter = newMapInstance.getCenter();
      setCenterCoords({ lat: newCenter.lat(), lng: newCenter.lng() });
      console.log("🔄 지도 이동, 새로운 좌표:", newCenter.lat(), newCenter.lng());
    });

    // ✅ 줌 변경 이벤트
    window.Tmapv2.event.addListener(newMapInstance, "zoom_changed", () => {
      setCurrentZoom(newMapInstance.getZoom());
      console.log("🔍 줌 변경:", newMapInstance.getZoom());
    });

    console.log("✅ 지도 로드 완료");
  }, [mode]);

  // ✅ "확인" 버튼을 눌렀을 때 동작 방식 변경
  const handleConfirmClick = async () => {
    if (!mapInstanceRef.current) {
      console.error("🚨 지도 인스턴스를 찾을 수 없습니다.");
      return;
    }

    const newCenter = mapInstanceRef.current.getCenter();
    const latestCoords = { lat: newCenter.lat(), lng: newCenter.lng() };
    const latestZoom = mapInstanceRef.current.getZoom();

    console.log("✅ 확인 버튼 클릭됨. 최신 좌표:", latestCoords, "줌 레벨:", latestZoom);

    if (mode === "reverse-geocoding") {
      const address = await requestReverseGeocoding(latestCoords.lat, latestCoords.lng);
      if (address && onConfirm) {
        onConfirm(latestCoords, latestZoom); // ✅ 기존 기능 유지 (주소 변환 후 전달)
      }
    } else if (mode === "select-location") {
      if (onConfirm) {
        onConfirm(latestCoords, latestZoom); // ✅ 선택된 좌표와 줌 레벨만 반환
      }
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
          addressType: "A02",
          lat,
          lon: lng,
        },
        {},
      );

      console.log("✅ Reverse Geocoding 완료:", response);

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
      <div ref={mapRef} className="w-full h-full" />

      {/* 중앙 마커 */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl pointer-events-none"
      >
        📍
      </div>

      {/* 확인 버튼 */}
      <button
        onClick={handleConfirmClick}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        확인
      </button>
    </div>
  );
}
