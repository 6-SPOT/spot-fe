"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import MapComponent from "@/components/MapComponent"; // 공통 지도 컴포넌트 가져오기

export default function DetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [address, setAddress] = useState("경기 성남시 분당구 판교로 242");
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태

  return (
    <div className="flex flex-col items-center p-4 w-full">
      {/* 작업 이미지 */}
      <div className="w-full flex items-center justify-center overflow-hidden">
        <Image 
          src={require("@/assets/image/chillguy.png")} 
          alt="작업 이미지" 
          className="w-full h-auto object-cover" 
        />
      </div>

      {/* 프로필 섹션 */}
      <div className="w-full flex items-center mt-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full mr-4">
          <Image 
            src={require("@/assets/image/chillguy.png")} 
            alt="프로필 이미지" 
            width={48} 
            height={48} 
          />
        </div>
        <div>
          <p className="font-semibold">닉네임</p>
          <p className="text-sm text-gray-500">평점</p>
        </div>
      </div>

      {/* 주소 섹션 - 클릭 시 모달에서 지도 표시 */}
      <button
        className="mt-4 text-blue-500 underline"
        onClick={() => setIsModalOpen(true)}
      >
        {address}
      </button>

      {/* 상세 내용 */}
      <div className="w-full p-4 mt-4 bg-gray-200 rounded-md">
        상세내용
      </div>

      {/* ✅ 하단 버튼들 (모달이 떠도 유지됨) */}
      <div className="w-full flex justify-between mt-4 space-x-2">
        <button className="flex-1 p-2 bg-gray-300 rounded-md">담아두기</button>
        <button className="flex-1 p-2 bg-gray-300 rounded-md">1:1 대화</button>
        <button className="flex-1 p-2 bg-gray-300 rounded-md">신청하기</button>
      </div>

      {/* ✅ 지도 모달 (absolute로 설정하여 하단 버튼 유지) */}
      {isModalOpen && (
        <>
          {/* 모달 배경 (클릭 시 닫기) */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsModalOpen(false)}
          />

          {/* 모달 컨텐츠 (absolute로 설정하여 페이지 레이아웃 유지) */}
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg w-4/5 h-3/5 z-50">
            <h2 className="text-xl font-bold mb-4">📍 위치 확인</h2>
            <div className="w-full h-64">
              <MapComponent mode="geocoding"address={address} />
            </div>
            <button className="w-full p-2 bg-red-500 text-white rounded-lg mt-4" onClick={() => setIsModalOpen(false)}>
              닫기
            </button>
          </div>
        </>
      )}
    </div>
  );
}
