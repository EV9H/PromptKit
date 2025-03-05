import { createClient } from "@/utils/supabase/server";
import { Heading } from "@/components/typography/heading";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreatePromptForm } from "@/components/prompts/create-prompt-form";

export default async function CreatePromptPage() {
    const supabase = await createClient();

    // Check if user is authenticated using the more secure getUser() method
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // Redirect to login if not authenticated
        redirect("/sign-in?callbackUrl=/prompts/create");
    }

    // Fetch categories for the form
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Heading as="h1" size="2xl" className="mb-8">
                Create a New Prompt
            </Heading>

            <Card>
                <CardHeader>
                    <CardTitle>Prompt Details</CardTitle>
                    <CardDescription>
                        Fill in the details to create and share your AI prompt with the community.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreatePromptForm categories={categories || []} />
                </CardContent>
            </Card>
        </div>
    );
} 