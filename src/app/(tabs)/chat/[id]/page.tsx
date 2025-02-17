"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

// 더미 채팅 데이터 (동적 키를 갖도록 변경)
const dummyChats: Record<string, { sender: string; message: string }[]> = {
  "1": [
    { sender: "구인자", message: "안녕하세요!" },
    { sender: "구직자", message: "네, 안녕하세요!" },
  ],
  "2": [
    { sender: "구인자", message: "일정 조율 가능할까요?" },
    { sender: "구직자", message: "네, 가능합니다." },
  ],
  "3": [
    { sender: "구인자", message: "업무 범위가 어떻게 되나요?" },
    { sender: "구직자", message: "이런 부분을 담당할 수 있습니다." },
  ],
  "4": [
    { sender: "구인자", message: "지원자 중 몇 분이 계신가요?" },
    { sender: "구직자", message: "현재 3명 있습니다." },
  ],
};

export default function ChatRoomPage() {
  const router = useRouter();
  const { id } = useParams(); // params는 string | undefined 타입을 반환
  const chatId = id as string; // id를 string으로 강제 변환

  const [messages, setMessages] = useState(dummyChats[chatId] || []);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { sender: "구직자", message: input }]);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col p-4 h-screen">
      <h1 className="text-xl font-bold">이거 해주세요</h1>

      <div className="flex-1 overflow-y-auto mt-4 space-y-4">
        {messages.map((chat, index) => (
          <div key={index} className={`flex ${chat.sender === "구직자" ? "justify-end" : "justify-start"}`}>
            <div className="p-3 bg-gray-200 rounded-lg max-w-xs">
              <p className="text-sm font-semibold">{chat.sender}</p>
              <p>{chat.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 입력창 */}
      <div className="flex items-center mt-4 p-2 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="입력하세요"
        />
        <button onClick={sendMessage} className="ml-2 p-2 bg-gray-500 text-white rounded-lg">
          전송
        </button>
      </div>
    </div>
  );
}
