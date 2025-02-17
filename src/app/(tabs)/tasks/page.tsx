"use client";

import { useRouter } from "next/navigation";

// 더미 데이터 (작업 리스트)
const tasks = [
  { id: "1", title: "이거 해주세요", status: "요청중" },
  { id: "2", title: "이거 해주세요", status: "진행중" },
  { id: "3", title: "이거 해주세요", status: "승인대기" },
];

export default function TasksPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold">작업 현황</h1>

      <div className="w-full mt-4 space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() =>
              router.push(
                task.status === "요청중"
                  ? `/tasks/request/${task.id}`
                  : `/tasks/in_progress/${task.id}`
              )
            }
            className="p-4 bg-gray-200 rounded-lg cursor-pointer"
          >
            <h2 className="font-semibold">{task.title}</h2>
            <p>상태: {task.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
