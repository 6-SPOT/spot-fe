import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // 텍스트 스타일 개선
    require("@tailwindcss/forms"), // 폼 스타일 최적화
    require("@tailwindcss/aspect-ratio"), // 이미지 비율 조정
  ],
} satisfies Config;
