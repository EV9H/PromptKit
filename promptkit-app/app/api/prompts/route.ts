import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
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

        // Get the prompt data from the request
        const promptData = await request.json();

        // Insert the prompt into the database
        const { data, error } = await supabase
            .from("prompts")
            .insert({
                title: promptData.title,
                description: promptData.description,
                content: promptData.content,
                user_id: user.id,
                is_public: promptData.isPublic,
                copy_count: 0
            })
            .select()
            .single();

        const { data: categoryData, error: categoryError } = await supabase
            .from("prompt_categories")
            .insert({
                prompt_id: data.id,
                category_id: promptData.categoryId
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating prompt:", error);
            return NextResponse.json(
                { error: "Failed to create prompt" },
                { status: 500 }
            );
        }
        if (categoryError) {
            console.error("Error creating prompt category:", categoryError);
            return NextResponse.json(
                { error: "Failed to create prompt category" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Prompt created successfully",
            prompt: data
        }, { status: 201 });

    } catch (error) {
        console.error("Error in POST /api/prompts:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 