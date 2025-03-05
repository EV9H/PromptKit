"use client";
import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface PromptCopyButtonProps {
    promptId: string;
    content?: string;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function PromptCopyButton({
    promptId,
    content,
    variant = "default"
}: PromptCopyButtonProps) {
    const [isCopied, setIsCopied] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const copyToClipboard = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);

            // If content is provided directly, use it
            if (content) {
                await navigator.clipboard.writeText(content);
                incrementCopyCount();
                return;
            }

            // Otherwise fetch the content from the API
            console.log("Fetching prompt content for ID:", promptId);
            const response = await fetch(`/api/prompts/${promptId}`);

            if (!response.ok) {
                console.error("Error response from API:", response.status, response.statusText);
                throw new Error(`Failed to fetch prompt: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Received prompt data:", data);

            if (!data.content) {
                console.error("No content in prompt data:", data);
                throw new Error("Prompt has no content");
            }

            await navigator.clipboard.writeText(data.content);
            incrementCopyCount();
        } catch (error) {
            console.error("Copy error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to copy prompt to clipboard",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const incrementCopyCount = async () => {
        try {
            // Call the API to increment the copy count
            console.log("Incrementing copy count for:", promptId);
            const response = await fetch(`/api/prompts/${promptId}/copy`, {
                method: "POST",
            });

            if (!response.ok) {
                console.error("Failed to increment copy count:", response.status, response.statusText);
            } else {
                // Show success state
                setIsCopied(true);
                toast({
                    title: "Copied to clipboard",
                    description: "The prompt has been copied to your clipboard",
                });

                // Refresh the page to update the copy count
                router.refresh();

                // Reset after 2 seconds
                setTimeout(() => {
                    setIsCopied(false);
                }, 2000);
            }
        } catch (error) {
            console.error("Failed to increment copy count", error);
        }
    };

    return (
        <Button
            onClick={copyToClipboard}
            variant={variant}
            className="gap-2 w-full"
            disabled={isCopied || isLoading}
        >
            {isCopied ? (
                <>
                    <Check className="h-4 w-4" />
                    Copied
                </>
            ) : isLoading ? (
                <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-b-transparent"></div>
                    Loading...
                </>
            ) : (
                <>
                    <Copy className="h-4 w-4" />
                    Copy Prompt
                </>
            )}
        </Button>
    );
} 