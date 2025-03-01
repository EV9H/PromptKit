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
                category_id: promptData.categoryId,
                user_id: user.id,
                is_public: promptData.isPublic,
                copy_count: 0
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