import type { Metadata } from "next";
import { Inter, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/providers/language-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"], variable: "--font-eth", display: "swap" });

export const metadata: Metadata = {
  title: "Ephrem Abtaye — Video Editor & Graphic Designer",
  description: "Portfolio of a professional video editor: commercials, music videos, cinematic edits, social content.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${ethiopic.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          {children}
          <Toaster position="top-right" theme="dark" richColors />
        </LanguageProvider>
      </body>
    </html>
  );
}
