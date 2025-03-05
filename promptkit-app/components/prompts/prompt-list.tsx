import React from 'react';
import Link from 'next/link';
import { ProcessedPrompt } from '@/utils/prompt-utils';
import { TrendingPromptCard } from './trending-prompt-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PromptListProps {
    prompts: ProcessedPrompt[];
    totalPages: number;
    currentPage: number;
    baseUrl: string;
    searchParams?: Record<string, string>;
}

export function PromptList({
    prompts,
    totalPages,
    currentPage,
    baseUrl,
    searchParams = {}
}: PromptListProps) {
    // Function to generate pagination URLs
    const getPaginationUrl = (page: number) => {
        const params = new URLSearchParams();

        // Add all existing search params
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        // Set the page parameter
        params.set('page', page.toString());

        return `${baseUrl}?${params.toString()}`;
    };
    return (
        <div>
            {/* Prompts Grid */}
            {prompts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-8">
                    {prompts.map((prompt) => (
                        <TrendingPromptCard
                            key={prompt.id}
                            prompt={{
                                id: prompt.id,
                                title: prompt.title,
                                description: prompt.description || null,
                                created_at: prompt.created_at,
                                updated_at: prompt.updated_at,
                                copy_count: prompt.copy_count,
                                user_id: prompt.user_id,
                                creator_username: prompt.profile?.username || undefined,
                                creator_avatar: prompt.profile?.avatar_url || undefined,
                                like_count: prompt.like_count || 0,
                                view_count: prompt.view_count || 0,
                                preview_image: prompt.preview_image || null,
                                content: prompt.content,
                                is_public: prompt.is_public
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No prompts found</h3>
                    <p className="text-muted-foreground mt-2">
                        Try adjusting your search or filters
                    </p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        asChild={currentPage > 1}
                    >
                        {currentPage > 1 ? (
                            <Link href={getPaginationUrl(currentPage - 1)}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Link>
                        ) : (
                            <>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </>
                        )}
                    </Button>

                    <div className="text-sm mx-4">
                        Page {currentPage} of {totalPages}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        asChild={currentPage < totalPages}
                    >
                        {currentPage < totalPages ? (
                            <Link href={getPaginationUrl(currentPage + 1)}>
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        ) : (
                            <>
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
} 