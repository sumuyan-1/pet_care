import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "尾巴日记 · 宠物洗护",
  description: "尾巴日记宠物洗护，为每一只毛孩子安排舒服、安心的护理时光。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#f4f3ea" />
      </head>
      <body>{children}</body>
    </html>
  );
}
