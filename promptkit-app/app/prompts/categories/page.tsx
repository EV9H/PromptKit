import React from "react";
import { createClient } from "@/utils/supabase/server";
import { Heading } from "@/components/typography/heading";
import { PromptCategoryList } from "@/components/prompts/prompt-category-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { PostgrestError } from "@supabase/supabase-js";

export default async function CategoriesPage() {
    const supabase = await createClient();

    try {
        // Fetch all categories
        const { data: categories, error } = await supabase
            .from("categories")
            .select("*")
            .order("name");

        if (error) {
            console.error("Error fetching categories:", error);
            throw new Error(error.message || "Failed to fetch categories");
        }

        // Get prompt count for each category
        const categoryCounts = await Promise.all(
            categories.map(async (category) => {
                const { count, error: countError } = await supabase
                    .from("prompt_categories")
                    .select("*", { count: "exact" })
                    .eq("category_id", category.id);

                return {
                    ...category,
                    promptCount: countError ? 0 : count || 0
                };
            })
        );

        // Sort categories by prompt count (most popular first)
        const sortedCategories = categoryCounts.sort((a, b) => b.promptCount - a.promptCount);

        return (
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link href="/prompts/explore" className="flex items-center gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Explore
                    </Link>
                </Button>

                <Heading as="h1" size="2xl" className="mb-6">
                    Browse Categories
                </Heading>

                <p className="text-muted-foreground mb-8 max-w-2xl">
                    Explore our collection of prompts organized by category. Each category contains prompts
                    specifically designed for different types of tasks and use cases.
                </p>

                {error ? (
                    <div className="text-destructive">
                        Failed to load categories: {error.message || "Unknown error"}
                    </div>
                ) : sortedCategories && sortedCategories.length > 0 ? (
                    <div className="space-y-8">
                        <PromptCategoryList categories={sortedCategories} />
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground text-lg">
                            No categories found.
                        </p>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error in categories page:", error);
        return (
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link href="/prompts/explore" className="flex items-center gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Explore
                    </Link>
                </Button>
                <div className="text-destructive">
                    An error occurred while loading categories. Please try again later.
                    {error instanceof Error && <p>{error.message}</p>}
                </div>
            </div>
        );
    }
} 