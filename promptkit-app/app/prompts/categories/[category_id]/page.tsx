import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptList } from "@/components/prompts/prompt-list";
import { CategoryFilterBar } from "@/components/prompts/category-filter-bar";
import { fetchPromptsWithProfiles, fetchCategories, fetchCategoryById } from "@/utils/prompt-utils";
import { redirect } from "next/navigation";

interface CategoryPageProps {
    params: {
        category_id: string;
    };
    searchParams: {
        sort?: string;
        search?: string;
        page?: string;
    };
}

export default async function CategoryPage({
    params,
    searchParams,
}: CategoryPageProps) {
    const category_id = (await params).category_id;
    const search = (await searchParams).search || "";
    const sort = (await searchParams).sort || "trending";
    const page = (await searchParams).page || "1";

    // Build the URL for the redirect
    const redirectUrl = new URL("/prompts/explore", "http://localhost:3000");
    redirectUrl.searchParams.append("category", category_id);
    if (search) redirectUrl.searchParams.append("search", search);
    if (sort) redirectUrl.searchParams.append("sort", sort);
    if (page) redirectUrl.searchParams.append("page", page);

    // Redirect to the unified explore page
    redirect(redirectUrl.pathname + redirectUrl.search);
} 