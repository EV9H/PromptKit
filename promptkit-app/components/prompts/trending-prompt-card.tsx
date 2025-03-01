import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Copy, Eye, Quote } from "lucide-react";
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

interface TrendingPromptCardProps {
    prompt: {
        id: string;
        title: string;
        description: string | null;
        created_at: string;
        updated_at: string;
        copy_count: number;
        creator_username: string;
        creator_avatar: string | null;
        like_count: number;
        preview_image: string | null;
        content?: string;
    };
}

export const TrendingPromptCard = ({ prompt }: TrendingPromptCardProps) => {
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
                            &gt; AI prompt:
                        </div>

                        {/* Content with special formatting */}
                        <div className="line-clamp-2">{firstPart}</div>
                        {secondPart && <div className="line-clamp-1 text-foreground/70">{secondPart}</div>}
                    </div>
                </div>
            </div>
        );
    };

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
                <Link href={`/prompts/${prompt.id}`} className="block">
                    <h3 className="font-semibold text-lg line-clamp-2 hover:underline">
                        {prompt.title}
                    </h3>
                </Link>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {prompt.description || "No description provided"}
                </p>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-grow">
                <div className="flex items-center gap-2">
                    <Link href={`/profiles/${prompt.creator_username || "#"}`} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={prompt.creator_avatar || ""} alt={prompt.creator_username || "Unknown User"} />
                            <AvatarFallback>{getInitials(prompt.creator_username)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{prompt.creator_username || "Unknown User"}</span>
                    </Link>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex items-center justify-between border-t">
                <div className="flex items-center gap-3">
                    <PromptLikeButton
                        promptId={prompt.id}
                        likeCount={prompt.like_count}
                        className="text-sm p-0 h-auto"
                    />
                    <span className="flex items-center gap-1 text-sm">
                        <Copy className="h-4 w-4" />
                        {prompt.copy_count}
                    </span>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 font-normal"
                    asChild
                >
                    <Link href={`/prompts/${prompt.id}`}>
                        <Eye className="h-4 w-4" />
                        View
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}; 