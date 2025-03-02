import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Heading } from "@/components/typography/heading";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { PromptFilterBar } from "@/components/prompts/prompt-filter-bar";

interface ExplorePromptsPageProps {
    searchParams: {
        category?: string;
        sort?: string;
        search?: string;
        page?: string;
    };
}

export default async function ExplorePromptsPage({
    searchParams,
}: ExplorePromptsPageProps) {
    // Make sure to await searchParams
    const params = await searchParams;
    const supabase = await createClient();

    const page = parseInt(params.page || "1");
    const pageSize = 12;
    const offset = (page - 1) * pageSize;

    try {
        // Build query based on search params
        let query = supabase
            .from("prompts")
            .select("*, content", { count: "exact" })
            .eq('is_public', true);

        // Apply category filter if provided
        if (params.category) {
            // In the view, we need to join with prompt_categories to filter by category
            query = query.eq("category_id", params.category);
        }

        // Apply search filter if provided
        if (params.search) {
            query = query.ilike("title", `%${params.search}%`);
        }

        // Apply sorting
        const sortOption = params.sort || "trending";
        switch (sortOption) {
            case "newest":
                query = query.order("created_at", { ascending: false });
                break;
            case "oldest":
                query = query.order("created_at", { ascending: true });
                break;
            case "most_liked":
                query = query.order("like_count", { ascending: false });
                break;
            case "most_copied":
                query = query.order("copy_count", { ascending: false });
                break;
            case "trending":
            default:
                // Using our trending algorithm from the view
                query = query.order("created_at", { ascending: false });
                break;
        }

        // Fetch data with pagination
        const { data: prompts, count, error } = await query
            .range(offset, offset + pageSize - 1);

        // Process prompts to include only a preview of content
        const processedPrompts = prompts?.map(prompt => ({
            ...prompt,
            content: prompt.content && prompt.content.length > 300 ?
                prompt.content.substring(0, 300) : prompt.content
        }));

        // Fetch categories for filter
        const { data: categories } = await supabase
            .from("categories")
            .select("*")
            .order("name");

        const totalPages = count ? Math.ceil(count / pageSize) : 0;

        if (error) {
            console.error("Error fetching prompts:", error);
        }

        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <Heading as="h1" size="2xl">
                        Explore Prompts
                    </Heading>
                    <PromptFilterBar
                        categories={categories || []}
                        selectedCategory={params.category}
                        sort={sortOption}
                        search={params.search || ""}
                    />
                </div>

                {error ? (
                    <div className="text-destructive">
                        Failed to load prompts: {error.message}
                    </div>
                ) : processedPrompts && processedPrompts.length > 0 ? (
                    <PromptGrid
                        prompts={processedPrompts}
                        currentPage={page}
                        totalPages={totalPages}
                    />
                ) : (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground text-lg">
                            No prompts found matching your criteria.
                        </p>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error in explore page:", error);
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-destructive">
                    An error occurred while loading prompts. Please try again later.
                </div>
            </div>
        );
    }
} 