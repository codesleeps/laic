import "globals.css";

// Root Layout - LeanBuild AI Platform
import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const appName = "LeanBuild AI";

export const metadata: Metadata = {
  title: appName,
  description: "AI-Powered Lean Construction Consultancy Platform - Build Smarter, Eliminate Waste",
  icons: "https://vybe.build/vybe-icon.svg",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.className}`}>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
