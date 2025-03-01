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
    categories: {
        name: string;
    };
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

        // Fetch the user's created prompts
        const { data: prompts, error, count } = await supabase
            .from('prompts')
            .select('id, title, description, content, created_at, is_public, categories:categories(name)', { count: 'exact' })
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

        // Process prompts to include category name
        const processedPrompts = (prompts as PromptWithCategory[]).map(prompt => ({
            id: prompt.id,
            title: prompt.title,
            description: prompt.description,
            created_at: prompt.created_at,
            is_public: prompt.is_public,
            category_name: prompt.categories ? prompt.categories.name : null
        }));

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