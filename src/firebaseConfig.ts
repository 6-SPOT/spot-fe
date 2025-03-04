import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBQ6FVR2ClayEpDjoPR7IbwRI0v-yL32uo",
  authDomain: "soomin-dea03.firebaseapp.com",
  projectId: "soomin-dea03",
  storageBucket: "soomin-dea03.appspot.com",
  messagingSenderId: "734841305174",
  appId: "1:734841305174:web:46a9328b9bbae6265423f7",
  measurementId: "G-B0493L6PWE",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// ✅ 서버에서 실행 방지 및 messaging 타입 지정
let messaging: Messaging | null = null;
if (typeof window !== "undefined" && "Notification" in window) {
  messaging = getMessaging(app);
}

export { messaging, getToken, onMessage };
