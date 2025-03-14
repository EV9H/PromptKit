"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Copy, Eye, Quote, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PromptLikeButton } from "@/components/prompts/prompt-like-button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "../ui/use-toast";

interface TrendingPromptCardProps {
    prompt: {
        id: string;
        title: string;
        description: string | null;
        created_at: string;
        updated_at: string;
        copy_count: number;
        user_id: string;
        creator_username?: string;
        creator_avatar?: string | null;
        like_count: number;
        view_count?: number;
        preview_image: string | null;
        content?: string;
        is_public?: boolean;
    };
}

export const TrendingPromptCard = ({ prompt }: TrendingPromptCardProps) => {
    const [creatorInfo, setCreatorInfo] = useState<{
        username: string | null;
        avatar_url: string | null;
        isLoading: boolean;
    }>({
        username: prompt.creator_username || null,
        avatar_url: prompt.creator_avatar || null,
        isLoading: !prompt.creator_username
    });

    // Fetch creator information if not already provided
    useEffect(() => {
        const fetchCreatorInfo = async () => {
            if (prompt.creator_username && prompt.creator_avatar !== undefined) {
                return; // Already have the info
            }

            if (!prompt.user_id) {
                setCreatorInfo(prev => ({ ...prev, isLoading: false }));
                return;
            }

            try {
                const supabase = createClient();
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', prompt.user_id)
                    .single();

                if (error) {
                    console.error("Error fetching profile:", error);
                    setCreatorInfo(prev => ({ ...prev, isLoading: false }));
                    return;
                }

                setCreatorInfo({
                    username: profile?.username || null,
                    avatar_url: profile?.avatar_url || null,
                    isLoading: false
                });
            } catch (error) {
                console.error("Error in fetchCreatorInfo:", error);
                setCreatorInfo(prev => ({ ...prev, isLoading: false }));
            }
        };

        if (creatorInfo.isLoading) {
            fetchCreatorInfo();
        }
    }, [prompt.user_id, prompt.creator_username, prompt.creator_avatar, creatorInfo.isLoading]);

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "UK"; // UK for "Unknown"

        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    // Function to create a styled text preview from prompt content
    const TextPreview = ({ content }: { content: string }) => {
        // Get a snippet of the content (first 120 chars)
        const snippet = content && content.length > 120
            ? content.substring(0, 120) + "..."
            : content || "";

        // Find a reasonable place to split text for better visual presentation
        const splitPoint = Math.min(
            snippet.indexOf(". ") > 20 ? snippet.indexOf(". ") + 1 : snippet.length,
            snippet.indexOf("\n") > 0 ? snippet.indexOf("\n") : snippet.length,
            60
        );

        const firstPart = splitPoint < snippet.length ? snippet.substring(0, splitPoint) : snippet;
        const secondPart = splitPoint < snippet.length ? snippet.substring(splitPoint) : "";

        return (
            <div className="w-full h-full bg-gradient-to-br from-muted/40 to-muted flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-2 left-3 opacity-70">
                    <Quote className="h-4 w-4 text-primary/30" />
                </div>
                <div className="absolute bottom-2 right-3 opacity-70 rotate-180">
                    <Quote className="h-4 w-4 text-primary/30" />
                </div>

                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

                {/* Content */}
                <div className="relative z-10 w-[90%] rounded-md bg-background/30 backdrop-blur-sm p-3 shadow-sm border border-border/40">
                    {/* Fake terminal dots */}
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="h-2 w-2 rounded-full bg-primary/30"></div>
                        <div className="h-2 w-2 rounded-full bg-primary/20"></div>
                        <div className="h-2 w-2 rounded-full bg-primary/10"></div>
                    </div>

                    <div className="text-xs text-foreground/90 font-mono space-y-1.5">
                        {/* Add a "system" type prompt line for visual effect */}
                        <div className="text-green-600 dark:text-green-400 font-semibold">
                            &gt; Prompt Preview:
                        </div>

                        {/* Content with special formatting */}
                        <div className="line-clamp-2">{firstPart}</div>
                        {secondPart && <div className="line-clamp-1 text-foreground/70">{secondPart}</div>}
                    </div>
                </div>
            </div>
        );
    };

    // Username displayed based on fetched data or fallback
    const displayUsername = creatorInfo.username || "Unknown User";
    // Avatar displayed based on fetched data
    const avatarUrl = creatorInfo.avatar_url || "";

    return (
        <Card className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
            <Link href={`/prompts/${prompt.id}`} className="block">
                <div className="relative aspect-video w-full overflow-hidden">
                    {prompt.preview_image ? (
                        <Image
                            src={prompt.preview_image}
                            alt={prompt.title}
                            fill
                            className="object-cover transition-transform hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : prompt.content ? (
                        <TextPreview content={prompt.content} />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">No preview available</p>
                        </div>
                    )}
                </div>
            </Link>

            <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                    <Link href={`/prompts/${prompt.id}`} className="block">
                        <h3 className="font-semibold text-lg line-clamp-2 hover:underline">
                            {prompt.title}
                        </h3>
                    </Link>
                    {prompt.is_public === false && (
                        <Badge variant="outline" className="ml-2 flex gap-1 items-center bg-primary">
                            <Lock className="h-3 w-3" />
                            Private
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {prompt.description || "No description provided"}
                </p>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <div className="flex items-center gap-2">
                    <Link href={`/profiles/${displayUsername}`} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={avatarUrl} alt={displayUsername} />
                            <AvatarFallback>{getInitials(displayUsername)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{displayUsername}</span>
                    </Link>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="py-2 px-4 flex items-center justify-between border-t">
                <div className="flex items-center gap-3">
                    <PromptLikeButton
                        promptId={prompt.id}
                        likeCount={prompt.like_count}
                        className="text-sm p-0 h-auto bg-transparent border-none"
                        size="sm"
                    />
                    <span className="flex items-center gap-1 text-sm cursor-pointer" onClick={() => {
                        navigator.clipboard.writeText(prompt.content || "");
                        toast({
                            title: "Copied to clipboard",
                        });
                    }}>
                        <Copy className="h-4 w-4" />
                        {prompt.copy_count}
                    </span>
                    <span className="flex items-center gap-1 text-sm cursor-pointer">
                        <Eye className="h-4 w-4" />
                        {prompt.view_count}
                    </span>
                </div>
                {/* <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 font-normal"
                    asChild
                >
                    <Link href={`/prompts/${prompt.id}`}>
                        <Eye className="h-4 w-4" />
                        View
                    </Link>
                </Button> */}
            </CardFooter>
        </Card>
    );
}; 