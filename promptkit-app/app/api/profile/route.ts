import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get session to verify authentication
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get profile data from request
        const profileData = await request.json();
        const userId = session.user.id;

        // Verify that the user is only updating their own profile
        if (profileData.id !== userId) {
            return NextResponse.json(
                { message: "Unauthorized to update this profile" },
                { status: 403 }
            );
        }

        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", userId)
            .single();

        let result;

        // Clean profileData before inserting/updating
        const cleanedProfileData = {
            id: userId,
            username: profileData.username,
            full_name: profileData.full_name || null,
            avatar_url: profileData.avatar_url || null,
            website: profileData.website || null,
            bio: profileData.bio || null,
            updated_at: new Date().toISOString(),
        };

        if (!existingProfile) {
            // Create new profile
            result = await supabase
                .from("profiles")
                .insert({
                    ...cleanedProfileData,
                    created_at: new Date().toISOString(),
                })
                .select()
                .single();
        } else {
            // Update existing profile
            result = await supabase
                .from("profiles")
                .update(cleanedProfileData)
                .eq("id", userId)
                .select()
                .single();
        }

        if (result.error) {
            return NextResponse.json(
                { message: result.error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Profile updated successfully", profile: result.data },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { message: "Failed to update profile" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get session to verify authentication
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Get profile data
        const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            return NextResponse.json(
                { message: "Profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { profile },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { message: "Failed to fetch profile" },
            { status: 500 }
        );
    }
} 