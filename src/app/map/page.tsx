"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Tmapv2: any;
    mapInstance?: any; // 전역 변수로 지도 인스턴스 저장
  }
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    const checkTmapReady = () => {
      console.log("🔍 window.Tmapv2 확인:", window.Tmapv2);

      if (window.Tmapv2 && typeof window.Tmapv2.LatLng === "function") {
        if (!window.mapInstance) {
          console.log("✅ Tmapv2 로드 완료! 지도 생성 중...");
          window.mapInstance = new window.Tmapv2.Map(mapRef.current!, {
            center: new window.Tmapv2.LatLng(37.570028, 126.986072),
            width: "100%",
            height: "100%",
            zoom: 13,
            httpsMode: true,
          });
          setIsMapLoaded(true);
        } else {
          console.log("⚠️ 이미 지도 인스턴스가 존재함, 새로 생성 안함.");
        }
      } else {
        console.warn("⏳ Tmapv2가 아직 로드되지 않음. 500ms 후 재시도...");
        setTimeout(checkTmapReady, 500);
      }
    };

    if (!isMapLoaded) checkTmapReady();
  }, [isMapLoaded]);

  return (
    <div style={{ width: "100%", height: "calc(100vh - 60px)", paddingBottom: "10px" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", backgroundColor: "#f0f0f0" }} />
    </div>
  );
}
