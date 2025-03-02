import React from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Copy } from "lucide-react";
import { Heading } from "@/components/typography/heading";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PromptCustomizeButton } from "@/components/prompts/prompt-customize-button";

interface EditPromptPageProps {
    params: {
        id: string;
    };
}

export default async function EditPromptPage({ params }: EditPromptPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch the current user
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to sign-in if not logged in
    if (!user) {
        redirect(`/sign-in?callbackUrl=/prompts/${id}`);
    }

    // Fetch prompt details with categories
    const { data: prompt, error } = await supabase
        .from("prompts")
        .select(`
            *,
            prompt_categories (
                category_id
            )
        `)
        .eq("id", id)
        .single();

    // Handle errors or not found
    if (error || !prompt) {
        console.error("Error fetching prompt:", error);
        return notFound();
    }

    // If the current user is the owner, redirect to the my-prompts edit page
    if (prompt.user_id === user.id) {
        redirect(`/my-prompts/edit/${id}`);
    }

    // Fetch the category (if any)
    const currentCategoryId = prompt.prompt_categories?.[0]?.category_id || "";

    return (
        <div className="container mx-auto px-4 pb-8">
            <Button variant="ghost" className="mb-4" asChild>
                <Link href={`/prompts/${id}`}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Prompt
                </Link>
            </Button>

            <Heading as="h1" size="2xl" className="mb-6">
                Make Your Own Copy
            </Heading>

            <Card className="mb-8">
                <CardContent className="pt-6">
                    <p className="text-lg mb-4">
                        You can only edit prompts that you own. To customize this prompt:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                        <li>Make a copy of this prompt to your collection</li>
                        <li>The copy will be titled "{prompt.title} - copy"</li>
                        <li>You'll be redirected to edit your copy</li>
                    </ul>
                </CardContent>
                <CardFooter className="flex justify-end gap-4 border-t pt-4">
                    <Button variant="outline" asChild>
                        <Link href={`/prompts/${id}`}>
                            Cancel
                        </Link>
                    </Button>
                    <PromptCustomizeButton
                        promptId={id}
                        originalTitle={prompt.title}
                        description={prompt.description || ""}
                        content={prompt.content}
                        categoryId={currentCategoryId}
                        isPublic={false}
                        variant="default"
                    />
                </CardFooter>
            </Card>
        </div>
    );
} 