"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import API_Manager from "../../../lib/API_Manager"; // API_Manager import 필요

// 더미 채팅방 데이터
interface ChatRoom {
  roomId: number;
  title: string;
  unReadCount: number | null;
}

export default function ChatListPage() {
  const router = useRouter();
  // const [chatList, setChatList] = useState([]);
  const [chatList, setChatList] = useState<ChatRoom[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // 채팅방 목록 가져오기
      await fetchChatRooms();
    };

    const fetchChatRooms = async () => {
      const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzQwNTUyMDg5LCJleHAiOjE3NDA1NjIwODl9.vScyRVf6B-f0uI0dfr7thW-YlAA6R49gtcKqqNlx-E2Oaj0QSImYJJSjsLZ4lAwi" // 추가적인 헤더

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/my/rooms`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }
        );
        setChatList(response.data.data);
      } catch (error) {
        console.error("채팅방 목록을 불러오는데 실패했습니다:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold">채팅 목록</h1>

      <div className="w-full mt-4 space-y-4">
        {chatList.map((chat) => (
          <div
            key={chat.roomId}
            onClick={() => router.push(`/chat/${chat.roomId}`)}
            className="p-4 bg-gray-200 rounded-lg cursor-pointer"
          >
            <h2 className="font-semibold">{chat.title}</h2>
            {/* <p>{chat.lastMessage}</p> */}
          </div>
        ))}
      </div>
    </div>
  );
}
