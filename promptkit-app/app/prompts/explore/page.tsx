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
    const supabase = await createClient();
    const page = parseInt(searchParams.page || "1");
    const pageSize = 12;
    const offset = (page - 1) * pageSize;

    // Build query based on search params
    let query = supabase
        .from("public_prompts")
        .select("*", { count: "exact" });

    // Apply category filter if provided
    if (searchParams.category) {
        query = query.eq("category_id", searchParams.category);
    }

    // Apply search filter if provided
    if (searchParams.search) {
        query = query.ilike("title", `%${searchParams.search}%`);
    }

    // Apply sorting
    const sortOption = searchParams.sort || "trending";
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

    // Fetch categories for filter
    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .order("name");

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <Heading as="h1" size="2xl">
                    Explore Prompts
                </Heading>
                <PromptFilterBar
                    categories={categories || []}
                    selectedCategory={searchParams.category}
                    sort={sortOption}
                    search={searchParams.search || ""}
                />
            </div>

            {error ? (
                <div className="text-destructive">
                    Failed to load prompts: {error.message}
                </div>
            ) : prompts && prompts.length > 0 ? (
                <PromptGrid
                    prompts={prompts}
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
} 