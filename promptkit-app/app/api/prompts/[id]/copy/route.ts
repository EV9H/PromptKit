import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

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
        const newCount = (currentPrompt.copy_count || 0) + 1;
        const { error: updateError } = await supabase
            .from("prompts")
            .update({ copy_count: newCount })
            .eq("id", id);

        if (updateError) {
            console.error("Error updating copy count:", updateError);
            return NextResponse.json(
                { error: "Failed to update copy count" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            copy_count: newCount
        });
    } catch (error) {
        console.error("Error incrementing copy count:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 