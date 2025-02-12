export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
