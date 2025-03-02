import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET endpoint to fetch a single prompt
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        const { data, error } = await supabase
            .from("prompts")
            .select(`
                *
            `)
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching prompt:", error);
            return NextResponse.json(
                { error: "Failed to fetch prompt" },
                { status: 500 }
            );
        }

        // Get current user to check privacy
        const { data: { user } } = await supabase.auth.getUser();

        // If prompt is not public and user is not the creator, return 404
        if (!data.is_public && (!user || user.id !== data.user_id)) {
            return NextResponse.json(
                { error: "Prompt not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching prompt:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH endpoint to update a prompt
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if prompt exists and belongs to the current user
        const { data: existingPrompt, error: fetchError } = await supabase
            .from("prompts")
            .select("user_id")
            .eq("id", id)
            .single();

        if (fetchError || !existingPrompt) {
            return NextResponse.json(
                { error: "Prompt not found" },
                { status: 404 }
            );
        }

        if (existingPrompt.user_id !== user.id) {
            return NextResponse.json(
                { error: "You do not have permission to edit this prompt" },
                { status: 403 }
            );
        }

        // Get the prompt data from the request
        const promptData = await request.json();

        // Update the prompt
        const { data: updatedPrompt, error: updateError } = await supabase
            .from("prompts")
            .update({
                title: promptData.title,
                description: promptData.description,
                content: promptData.content,
                is_public: promptData.isPublic,
                updated_at: new Date().toISOString()
            })
            .eq("id", id)
            .select()
            .single();

        if (updateError) {
            console.error("Error updating prompt:", updateError);
            return NextResponse.json(
                { error: "Failed to update prompt" },
                { status: 500 }
            );
        }

        // Update the category if it's changed
        // First, get the current category
        const { data: currentCategory } = await supabase
            .from("prompt_categories")
            .select("id, category_id")
            .eq("prompt_id", id)
            .single();

        if (currentCategory && currentCategory.category_id !== promptData.categoryId) {
            // Update the category
            const { error: categoryError } = await supabase
                .from("prompt_categories")
                .update({
                    category_id: promptData.categoryId
                })
                .eq("id", currentCategory.id);

            if (categoryError) {
                console.error("Error updating prompt category:", categoryError);
                return NextResponse.json(
                    { error: "Failed to update prompt category" },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            message: "Prompt updated successfully",
            prompt: updatedPrompt
        });

    } catch (error) {
        console.error("Error updating prompt:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 