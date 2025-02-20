"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import API_Manager from "../../lib/API_Manager";

declare global {
  interface Window {
    Tmapv2: any;
    mapInstance?: any;
    marker?: any;
  }
}

interface GeocodingResponse {
  coordinateInfo?: {
    coordinate?: { newLat?: string; newLon?: string }[];
  };
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const TMAP_API_KEY = process.env.NEXT_PUBLIC_TMAP_API_KEY;
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (window.Tmapv2 && typeof window.Tmapv2.LatLng === "function") {
      if (!window.mapInstance) {
        window.mapInstance = new window.Tmapv2.Map(mapRef.current!, {
          center: new window.Tmapv2.LatLng(37.402399, 127.101112), // 기본 위치
          width: "100%",
          height: "100%",
          zoom: 17,
          httpsMode: true,
        });
        setIsMapLoaded(true);
      }
    } else {
      setTimeout(() => setIsMapLoaded(true), 500);
    }
  }, []);

  useEffect(() => {
    if (isMapLoaded && address) {
      requestGeocoding(address);
    }
  }, [isMapLoaded, address]);

  async function requestGeocoding(address: string) {
    if (!TMAP_API_KEY) return console.error("🚨 TMAP_API_KEY가 없습니다.");

    try {
      const encodedAddress = encodeURIComponent(address);
      const response: GeocodingResponse = await API_Manager.get(
        "https://apis.openapi.sk.com/tmap/geo/fullAddrGeo",
        {
          version: "1",
          format: "json",
          appKey: TMAP_API_KEY,
          coordType: "WGS84GEO",
          addressFlag: "F02",
          fullAddr: encodedAddress,
        },
        {},
        { skipAuth: true, useSerializer: true }
      );

      console.log("🌍 Geocoding API 응답:", response);
      handleGeocodingResponse(response);
    } catch (error) {
      console.error("🚨 Geocoding 요청 실패:", error);
    }
  }

  function handleGeocodingResponse(data: GeocodingResponse) {
    if (!data.coordinateInfo?.coordinate?.length) {
      console.error("🚨 좌표 변환 실패: 응답 데이터가 비어 있습니다.");
      return;
    }

    const { newLat, newLon } = data.coordinateInfo.coordinate[0];

    if (!newLat || !newLon) {
      console.error("🚨 좌표 변환 실패: 위도 또는 경도 값이 없습니다.");
      return;
    }

    console.log(`📍 변환된 좌표: 위도 ${newLat}, 경도 ${newLon}`);

    const map = window.mapInstance!;
    if (!map) {
      console.error("🚨 지도 인스턴스가 존재하지 않습니다.");
      return;
    }

    const position = new window.Tmapv2.LatLng(Number(newLat), Number(newLon));

    // 지도 중심 이동
    map.setCenter(position);

    // 기존 마커 제거
    if (window.marker) {
      window.marker.setMap(null);
    }

    try {
      // 마커 추가
      window.marker = new window.Tmapv2.Marker({
        position,
        map: map,
        defaultMarker: true,
        zIndex: 999,
        opacity: 1,
        draggable: false,
      });

      console.log("✅ 마커 추가 성공:", window.marker);
    } catch (error) {
      console.error("🚨 마커 추가 실패:", error);
    }
  }

  return <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />;
}
