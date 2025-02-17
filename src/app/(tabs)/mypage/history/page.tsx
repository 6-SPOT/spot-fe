"use client";

import { useRouter } from "next/navigation";

// 더미 히스토리 데이터
const historyData = [
  { id: "1", title: "이거 해주세요", price: "10,000원", description: "급한 일입니다!" },
  { id: "2", title: "이거 해주세요", price: "20,000원", description: "택배 찾아주세요!" },
  { id: "3", title: "이거 해주세요", price: "30,000원", description: "도움이 필요합니다." },
];

export default function HistoryPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold">히스토리 목록</h1>

      <div className="w-full mt-4 space-y-4">
        {historyData.map((task) => (
          <div
            key={task.id}
            onClick={() => router.push(`/tasks/in_progress/${task.id}`)}
            className="p-4 bg-gray-200 rounded-lg cursor-pointer"
          >
            <h2 className="font-semibold">{task.title}</h2>
            <p>{task.description}</p>
            <p>💰 {task.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
