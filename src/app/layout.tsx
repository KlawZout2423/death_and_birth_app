import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "DOB - Death & Birth",
  description: "A platform to celebrate life and remember those we've lost",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <Navbar />
        <main>{children}</main>
        <ChatBot />
      </body>
    </html>
  );
}
