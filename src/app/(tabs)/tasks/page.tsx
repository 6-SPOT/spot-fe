"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { API_Manager } from "../../../lib/API_Manager" // API Manager 임포트

interface Task {
  jobId: string
  title: string
  img: string
  content: string
  status: string // API에서 받은 상태값 (문자열)
  memberId: string
  nickName: string
  phone: string
  owner: boolean
}

// 상태값 변환 (이미지 기반 상태 매핑 적용)
const getStatusLabel = (status: string) => {
  if (status === "ATTENDER" || status === "REQUEST" || status === "OWNER") return "요청중"
  if (status === "YES") return "수락"
  if (status === "START") return "진행중"
  if (status === "FINISH") return "승인대기"
  return "알 수 없음"
}

// 상태별 진행도 지정
const getStatusProgress = (status: string) => {
  switch (status) {
    case "OWNER":
    case "ATTENDER":
    case "REQUEST":
      return "0%" // 요청중
    case "YES":
      return "30%" // 수락됨
    case "START":
      return "50%" // 진행중
    case "FINISH":
      return "92%" // 승인대기
    default:
      return "0%"
  }
}

// 🔹 페이지 이동 경로 설정
const getTaskRoute = (status: string, isRequest: boolean, jobId: string, owner: boolean) => {
  const basePath = isRequest
    ? status === "ATTENDER" || status === "REQUEST" || status === "OWNER"
      ? `/tasks/request/${jobId}`
      : `/tasks/in_progress/${jobId}`
    : status === "ATTENDER" || status === "REQUEST"
      ? `/detail/${jobId}`
      : `/tasks/in_progress/${jobId}`;

  return `${basePath}?owner=${owner}`;
}

export default function TasksPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"requests" | "solutions">("requests")
  const [myRequests, setMyRequests] = useState<Task[]>([])
  const [mySolutions, setMySolutions] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // API 요청 함수
  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const accessToken = localStorage.getItem("accessToken");
      
      // "내 의뢰" (내가 맡긴 일)
      const requestsData = await API_Manager.get("/api/job/dash-board", {}, {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      })

      // "내 해결" (내가 신청하거나 진행 중인 일)
      const solutionsData = await API_Manager.get("/api/job/worker/dash-board", {}, {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      })

      if (requestsData.status === "success") {
        setMyRequests(requestsData.data) // 내 의뢰 목록 업데이트
      } else {
        setError("내 의뢰 데이터를 불러오지 못했습니다.")
      }

      if (solutionsData.status === "success") {
        setMySolutions(solutionsData.data) // 내 해결 목록 업데이트
      } else {
        setError("내 해결 데이터를 불러오지 못했습니다.")
      }
      
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    fetchData()
  }, [])

  const tasks = activeTab === "requests" ? myRequests : mySolutions

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">작업 현황</h1>

      {/* 상단 탭 네비게이션 (스크롤 고정) */}
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

      {/* 데이터 로딩 상태 */}
      {loading && <p className="text-gray-500 text-center mt-4">데이터 불러오는 중...</p>}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {/* 작업 리스트 */}
      <div className="w-full space-y-4 mt-4">
        {!loading && !error && tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.jobId}
              onClick={() => router.push(getTaskRoute(task.status, activeTab === "requests", task.jobId, task.owner))}
              className="p-6 bg-gray-100 rounded-lg cursor-pointer"
            >
              <div className="flex items-start gap-4">
                {/* 이미지 */}
                <img src={task.img || "/placeholder.png"} alt="작업 이미지" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                
                <div className="flex-1">
                  <h2 className="text-lg font-medium mb-1">{task.title}</h2>
                  <p className="text-sm text-gray-600 mb-1">{task.content}</p>
                </div>
              </div>

              {/* 진행 상태 바 */}
              <div className="mt-6">
                <p className="text-sm font-medium mb-3">처리 현황: {getStatusLabel(task.status)}</p>
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
                    {["요청중", "수락", "진행중", "승인대기"].map((label) => (
                      <span
                        key={label}
                        className={`text-xs ${getStatusLabel(task.status) === label ? "text-black font-medium" : "text-gray-600"}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && <p className="text-gray-500 text-center">현재 {activeTab === "requests" ? "의뢰한" : "해결 중인"} 작업이 없습니다.</p>
        )}
      </div>
    </div>
  )
}
