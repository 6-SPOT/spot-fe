"use client";

import { useRouter } from "next/navigation";

// 더미 채팅방 데이터
const chatRooms = [
  { id: "1", title: "1 해주세요", lastMessage: "1이 어느정도까지인가요" },
  { id: "2", title: "2 해주세요", lastMessage: "2가 어느정도까지인가요" },
  { id: "3", title: "3 해주세요", lastMessage: "3이 어느정도까지인가요" },
  { id: "4", title: "4 해주세요", lastMessage: "4가 어느정도까지인가요" },
];

export default function ChatListPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold">채팅 목록</h1>

      <div className="w-full mt-4 space-y-4">
        {chatRooms.map((chat) => (
          <div
            key={chat.id}
            onClick={() => router.push(`/chat/${chat.id}`)}
            className="p-4 bg-gray-200 rounded-lg cursor-pointer"
          >
            <h2 className="font-semibold">{chat.title}</h2>
            <p>{chat.lastMessage}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
