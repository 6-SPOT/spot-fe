import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: 
    [
      "soomin-bucket-1.s3.ap-northeast-2.amazonaws.com",
      "spot-prod-img.s3.ap-northeast-2.amazonaws.com",
      "media2.giphy.com"
    ], // ✅ S3 버킷 도메인 추가
    
  },
};

export default nextConfig;
