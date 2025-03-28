"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import API_Manager from "../../../lib/API_Manager";
import { JobDetailData } from "@/types"; // API 응답 타입 정의
import MapComponent from "@/components/MapComponent"; // 지도 컴포넌트

export default function DetailPage() {
  const router = useRouter();
  const params = useParams(); // ✅ 바로 사용
  const [jobId, setJobId] = useState<string | null>(null); // ✅ 상태로 관리
  const [jobDetail, setJobDetail] = useState<JobDetailData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("주소를 불러오는 중...");
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    if (params?.id) {
      setJobId(params.id as string); // ✅ 안전한 타입 변환
    }
  }, [params]);

  useEffect(() => {
    if (jobId) {
      fetchJobDetail();
    }
  }, [jobId]);

  // ✅ API 호출하여 상세 데이터 가져오기
  const fetchJobDetail = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      console.error("❌ AccessToken이 없습니다. 로그인 필요.");
      return;
    }

    try {
      const response = await API_Manager.get(
        `/api/job/worker/get?id=${jobId}`,
        {},
        {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        }
      );
      setJobDetail(response.data);

      if(response.data.myStatus === "ATTENDER"){
        setIsApplied(true);
      }
      // ✅ 받아온 lat, lng으로 주소 변환 요청
      if (response.data.lat && response.data.lng) {
        fetchAddress(response.data.lat, response.data.lng);
      }
    } catch (error) {
      console.error("❌ 상세 정보 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 좌표를 주소로 변환하는 함수
  const fetchAddress = async (lat: number, lng: number) => {
    const TMAP_API_KEY = process.env.NEXT_PUBLIC_TMAP_API_KEY;

    if (!TMAP_API_KEY) {
      console.error("🚨 TMAP_API_KEY가 없습니다.");
      return;
    }

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
        {}
      );

      const roadAddress = response.addressInfo.roadAddress || response.addressInfo.fullAddress;
      setAddress(roadAddress);
    } catch (error) {
      console.error("❌ 주소 변환 실패:", error);
      setAddress("주소를 가져올 수 없습니다.");
    }
  };

  // ✅ 신청하기 API 호출
  const handleApply = async () => {
    if (!jobId) {
      alert("❌ 작업 ID가 없습니다.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await API_Manager.post(
        "api/job/worker/request",
        { jobId: jobId },
        {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        }
      );

      console.log("📢 해결사 등록 응답:", response.data); // ✅ `response.data` 그대로 사용
  
      // ✅ 서버 응답을 그대로 처리
      alert(`✅ 신청 완료`);
    } catch (error) {
      console.error("❌ 의뢰 신청 중 오류 발생:", error);
      alert("🚨 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 채팅 API 호출
  const createChat = async () => {
    if (!jobId) {
      alert("❌ 작업 ID가 없습니다.");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await API_Manager.post(
        "api/chat/room/create",
        { jobId: jobId ,
          otherMemberId: jobDetail?.clientId
        },
        {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        }
      );

    
      console.log("📢 채팅방 등록 응답:", response.data); // ✅ `response.data` 그대로 사용
  
      const roomId = response.data; 

      window.location.href = `/chat/${roomId}`;
      // ✅ 서버 응답을 그대로 처리
      //alert(`✅ ${response.message}`);
    } catch (error) {
      console.error("❌ 채팅 신청 중 오류 발생:", error);
      alert("🚨 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center p-4 w-full animate-pulse space-y-4">
        {/* 작업 이미지 skeleton */}
        <div className="w-full h-[400px] bg-gray-300 rounded" />
  
        {/* 프로필 섹션 skeleton */}
        <div className="w-full flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full" />
          <div className="space-y-2">
            <div className="w-24 h-4 bg-gray-300 rounded" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
          </div>
        </div>
  
        {/* 주소 영역 skeleton */}
        <div className="w-1/2 h-4 bg-gray-300 rounded" />
  
        {/* 상세 설명 skeleton */}
        <div className="w-full h-24 bg-gray-200 rounded" />
  
        {/* 버튼 영역 skeleton */}
        <div className="w-full flex justify-between space-x-2">
          <div className="flex-1 h-10 bg-gray-300 rounded" />
          <div className="flex-1 h-10 bg-gray-300 rounded" />
          <div className="flex-1 h-10 bg-blue-300 rounded" />
        </div>
      </div>
    );
  }
  
  if (!jobDetail) {
    return (
      <p className="text-center mt-4 text-red-500">
        데이터를 불러올 수 없습니다.
      </p>
    );
  }
  
  return (
    <div className="flex flex-col items-center p-4 w-full">
      {/* 작업 이미지 */}
      <div
        className={`w-full flex items-center justify-center overflow-hidden h-[400px] bg-gray-200 ${
          !jobDetail.picture ? "animate-pulse" : ""
        }`}
      >
        {!jobDetail.picture ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            이미지 없음
          </div>
        ) : (
          <Image
            src={jobDetail.picture}
            alt="작업 이미지"
            className="w-full h-full object-cover"
            width={600}
            height={400}
            loading="eager"
            priority
          />
        )}
      </div>
  
      {/* 프로필 섹션 */}
      <div className="w-full flex items-center mt-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full mr-4">
          <Image
            src={require("@/assets/image/chillguy.png")}
            alt="프로필 이미지"
            width={48}
            height={48}
            loading="eager"
          />
        </div>
        <div>
          <p className="font-semibold">{jobDetail.nickname}</p>
          <p className="text-sm text-gray-500">
            {jobDetail.money.toLocaleString()}원
          </p>
        </div>
      </div>
  
      {/* 주소 섹션 */}
      <button
        className="mt-4 text-blue-500 underline"
        onClick={() => setIsModalOpen(true)}
        style={{ minHeight: "24px" }}
      >
        {address}
      </button>
  
      {/* 상세 내용 */}
      <div className="w-full p-4 mt-4 bg-gray-200 rounded-md min-h-[80px]">
        {jobDetail.content || "설명이 없습니다."}
      </div>
  
      {/* 하단 버튼 */}
      <div className="w-full flex justify-between mt-4 space-x-2">
        <button className="flex-1 p-2 bg-gray-300 rounded-md">담아두기</button>
        <button
          className="flex-1 p-2 bg-gray-300 rounded-md"
          onClick={createChat}
        >
          1:1 대화
        </button>
        <button
          className="flex-1 p-2 bg-blue-500 text-white rounded-md min-w-[80px]"
          onClick={handleApply}
          disabled={isApplied || loading}
        >
          {isApplied ? "신청중" : "신청하기"}
        </button>
      </div>
  
      {/* 지도 모달 */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg w-4/5 h-3/5 z-50">
            <h2 className="text-xl font-bold mb-4">📍 위치 확인</h2>
            <div className="w-full h-64">
              <MapComponent mode="geocoding" address={address} />
            </div>
            <button
              className="w-full p-2 bg-red-500 text-white rounded-lg mt-4"
              onClick={() => setIsModalOpen(false)}
            >
              닫기
            </button>
          </div>
        </>
      )}
    </div>
  );
  
  
}
