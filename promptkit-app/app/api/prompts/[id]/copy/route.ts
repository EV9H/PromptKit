import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        // Await params before accessing its properties
        const id = (await params).id;

        if (!id) {
            return NextResponse.json(
                { error: "Prompt ID is required" },
                { status: 400 }
            );
        }

        // First get the current count
        const { data: currentPrompt, error: fetchError } = await supabase
            .from("prompts")
            .select("copy_count")
            .eq("id", id)
            .single();

        if (fetchError) {
            console.error("Error fetching current copy count:", fetchError);
            return NextResponse.json(
                { error: "Failed to fetch current copy count" },
                { status: 500 }
            );
        }


        // Then increment it
        const newCount = (currentPrompt?.copy_count || 0) + 1;

        // Use a direct SQL update to ensure it commits
        const { data: updateData, error: updateError } = await supabase
            .rpc('increment_copy_count', { row_id: id });

        if (updateError) {
            console.error("Error updating copy count:", updateError);
            return NextResponse.json(
                { error: "Failed to update copy count" },
                { status: 500 }
            );
        }


        // Verify the update worked
        const { data: updatedPrompt, error: fetchErrorTwo } = await supabase
            .from("prompts")
            .select("copy_count")
            .eq("id", id)
            .single();


        return NextResponse.json({
            success: true,
            copy_count: updatedPrompt?.copy_count || newCount
        });
    } catch (error) {
        console.error("Error incrementing copy count:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 