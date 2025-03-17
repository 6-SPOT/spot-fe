"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import APIManager from "@/lib/API_Manager"; // API Manager 경로에 맞게 수정 필요
import { ABILITIES } from "@/app/(tabs)/mypage/abilities";

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

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken"); // accessToken 가져오기
        if (!accessToken) {
          console.error("AccessToken이 없습니다.");
          return;
        }
        const params = {
          id,
          page: 0,
          size: 100,
          sort: "string",
        };

        const response = await APIManager.get("/api/job/search-list", params, {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        });

        console.log("신청자 리스트 : ", response.data);
        setApplicants(response.data.content || []);
      } catch (error) {
        console.error("신청자 목록을 불러오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id]);

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

      const response = await APIManager.post(
        "/api/job/yes-or-no",params,
        {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        }
      );

      alert("신청자를 선택했습니다.");
      router.push(`/tasks`);

    } catch (error) {
      console.error("신청자 선택 오류:", error);
    }
  };

  const getAbilityLabels = (abilities: string[]) => {
    return abilities
      .map((ability) => ABILITIES.find((item) => item.value === ability)?.label || ability)
      .join(", ");
  };

  if (loading) {
    return <p className="text-center mt-4">신청자 목록을 불러오는 중...</p>;
  }

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">신청자 목록</h1>

      {applicants.length === 0 ? (
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
