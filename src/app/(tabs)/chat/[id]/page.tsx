"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import * as Stomp from "webstomp-client";

interface ChatMessage {
  sender: string;
  content: string;
}


export default function ChatRoomPage() {
  const router = useRouter();
  const { id } = useParams(); // params는 string | undefined 타입을 반환
  const chatId = id as string; // id를 string으로 강제 변환

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState<any>(null);

  useEffect(() => {
    connectWebsocket();
    fetchChatHistory();
  }, []);

  useEffect(() => {
    // 언마운트 될때
    return () => {
      const disconnect = async () => {
        // await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat/room/${chatId}/read`);
        if (stompClient && stompClient.connected) {
          stompClient.unsubscribe(`/api/topic/${chatId}`);
          stompClient.disconnect();
        }
      };
      disconnect();
    };
  }, []);

  const connectWebsocket = () => {
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzQwNTUyMDg5LCJleHAiOjE3NDA1NjIwODl9.vScyRVf6B-f0uI0dfr7thW-YlAA6R49gtcKqqNlx-E2Oaj0QSImYJJSjsLZ4lAwi" // 추가적인 헤더


    // 이미 연결 되어있으면 연결 안함
    if (stompClient && stompClient.connected) return;

    const sockJs = new SockJS(`${process.env.NEXT_PUBLIC_API_URL}/api/connect`);
    const client = Stomp.over(sockJs);
    // const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    client.connect(
      {
        // 헤더자리
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },() => {
      client.subscribe(`/api/topic/${chatId}`, (message) => {
        const parsedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, parsedMessage]);
      });
    },
    (error) => {
      console.error('WebSocket 연결 에러:', error);
      }
    );
    setStompClient(client);
  };

  const fetchChatHistory = async () => {
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzQwNTUyMDg5LCJleHAiOjE3NDA1NjIwODl9.vScyRVf6B-f0uI0dfr7thW-YlAA6R49gtcKqqNlx-E2Oaj0QSImYJJSjsLZ4lAwi" // 추가적인 헤더

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/history/${chatId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      setMessages(response.data.data);
    } catch (error) {
      
      console.error("채팅 내역을 불러오는데 실패했습니다:", error);
    }
  };

  const sendMessage = () => {
    if (input.trim() === "" || !stompClient) return;
    const message = { content: input };
    stompClient.send(`/api/publish/${chatId}`, JSON.stringify(message));
    setInput("");
  };

  // // 나가기 버튼 눌렀을 때
  // const disconnectWebSocket = async () => {
  //   await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat/room/${chatId}/read`);
  //   if (stompClient && stompClient.connected) {
  //     stompClient.unsubscribe(`/topic/${chatId}`);
  //     stompClient.disconnect();
  //   }
  // };

  return (
    <div className="flex flex-col p-4 h-screen">
      <h1 className="text-xl font-bold">이거 해주세요</h1>

      <div className="flex-1 overflow-y-auto mt-4 space-y-4">
        {messages.map((chat, index) => (
          <div key={index} className={`flex ${chat.sender === "구직자" ? "justify-end" : "justify-start"}`}>
            <div className="p-3 bg-gray-200 rounded-lg max-w-xs">
              <p className="text-sm font-semibold">{chat.sender}</p>
              <p>{chat.content}</p>
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              sendMessage();
            }
          }}
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
