import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "MachineryStore — Industrial Equipment", template: "%s | MachineryStore" },
  description: "Your trusted source for generators, solar panels, marine engines, pumps, and industrial machinery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionProvider>
          <ReduxProvider>
            {children}
            <Toaster richColors position="top-right" />
          </ReduxProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
