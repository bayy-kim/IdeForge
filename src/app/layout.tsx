import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/lib/auth";
import SessionProvider from "@/components/session-provider";

export const metadata: Metadata = {
  title: "IdeForge — Dari ide jadi rencana teknis",
  description:
    "Ubah ide aplikasi kamu jadi tech stack, PRD, dan task breakdown yang siap dikerjakan — dibantu AI.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  for (let r of regs) r.unregister();
                });
              }
            `,
          }}
        />
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
