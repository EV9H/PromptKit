import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Heading } from "@/components/typography/heading";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import ProfileForm from "@/components/profile/profile-form";
import { Separator } from "@/components/ui/separator";

export default async function ProfilePage() {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect("/sign-in?callbackUrl=/profile");
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Get profile data
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    // Format membership date
    const createdAt = session.user.created_at;
    const memberSince = new Date(createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex flex-col gap-2">
                <Heading size="2xl">
                    Profile
                    <p className="mt-2 text-base font-normal text-muted-foreground">
                        Manage your account settings and profile information
                    </p>
                </Heading>
                <Separator className="my-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>
                                Your personal account settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium text-sm">Email Address</h3>
                                <p className="text-sm text-muted-foreground">{userEmail}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    To change your email, please contact support.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-medium text-sm">Membership</h3>
                                <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your profile information and public details
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfileForm profile={profile} userId={userId} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 