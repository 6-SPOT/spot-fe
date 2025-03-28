"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_Manager from "../../lib/API_Manager"; // API 호출 유틸
import { useInView } from "react-intersection-observer"; // 🔥 무한 스크롤 감지

interface Notification {
  id: number;
  created_at: string;
  content: string;
  sender_id: number;
  sender_name: string;
  sender_img: string;
  msg_type: string;
}

export default function NotificationScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // ✅ 페이지 상태 추가
  const [hasMore, setHasMore] = useState(true); // ✅ 추가 데이터 여부 확인

  const { ref, inView } = useInView(); // 🔥 Intersection Observer 사용

  useEffect(() => {
    fetchNotifications(0, true); // ✅ 첫 페이지 데이터 불러오기
  }, []);

  useEffect(() => {
    if (inView && hasMore) {
      fetchNotifications(page, false); // ✅ 스크롤 시 추가 데이터 로드
    }
  }, [inView, hasMore, page]);

  // ✅ 알림 목록 API 호출 함수 (무한 스크롤 적용)
  const fetchNotifications = async (newPage: number, isFirstLoad: boolean) => {
    console.log("🚀 fetchNotifications 실행됨! page:", newPage);
  
    const params = {
      page: newPage,
      size: 10, // ✅ 한 번에 10개씩 불러오기
      sort: "string",
    };
  
    const accessToken = localStorage.getItem("accessToken"); // ✅ 토큰 가져오기
    if (!accessToken) {
      console.error("❌ AccessToken이 없습니다. 로그인 필요.");
      return;
    }
  
    try {
      const response = await API_Manager.get("/api/notification/my-list", params, {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      });
  
      console.log("✅ 추가 데이터 불러옴:", response?.data);
  
      if (response?.status === "success" && response?.data) {
        const newNotifications: Notification[] = response.data.content || [];
  
        if (newNotifications.length > 0) {
          // 🔥 기존 데이터와 새 데이터를 합쳐 중복 제거
          const uniqueNotifications: Notification[] = Array.from(
            new Map<number, Notification>([
              ...notifications.map((notif) => [notif.id, notif] as [number, Notification]),
              ...newNotifications.map((notif) => [notif.id, notif] as [number, Notification]),
            ]).values()
          );
  
          setNotifications(uniqueNotifications);
          setPage(newPage + 1); // ✅ 페이지 증가
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("❌ 알림 목록 가져오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <div className="p-4">
        <h1 className="text-xl font-bold">알림 페이지</h1>
      </div>
  
      {/* 알림 리스트 */}
      <div className="flex-1 px-4 overflow-y-auto space-y-4">
        {loading ? (
          [...Array(5)].map((_, idx) => (
            <div key={idx} className="p-4 border-b min-h-[80px] animate-pulse space-y-2">
              <div className="h-4 w-1/3 bg-gray-300 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
              <div className="h-3 w-1/4 bg-gray-200 rounded" />
            </div>
          ))
        ) : notifications.length === 0 ? (
          <p className="text-gray-500">알림이 없습니다.</p>
        ) : (
          <>
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 border-b min-h-[80px]">
                <h2 className="font-semibold">{notif.sender_name || "알림"}</h2>
                <p className="line-clamp-2">{notif.content}</p>
                <span className="text-sm text-gray-400">{notif.created_at}</span>
              </div>
            ))}
  
            {/* 무한 스크롤 트리거 */}
            {hasMore && (
              <div
                ref={ref}
                className="min-h-[40px] h-10 flex justify-center items-center text-gray-500"
              >
                불러오는 중...
              </div>
            )}
          </>
        )}
      </div>
  
      {/* ✅ 하단 고정 버튼 */}
      <div className="sticky bottom-0 bg-white p-4 border-t">
        <button
          onClick={() => router.back()}
          className="w-full p-3 bg-gray-300 rounded-lg min-h-[44px]"
        >
          뒤로 가기
        </button>
      </div>
    </div>
  );
  
}
