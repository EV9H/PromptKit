import React from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, Heart, Copy, Share2, FolderOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/typography/heading";
import { PromptCopyButton } from "@/components/prompts/prompt-copy-button";

interface PromptPageProps {
    params: {
        id: string;
    };
}

export default async function PromptPage({ params }: PromptPageProps) {
    const supabase = await createClient();
    const { id } = params;

    // Fetch prompt details
    const { data: prompt, error } = await supabase
        .from("prompts")
        .select(`
      *,
      profiles:user_id (
        id,
        username,
        avatar_url
      ),
      folders (
        id,
        name
      ),
      prompt_images (
        id,
        image_url
      )
    `)
        .eq("id", id)
        .single();

    // Fetch prompt categories
    const { data: promptCategories } = await supabase
        .from("prompt_categories")
        .select(`
      categories (
        id,
        name
      )
    `)
        .eq("prompt_id", id);

    // Fetch like count
    const { count: likeCount } = await supabase
        .from("prompt_likes")
        .select("*", { count: "exact", head: true })
        .eq("prompt_id", id);

    // Check if current user has liked the prompt
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user.id;

    let hasLiked = false;
    if (userId) {
        const { data: likeData } = await supabase
            .from("prompt_likes")
            .select("*")
            .eq("prompt_id", id)
            .eq("user_id", userId)
            .maybeSingle();

        hasLiked = !!likeData;
    }

    // Handle errors or not found
    if (error || !prompt) {
        return notFound();
    }

    // Check if the current user can view this prompt
    if (!prompt.is_public && prompt.user_id !== userId) {
        return notFound();
    }

    const categories = promptCategories?.map(item => item.categories) || [];
    const images = prompt.prompt_images || [];
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
        <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-6" asChild>
                <Link href="/prompts/explore">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Prompts
                </Link>
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Heading as="h1" size="3xl" className="break-words">
                        {prompt.title}
                    </Heading>

                    {/* Creator Info */}
                    <div className="flex items-center gap-3">
                        <Link href={`/profiles/${prompt.profiles.username}`} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={prompt.profiles.avatar_url || ""} alt={prompt.profiles.username} />
                                <AvatarFallback>{getInitials(prompt.profiles.username)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{prompt.profiles.username}</span>
                        </Link>
                        <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}
                        </span>
                    </div>

                    {/* Description */}
                    {prompt.description && (
                        <p className="text-muted-foreground">{prompt.description}</p>
                    )}

                    {/* Categories */}
                    {categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <Badge key={category.id} variant="secondary">
                                    <Link href={`/prompts/categories/${category.id}`}>
                                        {category.name}
                                    </Link>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Prompt Images */}
                    {images.length > 0 && (
                        <div className="space-y-4">
                            {images.map((image) => (
                                <div key={image.id} className="relative aspect-video w-full overflow-hidden rounded-lg">
                                    <Image
                                        src={image.image_url}
                                        alt={prompt.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Prompt Content */}
                    <Card>
                        <CardContent className="p-6">
                            <pre className="whitespace-pre-wrap font-sans text-sm p-4 bg-muted rounded-md overflow-auto max-h-96">
                                {prompt.content}
                            </pre>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="sticky top-24">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Heart className="h-5 w-5" />
                                            <span>{likeCount || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Copy className="h-5 w-5" />
                                            <span>{prompt.copy_count}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <PromptCopyButton promptId={prompt.id} />

                                    <Button variant="outline" className="gap-2">
                                        <Heart className="h-4 w-4" />
                                        {hasLiked ? "Liked" : "Like"}
                                    </Button>

                                    <Button variant="outline" className="gap-2">
                                        <Share2 className="h-4 w-4" />
                                        Share
                                    </Button>
                                </div>

                                {/* Folder Info */}
                                {prompt.folders && (
                                    <div className="pt-4 border-t flex items-center gap-2">
                                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Saved in: </span>
                                        <Link href={`/folders/${prompt.folders.id}`} className="text-sm font-medium hover:underline">
                                            {prompt.folders.name}
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
} 