import type { Metadata } from "next";
import { Figtree, Inter } from "next/font/google";
import "./globals.css";
import { ThemesProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Font Optimization
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// The Metadata Object
export const metadata: Metadata = {
  title: "Next Chat App",
  description: "A modern chat application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // We add the variable to the html or body tag
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(figtree.variable, inter.variable)}
    >
      <body className="antialiased">
        <ThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemesProvider>
      </body>
    </html>
  );
}
