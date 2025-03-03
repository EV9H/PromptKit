import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    try {
        // Create the Supabase client and await it
        const supabase = await createClient();

        // Get the token from the authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { valid: false, error: "Invalid authorization header" },
                { status: 401 }
            );
        }

        // Extract the token
        const token = authHeader.substring(7);

        // Verify the token by attempting to get the user
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error("Token validation error:", error);
            return NextResponse.json(
                { valid: false, error: "Invalid token" },
                { status: 401 }
            );
        }

        // If we get here, the token is valid
        return NextResponse.json({
            valid: true,
            userId: user.id
        });
    } catch (error) {
        console.error("Error validating token:", error);
        return NextResponse.json(
            { valid: false, error: "Server error validating token" },
            { status: 500 }
        );
    }
} 