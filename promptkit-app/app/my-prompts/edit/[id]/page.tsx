import React from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Heading } from "@/components/typography/heading";
import { EditPromptForm } from "@/components/prompts/edit-prompt-form";

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
    if (!user) {
        redirect('/sign-in?callbackUrl=/my-prompts');
    }

    // Fetch prompt details
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

    // Check if the current user is the owner of this prompt
    if (prompt.user_id !== user.id) {
        redirect('/my-prompts');
    }

    // Fetch all categories for the dropdown
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

    // Get the current category ID
    const currentCategoryId = prompt.prompt_categories?.[0]?.category_id || "";

    return (
        <div className="container mx-auto px-4 pb-8">
            <Button variant="ghost" className="mb-4" asChild>
                <Link href="/my-prompts">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to My Prompts
                </Link>
            </Button>

            <Heading as="h1" size="2xl" className="mb-6">
                Edit Prompt
            </Heading>

            <EditPromptForm
                promptId={id}
                initialData={{
                    title: prompt.title,
                    description: prompt.description || "",
                    content: prompt.content,
                    categoryId: currentCategoryId,
                    isPublic: prompt.is_public
                }}
                categories={categories || []}
            />
        </div>
    );
} 