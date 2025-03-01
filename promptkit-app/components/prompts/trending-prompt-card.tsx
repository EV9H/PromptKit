import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Heart, Copy, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
                    <span className="flex items-center gap-1 text-sm">
                        <Heart className="h-4 w-4" />
                        {prompt.like_count}
                    </span>
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