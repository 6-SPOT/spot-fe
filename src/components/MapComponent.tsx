"use client";

import { useEffect, useRef, useState } from "react";
import API_Manager from "../lib/API_Manager";

declare global {
  interface Window {
    Tmapv2: any;
    mapInstance?: any;
    marker?: any;
  }
}

interface MapComponentProps {
  address?: string; // 주소 (Geocoding 처리)
  initialPosition?: { lat: number; lng: number }; // 초기 좌표
}

export default function MapComponent({ address, initialPosition }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const TMAP_API_KEY = process.env.NEXT_PUBLIC_TMAP_API_KEY;

  useEffect(() => {
    if (window.Tmapv2 && typeof window.Tmapv2.LatLng === "function") {
      if (!window.mapInstance) {
        window.mapInstance = new window.Tmapv2.Map(mapRef.current!, {
          center: new window.Tmapv2.LatLng(initialPosition?.lat || 37.402399, initialPosition?.lng || 127.101112),
          width: "100%",
          height: "100%",
          zoom: 17,
          httpsMode: true,
        });

        window.marker = new window.Tmapv2.Marker({
          position: new window.Tmapv2.LatLng(initialPosition?.lat || 37.402399, initialPosition?.lng || 127.101112),
          map: window.mapInstance,
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
      const response = await API_Manager.get(
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

      const { newLat, newLon } = response.coordinateInfo.coordinate[0];
      const lat = parseFloat(newLat);
      const lng = parseFloat(newLon);

      window.mapInstance.setCenter(new window.Tmapv2.LatLng(lat, lng));
      window.marker.setPosition(new window.Tmapv2.LatLng(lat, lng));
    } catch (error) {
      console.error("🚨 Geocoding 요청 실패:", error);
    }
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
