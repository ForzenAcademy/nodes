import type { Metadata } from "next";
import "./globals.css";

const releaseBasePath = process.env.FACTORINODE_RELEASE_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "FACTORINODE",
  description: "A node-based automation game.",
  icons: {
    icon: `${releaseBasePath}/favicon.svg`,
    shortcut: `${releaseBasePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
