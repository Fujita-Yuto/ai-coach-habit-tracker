import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AIコーチ習慣トラッカー",
    short_name: "習慣トラッカー",
    description: "毎日の習慣を記録し、AIコーチが励ましと改善提案を返すアプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#4f46e5",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
