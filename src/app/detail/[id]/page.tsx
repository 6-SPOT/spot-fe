"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function DetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [address, setAddress] = useState("서울특별시 강남구 테헤란로 427"); // 실제 주소로 변경 가능

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

      {/* 주소 섹션 - 클릭하면 지도 페이지로 이동 */}
      <button
        className="mt-4 text-blue-500 underline"
        onClick={() => router.push(`/map?address=${encodeURIComponent(address)}`)}
      >
        {address}
      </button>

      {/* 상세 내용 */}
      <div className="w-full p-4 mt-4 bg-gray-200 rounded-md">
        상세내용
      </div>

      {/* 하단 버튼 */}
      <div className="w-full flex justify-between mt-4 space-x-2">
        <button className="flex-1 p-2 bg-gray-300 rounded-md">담아두기</button>
        <button className="flex-1 p-2 bg-gray-300 rounded-md">1:1 대화</button>
        <button className="flex-1 p-2 bg-gray-300 rounded-md">신청하기</button>
      </div>
    </div>
  );
}
