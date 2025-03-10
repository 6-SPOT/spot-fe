"use client";

import { useState } from "react";
import API_Manager from "@/lib/API_Manager"; // API Manager 가져오기
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PointCreationPage() {
    const router = useRouter();
    const [pointName, setPointName] = useState("");
    const [point, setPoint] = useState("");
    const [count, setCount] = useState("");
    const [message, setMessage] = useState<string | null>(null);

    const handleCreatePoint = async () => {
        if (!pointName || !point || !count) {
            setMessage("모든 필드를 입력하세요.");
            return;
        }

        try {
            const requestBody = [
                {
                    pointName,
                    point: Number(point),
                    count: Number(count),
                },
            ];

            const response = await API_Manager.post("/api/point/serve", requestBody);

            setMessage(`포인트 생성 완료! 코드: ${response.data[0].pointCode}`);
        } catch (error: any) {
            console.error("API 요청 실패:", error);
            setMessage(error.message || "오류가 발생했습니다.");
        }
    };

    return (
        <div className="flex flex-col p-4">
            <div className="w-full flex justify-center mb-6">
                <Image src="/spot-logo.png" alt="Spot Logo" width={150} height={150} priority />
            </div>
            <h1 className="text-2xl font-bold">포인트 생성</h1>
            <p className="mt-2 text-gray-600">유저들이 사용할 포인트를 생성하세요.</p>

            <input
                type="text"
                value={pointName}
                onChange={(e) => setPointName(e.target.value)}
                placeholder="포인트 이름 입력"
                className="mt-4 p-2 border rounded-lg w-full"
            />

            <input
                type="number"
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                placeholder="포인트 액수 입력"
                className="mt-4 p-2 border rounded-lg w-full"
            />

            <input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                placeholder="배포 개수 입력"
                className="mt-4 p-2 border rounded-lg w-full"
            />

            <button
                onClick={handleCreatePoint}
                className="mt-4 p-2 bg-blue-500 text-white rounded-lg w-full hover:bg-blue-600"
            >
                생성
            </button>

            {message && <p className="mt-2 text-green-600">{message}</p>}

            <button
                onClick={() => router.push("/mypage")}
                className="mt-4 p-2 bg-gray-300 text-black rounded-lg w-full hover:bg-gray-400"
            >
                마이페이지로 돌아가기
            </button>
        </div>
    );
}