import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Replio | 返信文生成", description: "メールやチャットの返信文を作成" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
