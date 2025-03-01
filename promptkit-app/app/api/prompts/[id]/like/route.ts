import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const { id } = await params;

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = user.id;

        // Check if the user has already liked this prompt
        const { data: existingLike } = await supabase
            .from("prompt_likes")
            .select("*")
            .eq("prompt_id", id)
            .eq("user_id", userId)
            .maybeSingle();

        // If the like exists, remove it (unlike)
        if (existingLike) {
            const { error } = await supabase
                .from("prompt_likes")
                .delete()
                .eq("prompt_id", id)
                .eq("user_id", userId);

            if (error) {
                console.error("Error unliking prompt:", error);
                return NextResponse.json(
                    { error: "Failed to unlike prompt" },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                liked: false,
                message: "Prompt unliked successfully"
            });
        }
        // Otherwise, add the like
        else {
            const { error } = await supabase
                .from("prompt_likes")
                .insert({
                    prompt_id: id,
                    user_id: userId
                });

            if (error) {
                console.error("Error liking prompt:", error);
                return NextResponse.json(
                    { error: "Failed to like prompt" },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                liked: true,
                message: "Prompt liked successfully"
            });
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
} 