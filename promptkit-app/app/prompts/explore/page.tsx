import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Heading } from "@/components/typography/heading";
import { PromptGrid } from "@/components/prompts/prompt-grid";
import { PromptFilterBar } from "@/components/prompts/prompt-filter-bar";
import { PromptCategoryList } from "@/components/prompts/prompt-category-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PostgrestError } from "@supabase/supabase-js";
import { fetchPromptsWithProfiles, fetchCategories } from "@/utils/prompt-utils";
import { PromptList } from "@/components/prompts/prompt-list";
import { CategoryFilterBar } from "@/components/prompts/category-filter-bar";

interface ExplorePageProps {
    searchParams: {
        category?: string;
        sort?: string;
        search?: string;
        page?: string;
    };
}

interface Prompt {
    id: string;
    title: string;
    content: string;
    description?: string;
    is_public: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
    copy_count: number;
    [key: string]: any;
}

interface Profile {
    id: string;
    username?: string;
    avatar_url?: string;
    [key: string]: any;
}

export default async function ExplorePage({
    searchParams,
}: ExplorePageProps) {
    const categoryId = (await searchParams).category || "";
    const search = (await searchParams).search || "";
    const sort = (await searchParams).sort || "trending";
    const page = parseInt((await searchParams).page || "1");

    try {
        // Fetch all categories for the filter bar
        const categories = await fetchCategories();

        // Fetch prompts with or without category filter
        const { prompts, totalPages, currentPage } = await fetchPromptsWithProfiles({
            categoryId: categoryId || undefined,
            search,
            sort: sort as any,
            page,
            isPublic: true
        });

        // Get the current category if one is selected
        const currentCategory = categoryId
            ? categories.find(cat => cat.id === categoryId)
            : null;

        return (
            <div className="w-full px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        {currentCategory ? `${currentCategory.name} Prompts` : 'Explore Prompts'}
                    </h1>
                    {currentCategory?.description && (
                        <p className="text-muted-foreground mb-6">{currentCategory.description}</p>
                    )}

                    {/* Filter Bar */}
                    <CategoryFilterBar
                        categories={categories}
                        currentCategoryId={categoryId}
                        baseUrl="/prompts/explore"
                        searchValue={search}
                        sortValue={sort}
                    />
                </div>

                {/* Prompts List with Pagination */}
                <PromptList
                    prompts={prompts}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    baseUrl="/prompts/explore"
                    searchParams={{
                        category: categoryId,
                        search,
                        sort
                    }}
                />
            </div>
        );
    } catch (error) {
        console.error("Error in ExplorePage:", error);
        return (
            <div className="w-full px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Error loading prompts</h2>
                    <p className="text-muted-foreground mb-6">
                        An error occurred while loading prompts. Please try again later.
                    </p>
                </div>
            </div>
        );
    }
} 