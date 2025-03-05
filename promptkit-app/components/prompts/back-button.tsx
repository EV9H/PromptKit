"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface BackButtonProps {
    fallbackUrl: string;
    className?: string;
    lastPromptsPage?: string;
}

export function BackButton({ fallbackUrl, className = "", lastPromptsPage }: BackButtonProps) {
    const router = useRouter();
    const [canUseHistory, setCanUseHistory] = useState(false);
    const [referrerPath, setReferrerPath] = useState<string | null>(null);

    // Check if we can use browser history and get referrer
    useEffect(() => {
        // Check if we have history entries to go back to
        setCanUseHistory(window.history.length > 1);

        // Try to get referrer URL if it's from our site
        const referrer = document.referrer;
        if (referrer && referrer.includes(window.location.origin)) {
            try {
                const url = new URL(referrer);
                // Only use referrer if it's from the prompts section
                if (url.pathname.includes('/prompts')) {
                    setReferrerPath(url.pathname + url.search);
                }
            } catch (e) {
                console.error("Error parsing referrer URL:", e);
            }
        }
    }, []);

    const handleBackClick = useCallback((e: React.MouseEvent) => {
        if (canUseHistory) {
            e.preventDefault();
            router.back();
        }
        // If we can't use history but have a referrer, use that
        else if (referrerPath) {
            e.preventDefault();
            router.push(referrerPath);
        }
        // If we have a lastPromptsPage from the server, use that
        else if (lastPromptsPage) {
            e.preventDefault();
            router.push(lastPromptsPage);
        }
        // Otherwise, the Link component will handle navigation to fallbackUrl
    }, [canUseHistory, referrerPath, lastPromptsPage, router]);

    return (
        <Link
            href={referrerPath || lastPromptsPage || fallbackUrl}
            className={`flex items-center text-muted-foreground hover:text-foreground transition-colors gap-1 ${className}`}
            onClick={handleBackClick}
        >
            <ChevronLeft className="h-4 w-4" />
            Back to Prompts
        </Link>
    );
} 