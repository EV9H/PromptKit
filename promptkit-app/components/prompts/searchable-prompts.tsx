"use client"

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { TrendingPromptCard } from "@/components/prompts/trending-prompt-card";

interface SearchablePromptsProps {
    prompts: any[];
    activeTab: string; // Only used for identification, not for URL manipulation
}

export function SearchablePrompts({ prompts, activeTab }: SearchablePromptsProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPrompts, setFilteredPrompts] = useState(prompts);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // Filter prompts based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPrompts(prompts);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = prompts.filter(prompt =>
                (prompt.title && prompt.title.toLowerCase().includes(term)) ||
                (prompt.description && prompt.description.toLowerCase().includes(term)) ||
                (prompt.content && prompt.content.toLowerCase().includes(term))
            );
            setFilteredPrompts(filtered);
        }
        // Reset to first page when search changes
        setCurrentPage(1);
    }, [searchTerm, prompts]);

    // Handle search input change - purely client-side, no URL manipulation
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredPrompts.length / pageSize);
    const paginatedPrompts = filteredPrompts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Handle page change - purely client-side, no URL manipulation
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        // Scroll to top of results
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            {/* Search Form */}
            <div className="flex gap-2">
                <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search your prompts..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {/* Results */}
            {paginatedPrompts.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg mb-4">
                        No prompts found matching "{searchTerm}".
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedPrompts.map((prompt) => (
                            <TrendingPromptCard key={prompt.id} prompt={prompt} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1}
                            >
                                Previous
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Show pages around current page
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className="w-9 h-9 p-0"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
} 