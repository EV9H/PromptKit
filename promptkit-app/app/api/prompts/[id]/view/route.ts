import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Await params before accessing its properties
        const promptId = (await params).id;

        if (!promptId) {
            return NextResponse.json(
                { error: "Prompt ID is required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Call the RPC function to increment the view count
        const { data: rpcData, error: rpcError } = await supabase
            .rpc('increment_view_count', { row_id: promptId });

        if (rpcError) {
            console.error("Error incrementing view count:", rpcError);
            return NextResponse.json(
                { error: "Failed to increment view count" },
                { status: 500 }
            );
        }


        // Return the new view count
        return NextResponse.json({ view_count: rpcData });
    } catch (error) {
        console.error("Error in view count API:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
} 