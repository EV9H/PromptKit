import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        // Fetch the prompt with all necessary fields - explicit select to avoid relationship issues
        const { data: prompt, error } = await supabase
            .from("prompts")
            .select("id, title, description, content, is_public, user_id, created_at, updated_at, copy_count")
            .eq("id", id)
            .single();

        if (error || !prompt) {
            console.error("Error fetching prompt:", error);
            return NextResponse.json(
                { error: "Prompt not found" },
                { status: 404 }
            );
        }

        // Check if user has access to this prompt
        if (!prompt.is_public && prompt.user_id !== userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        return NextResponse.json(prompt);
    } catch (error) {
        console.error("Error fetching prompt:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 