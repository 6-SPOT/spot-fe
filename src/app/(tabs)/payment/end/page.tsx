"use client";

import { useRouter } from "next/router";

export default function PaymenEndPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">결제 완료</h1>
            <p className="text-gray-600 mb-6">결제가 성공적으로 완료되었습니다.</p>

            <button
                onClick={() => router.push("/home")}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
                홈으로 가기
            </button>
        </div>
    );
}