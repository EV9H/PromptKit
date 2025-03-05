import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Toaster } from "@/components/ui/toaster";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { createClient } from "@/utils/supabase/server";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { Heading } from "@/components/typography/heading";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "PromptKit - Discover, Create & Share AI Prompts",
  description: "Your personal library for organizing, creating, and sharing powerful AI prompts.",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-8 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 fixed top-0 z-50 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/"}><Heading>PromptKit</Heading></Link>
                    <Link href={"/prompts/explore"} className="text-muted-foreground hover:text-foreground">
                      Explore
                    </Link>
                    <Link href={"/prompts/create"} className="text-muted-foreground hover:text-foreground">
                      Create
                    </Link>
                    <Link href={"/extension"} className="text-muted-foreground hover:text-foreground">
                      Extension
                    </Link>

                  </div>
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}

                </div>
              </nav>
              <div className="flex flex-col gap-8 px-8 w-full mt-16">
                {children}
              </div>

              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-10">
                <p>
                  Powered by{" "}
                  <a
                    href="https://agilee.app"
                    target="_blank"
                    className="font-bold hover:underline"
                    rel="noreferrer"
                  >
                    Agilee
                  </a>
                </p>
              </footer>
            </div>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
