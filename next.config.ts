import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["soomin-bucket-1.s3.ap-northeast-2.amazonaws.com"], // ✅ S3 버킷 도메인 추가
  },
};

export default nextConfig;
