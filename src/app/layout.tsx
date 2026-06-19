import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vaishnav Villa — 3D Plotting Viewer",
  description: "Interactive 3D visualization of the residential plotting layout.",
  icons: {
    icon: "/branding/sahaj-group.png",
    apple: "/branding/sahaj-group.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app-bg h-full antialiased">{children}</body>
    </html>
  );
}
