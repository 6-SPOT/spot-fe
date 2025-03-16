"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_Manager from "../../lib/API_Manager"; // API 호출 유틸

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
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  // 알림 목록 API 호출 함수
  const fetchNotifications = async () => {
    console.log("🚀 fetchNotifications 실행됨!"); // ✅ 실행 여부 확인

    const params = {
      page: 0,
      size: 10,
      sort: "string", // 최신순 정렬
    };

    const accessToken = localStorage.getItem("accessToken"); // ✅ 토큰 가져오기

    if (!accessToken) {
      console.error("❌ AccessToken이 없습니다. 로그인 필요.");
      return;
    }

    try {
      const response = await API_Manager.get("/api/notification/my-list", params,
        {
          Authorization: `Bearer ${accessToken}`, // ✅ 인증 추가
          Accept: "application/json",
        },
      );

      console.log("✅ API 응답 데이터:", response?.data); // ✅ API 응답 데이터 확인

      // 응답 데이터 구조 반영
      if (response?.data?.status === "success" && response?.data?.data) {
        setNotifications(response.data.data.content || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("❌ 알림 목록 가져오기 실패:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">알림 페이지</h1>

      {loading ? (
        <p className="text-gray-500">로딩 중...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">알림이 없습니다.</p>
      ) : (
        <div className="w-full mt-4 space-y-4">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-4 border-b">
              <h2 className="font-semibold">{notif.sender_name || "알림"}</h2>
              <p>{notif.content}</p>
              <span className="text-sm text-gray-400">{notif.created_at}</span>
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
