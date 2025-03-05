import { NextRequest, NextResponse } from "next/server";
import { fetchCategories, fetchCategoryById } from "@/utils/prompt-utils";

export async function GET(request: NextRequest) {
    try {
        // Check if a specific category ID is requested
        const searchParams = request.nextUrl.searchParams;
        const categoryId = searchParams.get('id');

        if (categoryId) {
            // Fetch a specific category
            const category = await fetchCategoryById(categoryId);
            return NextResponse.json(category);
        } else {
            // Fetch all categories
            const categories = await fetchCategories();
            return NextResponse.json(categories);
        }
    } catch (error) {
        console.error("Error in GET /api/categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
} 