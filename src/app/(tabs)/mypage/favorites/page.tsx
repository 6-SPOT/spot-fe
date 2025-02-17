"use client";

import { useRouter } from "next/navigation";

// 더미 찜 목록 데이터
const favorites = [
  { id: "1", title: "이거 해주세요", distance: "2km", price: "15,000원", time: "30분" },
  { id: "2", title: "이거 해주세요", distance: "5km", price: "25,000원", time: "1시간" },
  { id: "3", title: "이거 해주세요", distance: "1km", price: "12,000원", time: "20분" },
];

export default function FavoritesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col p-4">
      <h1 className="text-2xl font-bold">찜 목록</h1>

      <div className="w-full mt-4 space-y-4">
        {favorites.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/detail/${item.id}`)}
            className="p-4 bg-gray-200 rounded-lg cursor-pointer"
          >
            <h2 className="font-semibold">{item.title}</h2>
            <p>📍 {item.distance}</p>
            <p>💰 {item.price}</p>
            <p>⏳ {item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
