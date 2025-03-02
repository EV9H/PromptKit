"use client";

import React from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface PromptCustomizeButtonProps {
    promptId: string;
    originalTitle: string;
    description: string;
    content: string;
    categoryId?: string;
    isPublic?: boolean;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function PromptCustomizeButton({
    promptId,
    originalTitle,
    description,
    content,
    categoryId,
    isPublic = false,
    variant = "outline"
}: PromptCustomizeButtonProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleCustomize = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);

            // Create a copy of the prompt with "- copy" appended to the title
            const customizedPromptData = {
                title: `${originalTitle} - copy`,
                description,
                content,
                categoryId,
                isPublic
            };

            // Call the API to create a new prompt
            const response = await fetch("/api/prompts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(customizedPromptData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to customize prompt");
            }

            const result = await response.json();

            toast({
                title: "Success!",
                description: "This prompt has been copied to your collection and is ready for customization.",
            });

            // Redirect to the edit page for the newly created prompt
            router.push(`/my-prompts/edit/${result.prompt.id}`);
        } catch (error) {
            console.error("Customize error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to customize prompt",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleCustomize}
            variant={variant}
            className="gap-2 w-full"
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating copy...
                </>
            ) : (
                <>
                    <Sparkles className="h-4 w-4" />
                    Customize
                </>
            )}
        </Button>
    );
} 