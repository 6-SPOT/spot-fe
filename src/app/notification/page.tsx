"use client";
import { useEffect, useState } from "react";
import useFCM from "@/hooks/useFCM";
import { useRouter } from "next/navigation";

export default function NotificationScreen() {
  const router = useRouter();
  const { notifications } = useFCM(); // ✅ 알림 목록 가져오기
  const [localNotifications, setLocalNotifications] = useState(notifications);

  useEffect(() => {
    setLocalNotifications(notifications); // ✅ 새로운 알림이 올 때마다 업데이트
  }, [notifications]);

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-xl font-bold">알림 페이지</h1>

      {localNotifications.length === 0 ? (
        <p className="text-gray-500">알림이 없습니다.</p>
      ) : (
        <div className="w-full mt-4 space-y-4">
          {localNotifications.map((notif, index) => (
            <div key={index} className="p-4 border-b">
              <h2 className="font-semibold">{notif.title}</h2>
              <p>{notif.body}</p>
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
