"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

export default function PointRegisterPage() {
    const router = useRouter();
    const [pointCode, setPointCode] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRegister = async () => {
        if (!pointCode) {
            setMessage("포인트 코드를 입력하세요.");
            return;
        }

        try {
            const response = await axios.get("https://ilmatch.net/api/point/register", {
                params: { pointCode },
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true
            });

            setMessage(response.data.message);
            console.log(response);

            setIsModalOpen(true);
        } catch (error: any) {
            setMessage(error.message || "오류가 발생했습니다.");
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            setToken(localStorage.getItem("accessToken"));
        }
    }, []);

    return (
        <div className="flex flex-col p-4">
            <div className="w-full flex justify-center mb-6">
                <Image src="/spot-logo.png" alt="Spot Logo" width={150} height={150} priority />
            </div>

            <h1 className="text-2xl font-bold">포인트 등록</h1>
            <p className="mt-2 text-gray-600">보유한 포인트 코드를 입력하세요.</p>

            <input
                type="text"
                value={pointCode}
                onChange={(e) => setPointCode(e.target.value)}
                placeholder="포인트 코드 입력"
                className="mt-4 p-2 border rounded-lg w-full"
            />

            <button
                onClick={handleRegister}
                className="mt-4 p-2 bg-blue-500 text-white rounded-lg w-full hover:bg-blue-600"
            >
                등록
            </button>

            {message && <p className="mt-2 text-red-500">{message}</p>}

            <button
                onClick={() => router.push("/mypage")}
                className="mt-4 p-2 bg-gray-300 text-black rounded-lg w-full hover:bg-gray-400"
            >
                마이페이지로 돌아가기
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold">포인트 등록 완료</h2>
                        <p className="mt-2 text-gray-600">포인트가 등록되었습니다.</p>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}