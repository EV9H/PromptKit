import { createClient } from "@/utils/supabase/server";

export interface Prompt {
    id: string;
    title: string;
    content: string;
    description?: string;
    is_public: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
    copy_count: number;
    like_count?: number;
    view_count?: number;
    [key: string]: any;
}

export interface Profile {
    id: string;
    username?: string;
    avatar_url?: string;
    [key: string]: any;
}

export interface ProcessedPrompt extends Prompt {
    profile: Profile | null;
}

export interface FetchPromptsOptions {
    categoryId?: string;
    search?: string;
    sort?: 'newest' | 'oldest' | 'most_copied' | 'most_liked' | 'most_viewed' | 'trending';
    page?: number;
    pageSize?: number;
    userId?: string;
    isPublic?: boolean;
}

/**
 * Fetches prompts with associated profile data
 */
export async function fetchPromptsWithProfiles(options: FetchPromptsOptions) {
    const supabase = await createClient();
    const {
        categoryId,
        search,
        sort = 'trending',
        page = 1,
        pageSize = 12,
        userId,
        isPublic
    } = options;

    const offset = (page - 1) * pageSize;

    try {
        // Base query - either from prompt_categories or directly from prompts
        let promptsQuery;

        if (categoryId) {
            // If category is specified, query through prompt_categories
            promptsQuery = supabase
                .from("prompt_categories")
                .select(`
                    prompt_id,
                    prompts:prompts!inner(
                        id, title, content, description, is_public, user_id, created_at, updated_at, copy_count, view_count
                    )
                `, { count: 'exact' })
                .eq('category_id', categoryId);
        } else {
            // Otherwise query prompts directly
            promptsQuery = supabase
                .from("prompts")
                .select('*', { count: 'exact' });
        }

        // Apply filters
        if (isPublic !== undefined) {
            if (categoryId) {
                promptsQuery = promptsQuery.eq('prompts.is_public', isPublic);
            } else {
                promptsQuery = promptsQuery.eq('is_public', isPublic);
            }
        }

        if (userId) {
            if (categoryId) {
                promptsQuery = promptsQuery.eq('prompts.user_id', userId);
            } else {
                promptsQuery = promptsQuery.eq('user_id', userId);
            }
        }

        if (search) {
            if (categoryId) {
                promptsQuery = promptsQuery.ilike("prompts.title", `%${search}%`);
            } else {
                promptsQuery = promptsQuery.ilike("title", `%${search}%`);
            }
        }

        // Apply sorting
        switch (sort) {
            case "newest":
                if (categoryId) {
                    promptsQuery = promptsQuery.order('prompts(created_at)', { ascending: false });
                } else {
                    promptsQuery = promptsQuery.order('created_at', { ascending: false });
                }
                break;
            case "oldest":
                if (categoryId) {
                    promptsQuery = promptsQuery.order('prompts(created_at)', { ascending: true });
                } else {
                    promptsQuery = promptsQuery.order('created_at', { ascending: true });
                }
                break;
            case "most_copied":
                if (categoryId) {
                    promptsQuery = promptsQuery.order('prompts(copy_count)', { ascending: false });
                } else {
                    promptsQuery = promptsQuery.order('copy_count', { ascending: false });
                }
                break;
            case "most_liked":
                // Fall back to copy_count for sorting if like_count is requested
                if (categoryId) {
                    promptsQuery = promptsQuery.order('prompts(copy_count)', { ascending: false });
                } else {
                    promptsQuery = promptsQuery.order('copy_count', { ascending: false });
                }
                break;
            case "most_viewed":
                if (categoryId) {
                    promptsQuery = promptsQuery.order('prompts(view_count)', { ascending: false });
                } else {
                    promptsQuery = promptsQuery.order('view_count', { ascending: false });
                }
                break;
            case "trending":
            default:
                if (categoryId) {
                    promptsQuery = promptsQuery.order('prompts(copy_count)', { ascending: false });
                } else {
                    promptsQuery = promptsQuery.order('copy_count', { ascending: false });
                }
                break;
        }

        // Apply pagination
        const { data: promptData, count, error: promptsError } = await promptsQuery
            .range(offset, offset + pageSize - 1);

        if (promptsError) {
            console.error("Error fetching prompts:", promptsError);
            throw new Error(promptsError.message || "Failed to fetch prompts");
        }

        // Extract prompts from the result
        const prompts: Prompt[] = [];
        if (promptData) {
            if (categoryId) {
                // Extract from join result
                for (const item of promptData) {
                    if (item.prompts) {
                        prompts.push(item.prompts as unknown as Prompt);
                    }
                }
            } else {
                // Direct prompts
                prompts.push(...promptData as Prompt[]);
            }
        }

        // Get the unique user IDs from the prompts
        const userIds = Array.from(new Set(prompts.map(prompt => prompt.user_id)));

        // Fetch profiles for these users
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);

        // Create a lookup map for profiles
        const profilesMap = new Map<string, Profile>();
        profiles?.forEach(profile => {
            profilesMap.set(profile.id, profile as Profile);
        });

        // Add profile data to prompts
        const processedPrompts = prompts.map(prompt => ({
            ...prompt,
            profile: profilesMap.get(prompt.user_id) || null,
            content: prompt.content && prompt.content.length > 300 ?
                prompt.content.substring(0, 300) : prompt.content,
            // Ensure like_count is always defined, default to 0
            like_count: prompt.like_count || 0
        }));

        return {
            prompts: processedPrompts,
            totalCount: count || 0,
            totalPages: count ? Math.ceil(count / pageSize) : 0,
            currentPage: page
        };
    } catch (error) {
        console.error("Error in fetchPromptsWithProfiles:", error);
        throw error;
    }
}

/**
 * Fetches all categories
 */
export async function fetchCategories() {
    const supabase = await createClient();

    try {
        const { data: categories, error } = await supabase
            .from("categories")
            .select("*")
            .order("name");

        if (error) {
            console.error("Error fetching categories:", error);
            throw new Error(error.message || "Failed to fetch categories");
        }

        return categories;
    } catch (error) {
        console.error("Error in fetchCategories:", error);
        throw error;
    }
}

/**
 * Fetches a single category by ID
 */
export async function fetchCategoryById(categoryId: string) {
    const supabase = await createClient();

    try {
        const { data: category, error } = await supabase
            .from("categories")
            .select("*")
            .eq("id", categoryId)
            .single();

        if (error) {
            console.error("Error fetching category:", error);
            throw new Error(error.message || "Category not found");
        }

        return category;
    } catch (error) {
        console.error("Error in fetchCategoryById:", error);
        throw error;
    }
} 