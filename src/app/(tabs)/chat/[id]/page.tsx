"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import * as Stomp from "webstomp-client";

interface ChatMessage {
  senderNickname: string;
  content: string;
  senderId: number;
}


export default function ChatRoomPage() {
  const router = useRouter();
  const { id } = useParams(); // params는 string | undefined 타입을 반환
  const chatId = id as string; // id를 string으로 강제 변환

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);

  const [input, setInput] = useState("");
  const [stompClient, setStompClient] = useState<any>(null);

  useEffect(() => {
    console.log("🔥 useEffect 실행됨 - WebSocket 연결 및 채팅 내역 가져오기");

    connectWebsocket();
    fetchChatHistory();

    const handleUnload = async () => {
      await disconnectWebSocket();
    };
  
    // 페이지를 떠날 때 실행
    window.addEventListener('beforeunload', handleUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      disconnectWebSocket();
    };
  }, []);


  const connectWebsocket = () => {
    const token = localStorage.getItem('accessToken');
    console.log("🟢 WebSocket 연결 시도");


    // 이미 연결 되어있으면 연결 안함
    if (stompClient && stompClient.connected) return;

    const sockJs = new SockJS(`${process.env.NEXT_PUBLIC_API_URL}api/connect`);
    const client = Stomp.over(sockJs);
    // const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

    client.connect(
      {
        // 헤더자리
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      },() => {
      client.subscribe(`api/topic/${chatId}`, (message) => {
        const parsedMessage = JSON.parse(message.body);
        console.log("🟢 수신된 메시지:", parsedMessage);
        setMessages((prevMessages) => [...prevMessages, parsedMessage]);
      },
      {
        // 헤더자리
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }
    );
    },
    (error) => {
      console.error('WebSocket 연결 에러:', error);
      }
    );
    setStompClient(client);
  };

  const fetchChatHistory = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}api/chat/history/${chatId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      setMessages(response.data.data.messages);
      setCurrentMemberId(response.data.data.currentMemberId);
    } catch (error) {
      
      console.error("채팅 내역을 불러오는데 실패했습니다:", error);
    }
  };

  const sendMessage = () => {
    if (input.trim() === "" || !stompClient) return;
    const message = { content: input };
    const token = localStorage.getItem('accessToken');
    stompClient.send(`/api/publish/${chatId}`, 
      JSON.stringify(message),
      {
        // 헤더자리
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      });
    setInput("");
  };

  // 나가기 버튼 눌렀을 때
  // const disconnectWebSocket = async () => {
  //   await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat/room/${chatId}/read`);
  //   if (stompClient && stompClient.connected) {
  //     stompClient.unsubscribe(`/topic/${chatId}`);
  //     stompClient.disconnect();
  //   }
  // };

  const disconnectWebSocket = async () => {
    console.log("Disconnecting WebSocket...");
    try {
      // const token = localStorage.getItem('accessToken');
      // await axios.post(
      //   `${process.env.NEXT_PUBLIC_API_URL}/chat/room/${chatId}/read`,
      //   {},
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     }
      //   }
      // );
  
      if (stompClient && stompClient.connected) {
        stompClient.unsubscribe(`api/topic/${chatId}`);
        stompClient.disconnect();
        console.log("WebSocket disconnected successfully");
      }
    } catch (error) {
      console.error("Error disconnecting WebSocket:", error);
    }
  };

  return (
    <div className="flex flex-col p-4 h-screen">
      <h1 className="text-xl font-bold">이거 해주세요</h1>

      <div className="flex-1 overflow-y-auto mt-4 space-y-4">
        {messages.map((chat, index) => (
          <div key={index} className={`flex ${chat.senderId === currentMemberId ? "justify-end" : "justify-start"}`}>
            <div className="p-3 bg-gray-200 rounded-lg max-w-xs">
              <p className="text-sm font-semibold">{chat.senderNickname}</p>
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
