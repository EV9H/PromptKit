'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/supabase/client'
import { useRouter } from 'next/navigation'

interface Folder {
    id: string
    name: string
    displayName: string
    parentId?: string
}

interface Category {
    id: string
    name: string
}

interface PromptFormProps {
    folders: Folder[]
    categories: Category[]
    initialFolder?: string | null
    userId: string
    prompt?: {
        id: string
        title: string
        content: string
        description?: string
        is_public: boolean
        folder_id?: string
        prompt_categories?: {
            category_id: string
        }[]
    }
}

export default function PromptForm({
    folders,
    categories,
    initialFolder,
    userId,
    prompt
}: PromptFormProps) {
    const router = useRouter()
    const supabase = createClient()

    const [title, setTitle] = useState(prompt?.title || '')
    const [content, setContent] = useState(prompt?.content || '')
    const [description, setDescription] = useState(prompt?.description || '')
    const [isPublic, setIsPublic] = useState(prompt?.is_public || false)
    const [folderId, setFolderId] = useState(initialFolder || prompt?.folder_id || '')
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        prompt?.prompt_categories?.map(pc => pc.category_id) || []
    )
    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const isEditing = !!prompt

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        if (!title || !content) {
            setError('Title and content are required')
            setIsSubmitting(false)
            return
        }

        try {
            // 1. Create or update prompt
            let promptId: string

            if (isEditing) {
                // Update existing prompt
                const { error: updateError } = await supabase
                    .from('prompts')
                    .update({
                        title,
                        content,
                        description: description || null,
                        is_public: isPublic,
                        folder_id: folderId || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', prompt.id)

                if (updateError) throw updateError
                promptId = prompt.id

                // Delete existing category relationships to recreate them
                await supabase
                    .from('prompt_categories')
                    .delete()
                    .eq('prompt_id', promptId)
            } else {
                // Create new prompt
                const { data: newPrompt, error: insertError } = await supabase
                    .from('prompts')
                    .insert({
                        title,
                        content,
                        description: description || null,
                        is_public: isPublic,
                        folder_id: folderId || null,
                        user_id: userId
                    })
                    .select('id')
                    .single()

                if (insertError) throw insertError
                promptId = newPrompt.id
            }

            // 2. Add categories if selected
            if (selectedCategories.length > 0) {
                const categoryRelations = selectedCategories.map(categoryId => ({
                    prompt_id: promptId,
                    category_id: categoryId
                }))

                const { error: categoryError } = await supabase
                    .from('prompt_categories')
                    .insert(categoryRelations)

                if (categoryError) throw categoryError
            }

            // 3. Add images if provided
            if (imageUrls.length > 0) {
                if (isEditing) {
                    // Delete existing images first
                    await supabase
                        .from('prompt_images')
                        .delete()
                        .eq('prompt_id', promptId)
                }

                const imageEntries = imageUrls.map(url => ({
                    prompt_id: promptId,
                    image_url: url
                }))

                const { error: imageError } = await supabase
                    .from('prompt_images')
                    .insert(imageEntries)

                if (imageError) throw imageError
            }

            // Redirect to the created prompt
            router.push(`/prompts/${promptId}`)
            router.refresh()

        } catch (err) {
            console.error('Error saving prompt:', err)
            setError('Failed to save prompt. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId)
            } else {
                return [...prev, categoryId]
            }
        })
    }

    const handleImageAdd = (url: string) => {
        if (url && !imageUrls.includes(url)) {
            setImageUrls(prev => [...prev, url])
        }
    }

    const handleImageRemove = (url: string) => {
        setImageUrls(prev => prev.filter(imageUrl => imageUrl !== url))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
            </div>

            {/* Content */}
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Prompt Content *
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono"
                    required
                ></textarea>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                ></textarea>
            </div>

            {/* Folder Selection */}
            <div>
                <label htmlFor="folder" className="block text-sm font-medium text-gray-700 mb-1">
                    Folder
                </label>
                <select
                    id="folder"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">No Folder</option>
                    {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                            {folder.displayName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Categories */}
            <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((category) => (
                        <label key={category.id} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(category.id)}
                                onChange={() => handleCategoryToggle(category.id)}
                                className="mr-2"
                            />
                            <span>{category.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Image URLs */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images
                </label>
                <div className="space-y-3">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="flex items-center">
                            <input
                                type="text"
                                value={url}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md mr-2"
                            />
                            <button
                                type="button"
                                onClick={() => handleImageRemove(url)}
                                className="text-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="Add image URL"
                            id="new-image-url"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md mr-2"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const input = document.getElementById('new-image-url') as HTMLInputElement
                                if (input.value) {
                                    handleImageAdd(input.value)
                                    input.value = ''
                                }
                            }}
                            className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>

            {/* Public/Private toggle */}
            <div className="flex items-center">
                <input
                    id="is-public"
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="mr-2"
                />
                <label htmlFor="is-public" className="text-sm font-medium text-gray-700">
                    Make this prompt public
                </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update Prompt' : 'Create Prompt'}
                </button>
            </div>
        </form>
    )
} 