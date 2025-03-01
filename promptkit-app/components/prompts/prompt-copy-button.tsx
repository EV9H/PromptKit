import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

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
    const { toast } = useToast();

    const copyToClipboard = async () => {
        try {
            // If content is provided directly, use it
            if (content) {
                await navigator.clipboard.writeText(content);
                incrementCopyCount();
                return;
            }

            // Otherwise fetch the content from the API
            const response = await fetch(`/api/prompts/${promptId}`);
            if (!response.ok) throw new Error("Failed to fetch prompt");

            const data = await response.json();
            await navigator.clipboard.writeText(data.content);
            incrementCopyCount();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to copy prompt to clipboard",
                variant: "destructive",
            });
        }
    };

    const incrementCopyCount = async () => {
        try {
            // Call the API to increment the copy count
            await fetch(`/api/prompts/${promptId}/copy`, {
                method: "POST",
            });

            // Show success state
            setIsCopied(true);
            toast({
                title: "Copied to clipboard",
                description: "The prompt has been copied to your clipboard",
            });

            // Reset after 2 seconds
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to increment copy count", error);
        }
    };

    return (
        <Button
            onClick={copyToClipboard}
            variant={variant}
            className="gap-2 w-full"
            disabled={isCopied}
        >
            {isCopied ? (
                <>
                    <Check className="h-4 w-4" />
                    Copied
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