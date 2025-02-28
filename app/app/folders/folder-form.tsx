'use client'

import { useState } from 'react'
import { createClient } from '@/app/supabase/client'
import { useRouter } from 'next/navigation'

interface Folder {
    id: string
    name: string
    displayName: string
    parentId?: string
}

interface FolderFormProps {
    folders: Folder[]
    initialParent?: string | null
    userId: string
    folder?: {
        id: string
        name: string
        description?: string
        parent_id?: string
    }
}

export default function FolderForm({
    folders,
    initialParent,
    userId,
    folder
}: FolderFormProps) {
    const router = useRouter()
    const supabase = createClient()

    const [name, setName] = useState(folder?.name || '')
    const [description, setDescription] = useState(folder?.description || '')
    const [parentId, setParentId] = useState(initialParent || folder?.parent_id || '')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const isEditing = !!folder

    // Filter out the current folder from parent options (can't be its own parent)
    // Also filter out child folders of the current folder (circular reference)
    const filteredFolders = isEditing
        ? folders.filter(f => f.id !== folder.id && !isChildOf(f.id, folder.id, folders))
        : folders

    // Function to check if a folder is a child of another folder
    function isChildOf(folderId: string, parentId: string, allFolders: Folder[]): boolean {
        const folder = allFolders.find(f => f.id === folderId)
        if (!folder) return false
        if (folder.parentId === parentId) return true
        if (folder.parentId) return isChildOf(folder.parentId, parentId, allFolders)
        return false
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        if (!name) {
            setError('Folder name is required')
            setIsSubmitting(false)
            return
        }

        try {
            if (isEditing) {
                // Update existing folder
                const { error: updateError } = await supabase
                    .from('folders')
                    .update({
                        name,
                        description: description || null,
                        parent_id: parentId || null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', folder.id)

                if (updateError) throw updateError

                router.push(parentId ? `/folders/${parentId}` : '/dashboard')
            } else {
                // Create new folder
                const { data: newFolder, error: insertError } = await supabase
                    .from('folders')
                    .insert({
                        name,
                        description: description || null,
                        parent_id: parentId || null,
                        user_id: userId
                    })
                    .select('id, parent_id')
                    .single()

                if (insertError) throw insertError

                // Redirect to the created folder or to its parent
                if (newFolder) {
                    router.push(newFolder.parent_id ? `/folders/${newFolder.parent_id}` : '/dashboard')
                } else {
                    router.push('/dashboard')
                }
            }

            router.refresh()

        } catch (err: any) {
            console.error('Error saving folder:', err)

            // Handle unique constraint violation
            if (err.code === '23505') {
                setError('A folder with this name already exists at this location')
            } else {
                setError('Failed to save folder. Please try again.')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-md">
                    {error}
                </div>
            )}

            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Folder Name *
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                />
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

            {/* Parent Folder Selection */}
            <div>
                <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Folder
                </label>
                <select
                    id="parent"
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="">No Parent (Root Level)</option>
                    {filteredFolders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                            {folder.displayName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update Folder' : 'Create Folder'}
                </button>
            </div>
        </form>
    )
} 