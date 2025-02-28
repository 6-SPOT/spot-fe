"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        console.log("OAuth Redirect Page Loaded!");

        // 현재 URL의 쿼리스트링 파싱
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("accessToken");
        const refreshToken = urlParams.get("refreshToken");
        const nickname = urlParams.get("nickname");

        if (accessToken && refreshToken && nickname) {
            // ✅ 로컬 스토리지에 저장
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("nickname", nickname);

            // ✅ 채팅 페이지로 이동
            router.push('/home');
        }
    }, [router]);

    return <div>Loading...</div>; // 로딩 화면 표시
}
