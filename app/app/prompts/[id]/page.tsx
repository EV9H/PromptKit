import { createClient } from '@/app/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CopyButton from './copy-button'
import LikeButton from './like-button'

export default async function PromptPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Fetch the prompt with related data
    const { data: prompt } = await supabase
        .from('prompts')
        .select(`
            *,
            prompt_images(id, image_url),
            prompt_categories(
                category_id,
                categories(id, name)
            ),
            folders(id, name)
        `)
        .eq('id', params.id)
        .single()

    if (!prompt) {
        redirect('/dashboard')
    }

    // Check if the user is the owner of the prompt
    const isOwner = user && user.id === prompt.user_id

    // If the prompt is not public and the user is not the owner, redirect
    if (!prompt.is_public && !isOwner) {
        redirect('/dashboard')
    }

    // Fetch the owner's profile info
    const { data: owner } = await supabase
        .from('profiles')
        .select('username, avatar_url, full_name')
        .eq('id', prompt.user_id)
        .single()

    // Get like count
    const { count: likeCount } = await supabase
        .from('prompt_likes')
        .select('*', { count: 'exact', head: true })
        .eq('prompt_id', prompt.id)

    // Check if current user has liked this prompt
    let userLiked = false
    if (user) {
        const { data: like } = await supabase
            .from('prompt_likes')
            .select('*')
            .eq('prompt_id', prompt.id)
            .eq('user_id', user.id)
            .maybeSingle()

        userLiked = !!like
    }

    // Extract categories
    const categories = prompt.prompt_categories
        ? prompt.prompt_categories.map(pc => pc.categories)
        : []

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb navigation */}
                <div className="flex items-center text-sm mb-6">
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        My Prompts
                    </Link>
                    {prompt.folders && (
                        <>
                            <span className="mx-2">/</span>
                            <Link href={`/folders/${prompt.folders.id}`} className="text-blue-600 hover:underline">
                                {prompt.folders.name}
                            </Link>
                        </>
                    )}
                    <span className="mx-2">/</span>
                    <span className="font-medium">{prompt.title}</span>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">{prompt.title}</h1>

                    <div className="flex items-center space-x-4">
                        {isOwner ? (
                            <>
                                <Link
                                    href={`/prompts/${prompt.id}/edit`}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    Edit
                                </Link>
                                <button
                                    className={`px-3 py-1 rounded text-sm ${prompt.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                                >
                                    {prompt.is_public ? 'Public' : 'Private'}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center">
                                <img
                                    src={owner.avatar_url || '/default-avatar.png'}
                                    alt={owner.username || 'User'}
                                    className="w-8 h-8 rounded-full mr-2"
                                />
                                <span>{owner.full_name || owner.username}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                {prompt.description && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Description</h2>
                        <p className="text-gray-700">{prompt.description}</p>
                    </div>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Categories</h2>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <span
                                    key={category.id}
                                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm"
                                >
                                    {category.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Prompt Images */}
                {prompt.prompt_images && prompt.prompt_images.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Images</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {prompt.prompt_images.map(image => (
                                <div key={image.id} className="border rounded-lg overflow-hidden">
                                    <img
                                        src={image.image_url}
                                        alt="Prompt preview"
                                        className="w-full h-auto"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Prompt Content */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold">Prompt</h2>
                        <CopyButton promptId={prompt.id} promptContent={prompt.content} />
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg border whitespace-pre-wrap font-mono">
                        {prompt.content}
                    </div>
                </div>

                {/* Stats and Interactions */}
                <div className="flex items-center justify-between py-4 border-t">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-600">{prompt.copy_count} copies</span>
                        </div>

                        <LikeButton
                            promptId={prompt.id}
                            initialLikes={likeCount || 0}
                            initialLiked={userLiked}
                            userId={user?.id}
                        />
                    </div>

                    <div className="text-gray-500 text-sm">
                        Created on {new Date(prompt.created_at).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    )
} 