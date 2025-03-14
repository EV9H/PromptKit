"use client"

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TrendingPromptCard } from "@/components/prompts/trending-prompt-card";
import { Button } from "@/components/ui/button";
import { usePathname, useSearchParams } from "next/navigation";

interface PromptGridProps {
    prompts: any[];
    currentPage: number;
    totalPages: number;
    searchTerm?: string;
}

export function PromptGrid({ prompts, currentPage, totalPages, searchTerm }: PromptGridProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());

        // Preserve the tab and search parameters
        const tab = searchParams.get("tab");
        if (tab) {
            params.set("tab", tab);
        }

        // Add search term if it exists
        if (searchTerm) {
            params.set("search", searchTerm);
        }

        return `${pathname}?${params.toString()}`;
    };

    return (
        <div className="space-y-8">
            {prompts.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No prompts found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prompts.map((prompt) => (
                        <TrendingPromptCard key={prompt.id} prompt={prompt} />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage <= 1}
                        asChild={currentPage > 1}
                    >
                        {currentPage > 1 ? (
                            <Link href={createPageURL(currentPage - 1)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>

                    <span className="text-sm text-muted-foreground px-2">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage >= totalPages}
                        asChild={currentPage < totalPages}
                    >
                        {currentPage < totalPages ? (
                            <Link href={createPageURL(currentPage + 1)}>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
} 