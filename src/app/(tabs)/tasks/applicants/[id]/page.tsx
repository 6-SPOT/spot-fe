"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import APIManager from "@/lib/API_Manager";
import { ABILITIES } from "@/app/(tabs)/mypage/abilities";
import { useInView } from "react-intersection-observer"; // 🔥 무한 스크롤 감지

interface Applicant {
  id: number;
  name: string;
  profile_img: string;
  introduction: string;
  abilities: string[];
}

export default function ApplicantsPage() {
  const router = useRouter();
  const { id } = useParams(); // jobId

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0); // ✅ 페이지 상태 추가
  const [hasMore, setHasMore] = useState(true); // ✅ 추가 데이터 여부 확인

  const { ref, inView } = useInView(); // 🔥 Intersection Observer 사용

  useEffect(() => {
    fetchApplicants(0, true); // ✅ 첫 페이지 데이터 불러오기
  }, [id]);

  useEffect(() => {
    if (inView && hasMore) {
      fetchApplicants(page, false); // ✅ 스크롤 시 추가 데이터 로드
    }
  }, [inView, hasMore]);

  // ✅ 신청자 목록 가져오기 (무한 스크롤 적용)
  const fetchApplicants = async (newPage: number, isFirstLoad: boolean) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("AccessToken이 없습니다.");
        return;
      }
      const params = {
        id,
        page: newPage,
        size: 10, // ✅ 한 번에 10명씩 불러오기
        sort: "string",
      };

      const response = await APIManager.get("/api/job/search-list", params, {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      });

      const newApplicants = response.data.content || [];

      console.log("✅ 추가 데이터 불러옴:", newApplicants.length);

      if (newApplicants.length > 0) {
        setApplicants((prev) => (isFirstLoad ? newApplicants : [...prev, ...newApplicants]));
        setPage(newPage + 1); // ✅ 페이지 증가
      } else {
        setHasMore(false); // ✅ 더 이상 불러올 데이터가 없을 때 false 설정
      }
    } catch (error) {
      console.error("❌ 신청자 목록을 불러오는 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectApplicant = async (applicantId: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("AccessToken이 없습니다.");
        return;
      }
      const params = {
        jobId: id,
        attenderId: applicantId,
        isYes: true,
      };

      await APIManager.post("/api/job/yes-or-no", params, {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      });

      alert("신청자를 선택했습니다.");
      router.push(`/tasks`);
    } catch (error) {
      console.error("❌ 신청자 선택 오류:", error);
    }
  };

  const getAbilityLabels = (abilities: string[]) => {
    return abilities
      .map((ability) => ABILITIES.find((item) => item.value === ability)?.label || ability)
      .join(", ");
  };

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">신청자 목록</h1>

      {loading && <p className="text-center mt-4">신청자 목록을 불러오는 중...</p>}

      {!loading && applicants.length === 0 ? (
        <p className="text-center mt-4">신청자가 없습니다.</p>
      ) : (
        <div className="w-full mt-4 space-y-4">
          {applicants.map((applicant) => (
            <div key={applicant.id} className="p-4 bg-gray-200 rounded-lg">
              <p>📌 닉네임: {applicant.name}</p>
              <p>📝 소개: {applicant.introduction}</p>
              <p>🔥 능력: {getAbilityLabels(applicant.abilities)}</p>
              <div className="flex space-x-2 mt-2">
                <button className="flex-1 bg-blue-500 text-white p-2 rounded-lg">
                  1:1 대화
                </button>
                <button
                  className="flex-1 bg-green-500 text-white p-2 rounded-lg"
                  onClick={() => selectApplicant(applicant.id)}
                >
                  선택
                </button>
              </div>
            </div>
          ))}

          {/* ✅ 무한 스크롤 트리거 요소 */}
          {hasMore && <div ref={ref} className="h-10 flex justify-center items-center text-gray-500">불러오는 중...</div>}
        </div>
      )}

      <button
        onClick={() => router.back()}
        className="mt-4 p-2 bg-gray-300 rounded-lg"
      >
        뒤로 가기
      </button>
    </div>
  );
}
