"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface PromptLikeButtonProps {
    promptId: string;
    initialLiked?: boolean;
    likeCount?: number;
    className?: string;
    showCount?: boolean;
    size?: "sm" | "default" | "lg";
}

export function PromptLikeButton({
    promptId,
    initialLiked = false,
    likeCount = 0,
    className,
    showCount = true,
    size = "default",
}: PromptLikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(likeCount);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

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

            if (response.status === 401) {
                toast({
                    title: "Authentication required",
                    description: "Please sign in to like prompts",
                    action: (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/sign-in")}
                        >
                            Sign In
                        </Button>
                    ),
                });
                return;
            }

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
            variant="outline"
            size={size}
            onClick={toggleLike}
            disabled={isLoading}
            className={`gap-2 w-full ${className}`}
        >
            <Heart
                className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
            />
            {showCount ? (
                <>
                    <span>{count}</span>
                </>
            ) : (
                <>
                    {liked ? "Liked" : "Like"}
                </>
            )}
        </Button>
    );
} 