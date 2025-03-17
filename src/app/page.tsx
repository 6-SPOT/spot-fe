import { redirect } from "next/navigation";

export default function Page() {
  return <meta httpEquiv="refresh" content="0;url=/splash" />;
  if (process.env.NODE_ENV === "development") {
    console.error = () => {}; // 모든 console.error 숨기기
    console.warn = () => {}; // console.warn도 숨기기
  }
  
}
