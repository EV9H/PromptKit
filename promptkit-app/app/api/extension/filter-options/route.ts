import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Fetch user's folders
        const { data: folders, error: foldersError } = await supabase
            .from('folders')
            .select('id, name')
            .eq('user_id', user.id)
            .order('name', { ascending: true });

        if (foldersError) {
            console.error("Error fetching folders:", foldersError);
            return NextResponse.json(
                { error: "Failed to fetch folders" },
                { status: 500 }
            );
        }

        // Get categories from prompts that the user has created
        const { data: userCreatedPromptCategories, error: createdError } = await supabase
            .from('prompt_categories')
            .select('category_id, categories:categories(id, name)')
            .eq('prompts.user_id', user.id)
            .order('categories.name', { ascending: true })
            .join('prompts', { 'prompts.id': 'prompt_categories.prompt_id' });

        if (createdError) {
            console.error("Error fetching created prompt categories:", createdError);
            // Continue with liked categories even if created categories fail
        }

        // Get categories from prompts that the user has liked
        const { data: userLikedPromptCategories, error: likedError } = await supabase
            .from('prompt_categories')
            .select('category_id, categories:categories(id, name)')
            .eq('prompt_likes.user_id', user.id)
            .order('categories.name', { ascending: true })
            .join('prompts', { 'prompts.id': 'prompt_categories.prompt_id' })
            .join('prompt_likes', { 'prompts.id': 'prompt_likes.prompt_id' });

        if (likedError) {
            console.error("Error fetching liked prompt categories:", likedError);
            // Continue even if liked categories fail
        }

        // Combine and deduplicate categories
        const categoryMap = new Map();

        // Process created prompt categories
        if (userCreatedPromptCategories) {
            userCreatedPromptCategories.forEach(item => {
                if (item.categories) {
                    categoryMap.set(item.categories.id, {
                        id: item.categories.id,
                        name: item.categories.name
                    });
                }
            });
        }

        // Process liked prompt categories
        if (userLikedPromptCategories) {
            userLikedPromptCategories.forEach(item => {
                if (item.categories) {
                    categoryMap.set(item.categories.id, {
                        id: item.categories.id,
                        name: item.categories.name
                    });
                }
            });
        }

        // Convert map to array
        const categories = Array.from(categoryMap.values());

        // Return folders and categories
        return NextResponse.json({
            folders: folders || [],
            categories: categories || []
        });
    } catch (error) {
        console.error("Error in extension filter options API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 