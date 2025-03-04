importScripts("https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js");

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBQ6FVR2ClayEpDjoPR7IbwRI0v-yL32uo",
  authDomain: "soomin-dea03.firebaseapp.com",
  projectId: "soomin-dea03",
  storageBucket: "soomin-dea03.appspot.com",
  messagingSenderId: "734841305174",
  appId: "1:734841305174:web:46a9328b9bbae6265423f7",
  measurementId: "G-B0493L6PWE",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ✅ 백그라운드 메시지 수신 및 알림 표시
messaging.onBackgroundMessage((payload) => {
  console.log("📩 백그라운드 메시지 수신:", payload);

  const title = payload.notification?.title || "알림";
  const body = payload.notification?.body || "내용 없음";

  console.log("✅ showNotification 실행 예정...");
  self.registration.showNotification(title, {
    body,
    icon: "/chillguy.png",
    badge: "/chillguy.png",
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { url: "/" },
  });
  console.log("✅ showNotification 실행 완료!");
});

// ✅ `push` 이벤트 발생 시 알림 강제 표시
self.addEventListener("push", (event) => {
  console.log("📩 Service Worker에서 푸시 이벤트 수신:", event);

  if (event.data) {
    const payload = event.data.json();
    console.log("📩 푸시 데이터:", payload);

    const title = payload.notification?.title || "알림";
    const body = payload.notification?.body || "내용 없음";

    console.log("✅ showNotification 실행 예정...");
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: "/chillguy.png",
        badge: "/chillguy.png",
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: { url: "/" },
      })
    );
    console.log("✅ showNotification 실행 완료!");
  } else {
    console.warn("⚠️ 푸시 이벤트는 수신되었지만, `event.data`가 없습니다.");
  }
});

// ✅ 알림 클릭 시 페이지 이동 처리
self.addEventListener("notificationclick", (event) => {
  console.log("🔹 알림 클릭됨:", event.notification);
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url) // 🔹 알림 클릭 시 해당 URL로 이동
  );
});
