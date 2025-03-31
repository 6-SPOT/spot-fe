"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import API_Manager from "@/lib/API_Manager";
import MapComponent from "@/components/MapComponent";

export default function TaskRequestPage() {
  const router = useRouter();
  const params = useParams();
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobDetail, setJobDetail] = useState<any | null>(null);
  const [address, setAddress] = useState("주소를 불러오는 중...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      setJobId(params.id as string);
    }
  }, [params]);

  useEffect(() => {
    if (jobId) {
      fetchJobDetail();
    }
  }, [jobId]);

  // ✅ API 호출하여 작업 상세 데이터 가져오기
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

      // ✅ 받아온 lat, lng으로 주소 변환 요청
      if (response.data.lat && response.data.lng) {
        fetchAddress(response.data.lat, response.data.lng);
      }
    } catch (error) {
      console.error("❌ 작업 상세 데이터를 불러오는데 실패했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 좌표를 도로명 주소로 변환하는 함수 (Tmap Reverse Geocoding)
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

  if (loading) {
    return (
      <div className="flex flex-col items-center p-4 w-full animate-pulse">
        {/* 이미지 스켈레톤 */}
        <div className="w-full h-[350px] bg-gray-300 rounded mb-4" />
  
        {/* 프로필 스켈레톤 */}
        <div className="flex items-center w-full mt-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full mr-4" />
          <div className="h-4 bg-gray-300 rounded w-1/3" />
        </div>
  
        {/* 주소 스켈레톤 */}
        <div className="mt-4 h-4 bg-gray-300 rounded w-1/2" />
  
        {/* 내용 스켈레톤 */}
        <div className="w-full p-4 mt-4 bg-gray-200 rounded-md h-[112px]" />
  
        {/* 버튼 스켈레톤 */}
        <div className="w-full flex justify-between mt-4 space-x-2">
          <div className="flex-1 h-10 bg-gray-300 rounded" />
          <div className="flex-1 h-10 bg-gray-300 rounded" />
        </div>
      </div>
    );
  }
  
  if (!jobDetail) {
    return <p className="text-center mt-4 text-red-500">데이터를 불러올 수 없습니다.</p>;
  }
  
  return (
    <div className="flex flex-col items-center p-4 w-full">
      {/* ✅ 작업 이미지 */}
      <div className="w-full aspect-[9/7] bg-gray-100 relative overflow-hidden rounded-md mb-4">
        {jobDetail.picture ? (
          <Image
            src={jobDetail.picture}
            alt="작업 이미지"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            이미지 없음
          </div>
        )}
      </div>
  
      {/* ✅ 프로필 섹션 */}
      <div className="w-full flex items-center mt-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 overflow-hidden">
          {jobDetail.picture ? (
            <Image
              src={jobDetail.picture}
              alt="프로필 이미지"
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : null}
        </div>
        <div>
          <p className="font-semibold">{jobDetail.nickname || "닉네임 없음"}</p>
        </div>
      </div>
  
      {/* ✅ 주소 버튼 */}
      <div className="w-full h-6 mt-4">
        <button
          className="text-blue-500 underline block text-center w-full overflow-hidden whitespace-nowrap text-ellipsis"
          onClick={() => setIsModalOpen(true)}
        >
          {address || "주소 불러오는 중..."}
        </button>
      </div>
  
      {/* ✅ 상세 내용 */}
      <div className="w-full p-4 mt-4 bg-gray-200 rounded-md h-[112px]">
        <p className="text-sm text-gray-800 leading-relaxed">
          {jobDetail.content || "상세 내용이 없습니다."}
        </p>
      </div>
  
      {/* ✅ 하단 버튼 */}
      <div className="w-full flex justify-between mt-4 space-x-2">
        <button className="flex-1 bg-red-500 text-white p-2 rounded-lg">취소</button>
        <button
          onClick={() => router.push(`/tasks/applicants/${jobId}`)}
          className="flex-1 bg-blue-500 text-white p-2 rounded-lg"
        >
          신청자 목록
        </button>
      </div>
  
      {/* ✅ 지도 모달 */}
      {isModalOpen && (
        <>
          {/* 모달 배경 */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          />
          {/* 모달 내용 */}
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
