"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_Manager from "@/lib/API_Manager";

export default function PaySuccessRedirectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("PaySuccessRedirectPage Loaded!");

        const processPayment = async () => {
            // ✅ 현재 URL의 쿼리스트링 파싱
            const urlParams = new URLSearchParams(window.location.search);
            const pgToken = urlParams.get("pg_token");

            if (pgToken) {
                try {
                    const token = localStorage.getItem("accessToken");
                    const jobTitle = localStorage.getItem("jobTitle");
                    const tid = localStorage.getItem("tid");
                    const totalAmount = localStorage.getItem("totalAmount"); // 기본값 설정

                    if (!token || !jobTitle || !tid) {
                        throw new Error("필요한 결제 정보가 부족합니다.");
                    }

                    const requestData = {
                        pgToken,
                        jobTitle,
                        totalAmount,
                        tid
                    };

                    const response = await API_Manager.post("/api/pay/deposit", requestData, {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    });

                    console.log("✅ 결제 승인 성공! 응답 데이터:", response);

                    router.push('/payment/end');
                } catch (error) {
                    console.error("❌ 결제 승인 실패:", error);
                    alert(`결제 승인 실패: ${error || "서버 오류"}`);
                } finally {
                    setLoading(false);
                }
            }
        };

        processPayment();
    }, [router]);

    return <div>Loading...</div>; // 로딩 화면 표시
}

