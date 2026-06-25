import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import AuthButton from "@/components/AuthButton";
import { ThemeProvider } from "@/components/ThemeProvider";
import DarkModeToggle from "@/components/DarkModeToggle";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIコーチ習慣トラッカー",
  description: "毎日の習慣を記録し、AIコーチが励ましと改善提案を返すアプリ",
  icons: {
    apple: "/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <AuthProvider>
            <ServiceWorkerRegistration />
            <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
              <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 px-4 py-2">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  AIコーチ習慣トラッカー
                </span>
                <div className="flex items-center gap-1">
                  <DarkModeToggle />
                  <AuthButton />
                </div>
              </div>
            </header>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
