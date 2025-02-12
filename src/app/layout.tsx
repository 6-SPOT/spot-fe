import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spot Project",
  description: "Next.js + Tailwind CSS + Capacitor 웹 앱",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="flex flex-col min-h-screen overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {children}
      </body>
    </html>
  );
}

