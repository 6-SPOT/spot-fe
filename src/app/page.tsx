import { redirect } from "next/navigation";

export default function Page() {
  redirect("/home"); // 기본적으로 홈 페이지로 이동
  return null;
}
