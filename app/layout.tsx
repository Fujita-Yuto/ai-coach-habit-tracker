import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import AuthButton from "@/components/AuthButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIコーチ習慣トラッカー",
  description: "毎日の習慣を記録し、AIコーチが励ましと改善提案を返すアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900">
          <AuthProvider>
            <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur">
              <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">
                <span className="text-xs font-semibold text-indigo-600">AIコーチ習慣トラッカー</span>
                <AuthButton />
              </div>
            </header>
            {children}
          </AuthProvider>
        </body>
    </html>
  );
}
