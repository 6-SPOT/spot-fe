"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import APIManager from "@/lib/API_Manager";
import { ABILITIES } from "@/app/(tabs)/mypage/abilities";
import { useInView } from "react-intersection-observer";

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
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [fetchingMore, setFetchingMore] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);

  const { ref, inView } = useInView();
  const isFirstFetch = useRef(true);

  useEffect(() => {
    fetchApplicants(0, true);
  }, [id]);

  useEffect(() => {
    if (inView && hasMore && !fetchingMore && !initialLoading) {
      fetchApplicants(page, false);
    }
  }, [inView, hasMore, fetchingMore, initialLoading]);

  const fetchApplicants = async (newPage: number, isFirstLoad: boolean) => {
    try {
      if (!hasMore || fetchingMore) return;

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("AccessToken이 없습니다.");
        return;
      }

      if (!isFirstLoad) setFetchingMore(true);

      const params = {
        id,
        page: newPage,
        size: 10,
        sort: "string",
      };

      const response = await APIManager.get("/api/job/search-list", params, {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      });

      const newApplicants = response.data.content || [];

      if (newApplicants.length > 0) {
        setApplicants((prev) =>
          isFirstLoad ? newApplicants : [...prev, ...newApplicants]
        );
        setPage(newPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("❌ 신청자 목록을 불러오는 중 오류 발생:", error);
    } finally {
      setInitialLoading(false);
      setFetchingMore(false);
    }
  };

  const selectApplicant = async (applicantId: number) => {
    try {
      if (isSelecting) return;

      setIsSelecting(true);
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
      router.push("/tasks");
    } catch (error) {
      console.error("❌ 신청자 선택 오류:", error);
    } finally {
      setIsSelecting(false);
    }
  };

  const getAbilityLabels = (abilities: string[]) =>
    abilities
      .map((ability) => ABILITIES.find((item) => item.value === ability)?.label || ability)
      .join(", ");

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">신청자 목록</h1>

      {initialLoading ? (
        <p className="text-center mt-4">신청자 목록을 불러오는 중...</p>
      ) : applicants.length === 0 ? (
        <p className="text-center mt-4">신청자가 없습니다.</p>
      ) : (
        <div className="w-full mt-4 space-y-4">
          {applicants.map((applicant) => (
            <div key={applicant.id} className="p-4 bg-gray-200 rounded-lg">
              <p>📌 닉네임: {applicant.name}</p>
              <p>📝 소개: {applicant.introduction}</p>
              <p>🔥 능력: {getAbilityLabels(applicant.abilities)}</p>
              <div className="flex space-x-2 mt-2">
                <button
                  className="flex-1 bg-blue-500 text-white p-2 rounded-lg"
                  disabled={isSelecting}
                >
                  1:1 대화
                </button>
                <button
                  className="flex-1 bg-green-500 text-white p-2 rounded-lg"
                  onClick={() => selectApplicant(applicant.id)}
                  disabled={isSelecting}
                >
                  선택
                </button>
              </div>
            </div>
          ))}
          {hasMore && (
            <div ref={ref} className="h-10 flex justify-center items-center text-sm text-gray-500">
              더 불러오는 중...
            </div>
          )}
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
