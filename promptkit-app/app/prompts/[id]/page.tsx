import React from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ChevronLeft, Copy, Share2, FolderOpen, Pencil, Sparkles, Heart, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/typography/heading";
import { PromptCopyButton } from "@/components/prompts/prompt-copy-button";
import { PromptLikeButton } from "@/components/prompts/prompt-like-button";
import { PromptCustomizeButton } from "@/components/prompts/prompt-customize-button";
import { PromptViewCounter } from "@/components/prompts/prompt-view-counter";
import { BackButtonWrapper } from "@/components/prompts/back-button-wrapper";

interface PromptPageProps {
    params: {
        id: string;
    };
}

interface PromptImage {
    id: string;
    image_url: string;
}

interface Category {
    id: string;
    name: string;
}

export default async function PromptPage({ params }: PromptPageProps) {
    // Make sure to await params properly
    const { id } = await params;
    const supabase = await createClient();

    // Fetch prompt details with related data (without profiles)
    const { data: prompt, error } = await supabase
        .from("prompts")
        .select(`
            *,
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

    // Handle errors or not found early
    if (error || !prompt) {
        console.error("Error fetching prompt:", error);
        return notFound();
    }

    // Fetch profile data separately
    const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", prompt.user_id)
        .maybeSingle();

    // Add profile data to prompt object
    prompt.profiles = profileData;

    // Fetch prompt categories
    const { data: promptCategoriesData } = await supabase
        .from("prompt_categories")
        .select(`
            category_id,
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
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

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

    // Check if the current user can view this prompt
    if (!prompt.is_public && prompt.user_id !== userId) {
        return notFound();
    }

    // Determine if the current user is the creator of this prompt
    const isCreator = userId === prompt.user_id;

    // Transform the categories data to the expected format
    const categories = ((promptCategoriesData || []).map(item => ({
        id: item.categories?.id || '',
        name: item.categories?.name || ''
    })) || []) as Category[];
    const images = (prompt.prompt_images || []) as PromptImage[];

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
        <div className="container max-w-6xl py-6">
            {/* Hidden component to increment view count */}
            <PromptViewCounter promptId={prompt.id} />

            <div className="mb-6">
                <BackButtonWrapper fallbackUrl="/prompts/explore" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-5">
                    <Heading as="h1" size="3xl" className="break-words">
                        {prompt.title}
                    </Heading>

                    {/* Creator Info */}
                    <div className="flex items-center gap-3">
                        <Link href={`/profiles/${prompt.profiles?.username || ''}`} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={prompt.profiles?.avatar_url || ""} alt={prompt.profiles?.username || "User"} />
                                <AvatarFallback>{getInitials(prompt.profiles?.username)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{prompt.profiles?.username || "Anonymous"}</span>
                        </Link>
                        <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}
                        </span>
                    </div>

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
                            {images.map((image: PromptImage) => (
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
                    <Card className="overflow-hidden border-2 border-primary/10 shadow-lg">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Prompt Content</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PromptCopyButton
                                        promptId={prompt.id}
                                        content={prompt.content}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8"
                                    />
                                </div>
                            </div>
                            <div className="relative">


                                {/* Content with special formatting */}
                                <div className="p-6 text-md leading-relaxed whitespace-pre-wrap bg-gradient-to-br from-background to-muted/30 min-h-[200px] max-h-[600px] overflow-auto">

                                    <div className="pl-4 border-l-2 border-primary/20">
                                        {prompt.content}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Usage Tips and Examples */}
                    {prompt.description && (
                        <Card className="overflow-hidden border border-muted">
                            <CardContent className="p-0">
                                <div className="flex items-center bg-muted/30 px-4 py-2 border-b">
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-primary">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 16v-4" />
                                            <path d="M12 8h.01" />
                                        </svg>
                                        <span className="font-medium">How to Use This Prompt</span>
                                    </div>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="text-sm">
                                        <p className="mb-2 text-muted-foreground">{prompt.description}</p>

                                        <div className="mt-4 space-y-3">
                                            <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
                                                <h4 className="font-medium text-primary mb-2 text-sm">Best Practices</h4>
                                                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                                                    <li>Copy the entire prompt without modifications for best results</li>
                                                    <li>Replace any placeholder text in [brackets] with your specific information</li>
                                                    <li>Be specific with your instructions when using this prompt</li>
                                                </ul>
                                            </div>

                                            <div className="bg-muted/50 p-3 rounded-md border border-border">
                                                <h4 className="font-medium mb-2 text-sm">Example Use Case</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    This prompt works well for {categories.length > 0 ? categories.map(c => c.name).join(", ") : "various"} scenarios.
                                                    Try it with different AI models to see how responses vary.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="sticky top-20">
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="grid grid-cols-3 w-full gap-2 mb-2">
                                        <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-md">
                                            <div className="flex items-center gap-1 text-primary mb-1">
                                                <Copy className="h-4 w-4" />
                                                <span className="text-xs font-medium">COPIES</span>
                                            </div>
                                            <span className="text-lg font-bold">{prompt.copy_count}</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-md">
                                            <div className="flex items-center gap-1 text-primary mb-1">
                                                <Heart className="h-4 w-4" />
                                                <span className="text-xs font-medium">LIKES</span>
                                            </div>
                                            <span className="text-lg font-bold">{likeCount || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-2 bg-muted/50 rounded-md">
                                            <div className="flex items-center gap-1 text-primary mb-1">
                                                <Eye className="h-4 w-4" />
                                                <span className="text-xs font-medium">VIEWS</span>
                                            </div>
                                            <span className="text-lg font-bold">{prompt.view_count || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <PromptCopyButton
                                        promptId={prompt.id}
                                        content={prompt.content}
                                    />
                                    <PromptLikeButton
                                        promptId={prompt.id}
                                        initialLiked={hasLiked}
                                        likeCount={likeCount || 0}
                                        className=""
                                        showCount={false}
                                    />
                                    {/* Show Edit button for owners, Customize button for others */}
                                    {userId && !isCreator && (
                                        <Button
                                            variant="outline"
                                            className="gap-2"
                                            asChild
                                        >
                                            <Link href={`/prompts/${prompt.id}/edit`}>
                                                <Sparkles className="h-4 w-4" />
                                                Customize Prompt
                                            </Link>
                                        </Button>
                                    )}


                                    {/* Add Edit Button for creators */}
                                    {isCreator && (
                                        <Button
                                            variant="outline"
                                            className="gap-2"
                                            asChild
                                        >
                                            <Link href={`/my-prompts/edit/${prompt.id}`}>
                                                <Pencil className="h-4 w-4" />
                                                Edit Prompt
                                            </Link>
                                        </Button>
                                    )}


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