import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Define an interface for the response type
interface PromptWithCategory {
    id: string;
    title: string;
    description: string;
    content: string;
    created_at: string;
    is_public: boolean;
    folder_id: string | null;
    user_id: string;
    categories: {
        id: string;
        name: string;
    } | null;
}

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

        // Fetch the user's created prompts with category information
        const { data: prompts, error, count } = await supabase
            .from('prompts')
            .select(`
                id, 
                title, 
                description, 
                content, 
                created_at, 
                is_public,
                folder_id,
                user_id,
                prompt_categories!inner (
                    categories (
                        id,
                        name
                    )
                )
            `, { count: 'exact' })
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error("Error fetching prompts:", error);
            return NextResponse.json(
                { error: "Failed to fetch prompts" },
                { status: 500 }
            );
        }

        // Process prompts to include category information
        const processedPrompts = (prompts as any[]).map(prompt => {
            // Extract first category (assuming a prompt can have multiple categories)
            const category = prompt.prompt_categories &&
                prompt.prompt_categories.length > 0 &&
                prompt.prompt_categories[0].categories ?
                prompt.prompt_categories[0].categories : null;

            return {
                id: prompt.id,
                title: prompt.title,
                description: prompt.description,
                content: prompt.content,
                created_at: prompt.created_at,
                is_public: prompt.is_public,
                folder_id: prompt.folder_id,
                user_id: prompt.user_id,
                category_id: category ? category.id : null,
                category_name: category ? category.name : null
            };
        });

        return NextResponse.json({
            prompts: processedPrompts,
            count
        });
    } catch (error) {
        console.error("Error in extension created prompts API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 