import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { fetchPromptsWithProfiles, FetchPromptsOptions } from "@/utils/prompt-utils";

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const categoryId = searchParams.get('categoryId') || undefined;
        const search = searchParams.get('search') || undefined;

        // Validate sort option
        let sort = searchParams.get('sort') as FetchPromptsOptions['sort'] || 'trending';
        const validSortOptions = ['trending', 'newest', 'oldest', 'most_copied', 'most_liked', 'most_viewed'];
        if (!validSortOptions.includes(sort)) {
            sort = 'trending'; // Default to trending if invalid
        }

        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '12');
        const userId = searchParams.get('userId') || undefined;
        const isPublic = searchParams.get('isPublic') !== null
            ? searchParams.get('isPublic') === 'true'
            : undefined;

        // Fetch prompts using our utility function
        const result = await fetchPromptsWithProfiles({
            categoryId,
            search,
            sort,
            page,
            pageSize,
            userId,
            isPublic
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in GET /api/prompts/fetch:", error);
        return NextResponse.json(
            { error: "Failed to fetch prompts" },
            { status: 500 }
        );
    }
} 