import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Storytime Studio",
  description: "Turn an original family idea into a read-aloud storybook.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
