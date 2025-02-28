'use client'

import { useState } from 'react'
import { createClient } from '@/app/supabase/client'

interface CopyButtonProps {
    promptId: string
    promptContent: string
}

export default function CopyButton({ promptId, promptContent }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)
    const supabase = createClient()

    const handleCopy = async () => {
        try {
            // Copy to clipboard
            await navigator.clipboard.writeText(promptContent)

            // Show copied indicator
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)

            // Increment copy count in the database
            await supabase.rpc('increment_prompt_copy_count', { prompt_id: promptId })
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    return (
        <button
            onClick={handleCopy}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
            </svg>
            {copied ? 'Copied!' : 'Copy'}
        </button>
    )
} 