'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PromptViewCounterProps {
    promptId: string;
}

export function PromptViewCounter({
    promptId,
}: PromptViewCounterProps) {
    const router = useRouter();

    useEffect(() => {
        // Only run in browser environment
        if (typeof window === 'undefined') return;

        const incrementViewCount = async () => {
            try {
                // Make API call to increment view count
                const response = await fetch(`/api/prompts/${promptId}/view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    // Refresh the page data to show updated count
                    router.refresh();
                } else {
                    console.error('Failed to increment view count:', await response.text());
                }
            } catch (error) {
                console.error('Error incrementing view count:', error);
            }
        };

        // Call the function to increment view count
        incrementViewCount();
    }, [promptId, router]);

    // Don't render anything visible
    return null;
} 