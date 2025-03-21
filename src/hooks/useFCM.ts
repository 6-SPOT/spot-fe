import { useEffect, useState } from "react";
import { messaging, getToken, onMessage } from "@/firebaseConfig";

const useFCM = () => {
  const [notifications, setNotifications] = useState<{ title: string; body: string }[]>([]);
  const VAPIDKEY = process.env.NEXT_PUBLIC_VAPID_KEY;

  useEffect(() => {
    console.log("🔹 useFCM.ts 실행됨");

    if (typeof window !== "undefined" && "Notification" in window && messaging) {
      console.log("🔹 현재 알림 권한 상태:", Notification.permission);

      Notification.requestPermission().then((permission) => {
        console.log("🔹 알림 권한 요청 결과:", permission);

        if (permission === "granted" && messaging) {
          getToken(messaging, {
            vapidKey: VAPIDKEY,
          })
            .then((currentToken) => {
              if (currentToken) {
                console.log("✅ FCM Token 발급 완료:", currentToken);
              } else {
                console.log("❌ FCM 토큰 발급 실패");
              }
            })
            .catch((err) => console.log("🚨 토큰을 가져오는 중 오류 발생:", err));
        }
      });

      if (messaging) {
        onMessage(messaging, (payload) => {
            console.log("📩 포그라운드 메시지 수신 (FCM):", payload);
          
            const title = payload.notification?.title || "알림";
            const body = payload.notification?.body || "내용 없음";
          
            setNotifications((prev) => [...prev, { title, body }]);
          
            // 🔹 브라우저 알림 직접 표시
            if (Notification.permission === "granted") {
              new Notification(title, { body, icon: "/chillguy.png" });
            } else {
              console.warn("⚠️ 브라우저 알림 권한이 허용되지 않음.");
            }
          });
          
      }
    }
  }, []);

  return { notifications };
};

export default useFCM;
