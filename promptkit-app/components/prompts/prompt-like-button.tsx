"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface PromptLikeButtonProps {
    promptId: string;
    initialLiked?: boolean;
    likeCount?: number;
    className?: string;
}

export function PromptLikeButton({
    promptId,
    initialLiked = false,
    likeCount = 0,
    className,
}: PromptLikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(likeCount);
    const [isLoading, setIsLoading] = useState(false);

    // Used to set initial state after authentication check
    useEffect(() => {
        const checkIfLiked = async () => {
            try {
                const response = await fetch(`/api/prompts/${promptId}/liked`, {
                    method: "GET",
                });

                if (response.ok) {
                    const data = await response.json();
                    setLiked(data.liked);
                    setCount(data.likeCount || count);
                }
            } catch (error) {
                console.error("Error checking like status:", error);
            }
        };

        checkIfLiked();
    }, [promptId, count]);

    const toggleLike = async () => {
        try {
            setIsLoading(true);
            console.log("Toggling like for prompt:", promptId);

            const response = await fetch(`/api/prompts/${promptId}/like`, {
                method: "POST",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to toggle like");
            }

            const data = await response.json();
            console.log("Like response:", data);

            setLiked(data.liked);
            setCount(prev => data.liked ? prev + 1 : prev - 1);

            toast({
                title: data.liked ? "Prompt liked" : "Prompt unliked",
                description: data.message,
            });
        } catch (error) {
            console.error("Error toggling like:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to toggle like",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            disabled={isLoading}
            className={`flex items-center gap-1 ${className}`}
            title={liked ? "Unlike this prompt" : "Like this prompt"}
        >
            <Heart
                className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
            <span>{count}</span>
        </Button>
    );
} 