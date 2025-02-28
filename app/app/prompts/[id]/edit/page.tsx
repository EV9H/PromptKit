import { createClient } from '@/app/supabase/server'
import { redirect } from 'next/navigation'
import PromptForm from '../../prompt-form'

export default async function EditPromptPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Fetch the prompt with its categories
    const { data: prompt } = await supabase
        .from('prompts')
        .select(`
            *,
            prompt_categories(category_id)
        `)
        .eq('id', params.id)
        .eq('user_id', user.id)  // Ensure only owner can edit
        .single()

    if (!prompt) {
        // Prompt not found or doesn't belong to user
        redirect('/dashboard')
    }

    // Get all folders for selection
    const { data: folders } = await supabase
        .from('folders')
        .select('id, name, parent_id')
        .eq('user_id', user.id)
        .order('name')

    // Get all categories for selection
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

    // Fetch existing images
    const { data: promptImages } = await supabase
        .from('prompt_images')
        .select('image_url')
        .eq('prompt_id', prompt.id)

    // Add image URLs to the prompt object
    if (promptImages && promptImages.length > 0) {
        prompt.images = promptImages.map(img => img.image_url)
    }

    // Format folder data to show hierarchy
    const formattedFolders = []
    if (folders) {
        // First add root folders
        const rootFolders = folders.filter(folder => !folder.parent_id)
        formattedFolders.push(
            ...rootFolders.map(folder => ({
                id: folder.id,
                name: folder.name,
                displayName: folder.name,
            }))
        )

        // Then add child folders with indentation
        const childFolders = folders.filter(folder => folder.parent_id)
        for (const child of childFolders) {
            const parent = folders.find(f => f.id === child.parent_id)
            if (parent) {
                formattedFolders.push({
                    id: child.id,
                    name: child.name,
                    displayName: `— ${child.name}`,
                    parentId: child.parent_id
                })
            }
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Edit Prompt</h1>

                <PromptForm
                    folders={formattedFolders}
                    categories={categories || []}
                    userId={user.id}
                    prompt={prompt}
                />
            </div>
        </div>
    )
} 