import { createClient } from "@/utils/supabase/server";
import { Heading } from "@/components/typography/heading";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchablePrompts } from "@/components/prompts/searchable-prompts";

interface MyPromptsPageProps {
    searchParams: {
        page?: string;
    };
}

export default async function MyPromptsPage({
    searchParams,
}: MyPromptsPageProps) {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // Redirect to login if not authenticated
        redirect("/sign-in?callbackUrl=/my-prompts");
    }

    const page = parseInt((await searchParams).page || "1");
    const pageSize = 12;
    const offset = (page - 1) * pageSize;

    // Fetch user's created prompts
    const { data: createdPrompts, count: createdCount, error: createdError } = await supabase
        .from('prompts')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Get the liked prompts by the user - first get the liked prompt IDs
    const { data: likes } = await supabase
        .from('prompt_likes')
        .select('prompt_id')
        .eq('user_id', user.id);

    const likedPromptIds = likes?.map(like => like.prompt_id) || [];

    // Now fetch the full prompt data for the liked prompts
    let likedPrompts: any[] = [];
    let likedCount = 0;
    let likedError = null;

    if (likedPromptIds.length > 0) {
        const result = await supabase
            .from('prompts')
            .select('*', { count: 'exact' })
            .in('id', likedPromptIds)
            .order('created_at', { ascending: false });

        likedPrompts = result.data || [];
        likedCount = result.count || 0;
        likedError = result.error;
    }

    // Get usernames for all prompts in a separate query if needed
    const getAllUsernames = async (prompts: any[]) => {
        if (!prompts || prompts.length === 0) return {};

        // Extract all unique user IDs from prompts - fixed the linter error
        const userIdSet = new Set(prompts.map(p => p.user_id));
        const userIds = Array.from(userIdSet);

        // Fetch profiles for these users
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);

        // Create a map of user_id -> profile data
        const userMap: Record<string, any> = {};

        if (profiles) {
            for (const profile of profiles) {
                userMap[profile.id] = profile;
            }
        }

        return userMap;
    };

    // Format prompts for display to match the format expected by TrendingPromptCard
    const formatPrompts = async (prompts: any[] | null) => {
        if (!prompts || prompts.length === 0) return [];

        // Get user information for these prompts
        const userMap = await getAllUsernames(prompts);

        return prompts.map(prompt => {
            // Get the profile for this prompt's user_id
            const profile = userMap[prompt.user_id] || {};

            return {
                id: prompt.id, // Ensure ID is present
                title: prompt.title || '',
                description: prompt.description || '',
                content: prompt.content && prompt.content.length > 300 ?
                    prompt.content.substring(0, 300) : prompt.content || '',
                created_at: prompt.created_at || new Date().toISOString(),
                updated_at: prompt.updated_at || new Date().toISOString(),
                copy_count: prompt.copy_count || 0,
                like_count: prompt.like_count || 0,
                creator_username: profile.username || 'Unknown User',
                creator_avatar: profile.avatar_url || null,
                preview_image: prompt.preview_image || null,
                user_id: prompt.user_id,
                is_public: prompt.is_public
            };
        });
    };

    const processedCreatedPrompts = await formatPrompts(createdPrompts);
    const processedLikedPrompts = await formatPrompts(likedPrompts);

    return (
        <div className="container mx-auto px-4 py-8">
            <Heading as="h1" size="2xl" className="mb-8">
                My Prompts
            </Heading>

            <Card>
                <CardHeader>
                    <CardTitle>Your Prompt Collection</CardTitle>
                    <CardDescription>
                        View, manage, and organize your created and saved prompts.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="created" className="space-y-6">
                        <TabsList className="grid w-full md:w-auto grid-cols-2">
                            <TabsTrigger value="created">
                                <span className="text-sm font-medium">
                                    Created Prompts
                                </span>
                            </TabsTrigger>
                            <TabsTrigger value="liked">
                                <span className="text-sm font-medium">
                                    Saved & Liked Prompts
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="created" className="space-y-4">
                            {createdError ? (
                                <div className="text-destructive">
                                    Failed to load your prompts: {createdError.message}
                                </div>
                            ) : processedCreatedPrompts && processedCreatedPrompts.length > 0 ? (
                                <SearchablePrompts
                                    prompts={processedCreatedPrompts}
                                    activeTab="created"
                                />
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-muted-foreground text-lg mb-4">
                                        You haven't created any prompts yet.
                                    </p>
                                    <a
                                        href="/prompts/create"
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                                    >
                                        Create Your First Prompt
                                    </a>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="liked" className="space-y-4">
                            {likedError ? (
                                <div className="text-destructive">
                                    Failed to load your liked prompts: {likedError.message}
                                </div>
                            ) : processedLikedPrompts && processedLikedPrompts.length > 0 ? (
                                <SearchablePrompts
                                    prompts={processedLikedPrompts}
                                    activeTab="liked"
                                />
                            ) : (
                                <div className="text-center py-16">
                                    <p className="text-muted-foreground text-lg mb-4">
                                        You haven't liked or saved any prompts yet.
                                    </p>
                                    <a
                                        href="/prompts/explore"
                                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                                    >
                                        Explore Prompts
                                    </a>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
} 