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

        // If not authenticated, return not liked but still return like count
        if (!user) {
            // Get like count
            const { count, error: countError } = await supabase
                .from("prompt_likes")
                .select("*", { count: "exact" })
                .eq("prompt_id", id);

            if (countError) {
                console.error("Error getting like count:", countError);
                return NextResponse.json(
                    { liked: false, likeCount: 0 },
                    { status: 200 }
                );
            }

            return NextResponse.json({
                liked: false,
                likeCount: count || 0
            });
        }

        const userId = user.id;

        // Check if the user has already liked this prompt
        const { data: existingLike, error } = await supabase
            .from("prompt_likes")
            .select("*")
            .eq("prompt_id", id)
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
            console.error("Error checking like status:", error);
            return NextResponse.json(
                { error: "Failed to check like status" },
                { status: 500 }
            );
        }

        // Get like count
        const { count, error: countError } = await supabase
            .from("prompt_likes")
            .select("*", { count: "exact" })
            .eq("prompt_id", id);

        if (countError) {
            console.error("Error getting like count:", countError);
            return NextResponse.json(
                { liked: !!existingLike, likeCount: 0 },
                { status: 200 }
            );
        }

        return NextResponse.json({
            liked: !!existingLike,
            likeCount: count || 0
        });
    } catch (error) {
        console.error("Error checking like status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 