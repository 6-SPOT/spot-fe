"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import API_Manager from "../../../lib/API_Manager"; // API_Manager 경로 확인

// API 응답 타입 정의
interface JobData {
  id: number;
  title: string;
  price: number;
  time: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<JobData[]>([]); // 데이터 상태
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const endpoint = "/api/job/worker/search";
    const params = {
      lat: undefined,
      lng: undefined,
      zoom: 21,
      page: 0,
      size: 10,
      sort: "string",
    };
  
    const accessToken = localStorage.getItem("accessToken");
  
    if (!accessToken) {
      console.error("❌ AccessToken이 없습니다.");
      return;
    }
  
    console.log("📌 [API 요청 시작]:", endpoint);
    console.log("📌 [params]:", JSON.stringify(params));
  
    try {
      const response = await API_Manager.get(endpoint, params, {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      });
  
      console.log("✅ [API 응답 데이터]:", response);
  
      if (response?.data?.content) {
        setTasks(response.data.content);
      } else {
        setTasks(getDummyData());
      }
    } catch (error) {
      console.error(`API 요청 오류: ${error}`);
      setTasks(getDummyData());
    } finally {
      setLoading(false);
    }
  };
  

  // 더미 데이터 함수
  const getDummyData = () => {
    return [
      {
        id: 1,
        title: "가사 도우미 요청",
        price: 50000,
        time: "2시간",
      },
      {
        id: 2,
        title: "청소 서비스 요청",
        price: 60000,
        time: "3시간",
      },
      {
        id: 3,
        title: "배달 대행 요청",
        price: 7000,
        time: "30분",
      },
      {
        id: 4,
        title: "전기 수리 서비스",
        price: 100000,
        time: "1시간 30분",
      },
    ];
  };

  const handleRegionClick = () => {
    window.location.href = "http://ilmatch.net/api/member/login/kakao";
  };

  return (
    <div className="flex flex-col items-center p-4 w-full">
      {/* 상단 네비게이션 */}
      <div className="w-full flex justify-between items-center py-2">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={handleRegionClick}>
          지역
        </h1>
        <button onClick={() => router.push("/notification")} className="p-2">🔔</button>
      </div>

      {/* 검색창 */}
      <div className="w-full flex items-center border-b pb-2">
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-2 py-1 border rounded-md"
        />
        <button className="p-2">🔍</button>
      </div>

      {/* 로딩 표시 */}
      {loading ? (
        <div className="mt-4">불러오는 중...</div>
      ) : (
        <div className="w-full mt-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex justify-between items-center p-4 border-b cursor-pointer"
                onClick={() => router.push(`/detail/${task.id}`)}
              >
                <div className="flex-1">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.price}원</p>
                  <p className="text-sm text-gray-500">{task.time}</p>
                </div>
                <div className="w-24 h-24 bg-gray-300 flex items-center justify-center">
                  <Image src={require("@/assets/image/chillguy.png")} alt="작업 이미지" width={96} height={96} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center mt-4">주변에 등록된 작업이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
}
