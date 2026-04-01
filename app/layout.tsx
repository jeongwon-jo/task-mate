import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Taskmate - AI 기반 업무 관리",
    template: "%s | Taskmate",
  },
  description: "AI 기반 개인 업무 관리 SaaS. 할 일, 일정, 메모를 스마트하게 관리하세요.",
  keywords: ["할 일", "업무 관리", "생산성", "태스크 매니저", "SaaS"],
  authors: [{ name: "Taskmate" }],
  openGraph: {
    title: "Taskmate - AI 기반 업무 관리",
    description: "AI 기반 개인 업무 관리 SaaS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
