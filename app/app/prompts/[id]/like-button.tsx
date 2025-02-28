'use client'

import { useState } from 'react'
import { createClient } from '@/app/supabase/client'

interface LikeButtonProps {
    promptId: string
    initialLikes: number
    initialLiked: boolean
    userId?: string
}

export default function LikeButton({
    promptId,
    initialLikes,
    initialLiked,
    userId
}: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked)
    const [likeCount, setLikeCount] = useState(initialLikes)
    const supabase = createClient()

    const handleLike = async () => {
        if (!userId) {
            // Redirect to login if not authenticated
            window.location.href = '/auth/login'
            return
        }

        try {
            if (liked) {
                // Unlike: remove like
                await supabase
                    .from('prompt_likes')
                    .delete()
                    .eq('prompt_id', promptId)
                    .eq('user_id', userId)

                setLiked(false)
                setLikeCount(prev => prev - 1)
            } else {
                // Like: add like
                await supabase
                    .from('prompt_likes')
                    .insert({
                        prompt_id: promptId,
                        user_id: userId
                    })

                setLiked(true)
                setLikeCount(prev => prev + 1)
            }
        } catch (error) {
            console.error('Failed to update like:', error)
        }
    }

    return (
        <div className="flex items-center">
            <button
                onClick={handleLike}
                className="flex items-center"
                disabled={!userId}
                title={userId ? '' : 'Sign in to like prompts'}
            >
                {liked ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                )}
                <span className={liked ? 'text-red-500' : 'text-gray-600'}>
                    {likeCount}
                </span>
            </button>
        </div>
    )
} 