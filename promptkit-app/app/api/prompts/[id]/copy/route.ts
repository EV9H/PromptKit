import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = params;

        // Call the increment_prompt_copy_count function
        const { data, error } = await supabase.rpc("increment_prompt_copy_count", {
            prompt_id: id,
        });

        if (error) {
            console.error("Error incrementing copy count:", error);
            return NextResponse.json(
                { error: "Failed to increment copy count" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error incrementing copy count:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 