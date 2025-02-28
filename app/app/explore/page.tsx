import { createClient } from '@/app/supabase/server'
import Link from 'next/link'
import FilterBar from './FilterBar'

interface ExplorePageProps {
    searchParams: {
        category?: string
        sort?: string
        search?: string
    }
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Fetch all categories for filter options
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

    // Build query for prompts based on filters
    let query = supabase
        .from('public_prompts')
        .select('*')

    // Apply category filter if selected
    if (searchParams.category) {
        // We need a different approach since we're using a view
        // We'll filter the results after fetching them
    }

    // Apply sorting
    switch (searchParams.sort) {
        case 'newest':
            query = query.order('created_at', { ascending: false })
            break
        case 'oldest':
            query = query.order('created_at', { ascending: true })
            break
        case 'most_copied':
            query = query.order('copy_count', { ascending: false })
            break
        case 'most_liked':
            query = query.order('like_count', { ascending: false })
            break
        default:
            // Default to trending (which is already the default order in the view)
            break
    }

    const { data: prompts } = await query.limit(20)

    // If category filter is applied, we need to filter prompts manually
    // This would be a simplified approach - in a real app you'd use a more efficient query
    let filteredPrompts = prompts || []
    if (searchParams.category && filteredPrompts.length > 0) {
        // We'd need to fetch category information for each prompt
        // In a real app, this would be optimized
    }

    // Apply text search filter if provided
    if (searchParams.search && filteredPrompts.length > 0) {
        const searchLower = searchParams.search.toLowerCase()
        filteredPrompts = filteredPrompts.filter(prompt =>
            prompt.title.toLowerCase().includes(searchLower) ||
            (prompt.description && prompt.description.toLowerCase().includes(searchLower))
        )
    }

    // Check which prompts the current user has liked
    let userLikedPromptIds: string[] = []
    if (user) {
        const { data: likedPrompts } = await supabase
            .from('prompt_likes')
            .select('prompt_id')
            .eq('user_id', user.id)

        userLikedPromptIds = likedPrompts?.map(like => like.prompt_id) || []
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Explore Prompts</h1>

            {/* Filters */}
            <FilterBar
                searchParams={searchParams}
                categories={categories || []}
            />

            {/* Prompts Grid */}
            {filteredPrompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrompts.map((prompt) => (
                        <Link
                            key={prompt.id}
                            href={`/prompts/${prompt.id}`}
                            className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {prompt.preview_image && (
                                <div className="h-48 bg-gray-100">
                                    <img
                                        src={prompt.preview_image}
                                        alt={prompt.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <div className="flex items-center mb-2">
                                    <img
                                        src={prompt.creator_avatar || '/default-avatar.png'}
                                        alt={prompt.creator_username}
                                        className="w-6 h-6 rounded-full mr-2"
                                    />
                                    <span className="text-sm text-gray-700">{prompt.creator_username}</span>
                                </div>
                                <h3 className="font-medium text-lg">{prompt.title}</h3>
                                {prompt.description && (
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{prompt.description}</p>
                                )}
                                <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                                    <div className="flex items-center space-x-4">
                                        <span className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            {prompt.copy_count}
                                        </span>
                                        <span className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${userLikedPromptIds.includes(prompt.id) ? 'text-red-500 fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            {prompt.like_count}
                                        </span>
                                    </div>
                                    <span>
                                        {new Date(prompt.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No prompts found matching your criteria.</p>
                </div>
            )}
        </div>
    )
} 