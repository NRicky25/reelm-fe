import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: { default: "Reelm: Anime, Movies & Series", template: "%s · Reelm" },
  description: "Stream anime, movies, and series on Reelm.",
};

export const viewport: Viewport = {
  themeColor: "#1c1d21",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} antialiased`}>{children}</body>
    </html>
  );
}
