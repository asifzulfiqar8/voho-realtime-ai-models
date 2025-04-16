import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Voho Realtime Demo",
  description:
    "Demonstration of using the Voho API to create a call with an AI agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <!-- Fathom - beautiful, simple website analytics --> */}
        <script
          src="https://cdn.usefathom.com/script.js"
          data-site="ONYOCTXK"
          defer
        ></script>
      </head>
      <body className="w-full h-full">
        <main>{children}</main>
      </body>
    </html>
  );
}
