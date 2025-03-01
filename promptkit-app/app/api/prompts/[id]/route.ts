import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;

        // Check if user is authenticated
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.session?.user.id;

        // Fetch the prompt
        const { data: prompt, error } = await supabase
            .from("prompts")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !prompt) {
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