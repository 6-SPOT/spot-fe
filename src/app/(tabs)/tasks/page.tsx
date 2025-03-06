"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

const myRequests = [
  { id: "1", title: "이거 해주세요", status: "요청중" },
  { id: "10027", title: "이거 해주세요", status: "진행중" },
  { id: "3", title: "이거 해주세요", status: "승인대기" },
]

const mySolutions = [
  { id: "4", title: "이거 해결할게요", status: "진행중" },
  { id: "5", title: "이거 해결할게요", status: "승인대기" },
]

// 상태별 진행도 지정
const getStatusProgress = (status: string) => {
  switch (status) {
    case "요청중":
      return "0%"
    case "진행중":
      return "45%"
    case "승인대기":
      return "calc(100% - 32px)" // 양쪽 패딩(16px * 2 = 32px)을 고려한 전체 너비
    default:
      return "0%"
  }
}

export default function TasksPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"requests" | "solutions">("requests")

  const tasks = activeTab === "requests" ? myRequests : mySolutions

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">작업 현황</h1>

      {/* 상단 탭 네비게이션 (스크롤해도 고정) */}
      <div className="w-full sticky top-0 bg-white z-10">
        <div className="flex w-full border-b">
          <button
            className={`flex-1 py-2 text-center text-lg font-medium ${
              activeTab === "requests" ? "border-b-2 border-black text-black" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            내 의뢰
          </button>
          <button
            className={`flex-1 py-2 text-center text-lg font-medium ${
              activeTab === "solutions" ? "border-b-2 border-black text-black" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("solutions")}
          >
            내 해결
          </button>
        </div>
      </div>

      {/* 작업 리스트 */}
      <div className="w-full space-y-4 mt-4">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() =>
                router.push(task.status === "요청중" ? `/tasks/request/${task.id}` : `/tasks/in_progress/${task.id}`)
              }
              className="p-6 bg-gray-100 rounded-lg cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 bg-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-lg font-medium mb-1">{task.title}</h2>
                  <p className="text-sm text-gray-600 mb-1">내용</p>
                  <p className="text-xs text-gray-500">~~~~~~~~~~~~~~~~~~~~</p>
                </div>
              </div>

              {/* 진행 상태 바 */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">처리 현황</p>
                <div className="relative px-4">
                  {/* 배경 선 */}
                  <div className="absolute left-4 right-4 h-1 bg-gray-300" />

                  {/* 진행 선 */}
                  <div
                    className="absolute left-4 h-1 bg-black transition-all duration-300"
                    style={{
                      width: getStatusProgress(task.status),
                    }}
                  />

                  {/* 상태 텍스트 */}
                  <div className="flex justify-between w-full pt-4">
                    {["요청중", "진행중", "승인대기"].map((status) => (
                      <span
                        key={status}
                        className={`text-xs ${task.status === status ? "text-black font-medium" : "text-gray-600"}`}
                      >
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">현재 작업이 없습니다.</p>
        )}
      </div>
    </div>
  )
}
