import { createClient } from '@/app/supabase/server'
import { redirect } from 'next/navigation'
import PromptForm from '../prompt-form'

export default async function NewPromptPage({
    searchParams,
}: {
    searchParams: { folder?: string }
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
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

    // Initialize with the folder ID from the query parameter if it exists
    const initialFolder = searchParams?.folder || null

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Create New Prompt</h1>

                <PromptForm
                    folders={formattedFolders}
                    categories={categories || []}
                    initialFolder={initialFolder}
                    userId={user.id}
                />
            </div>
        </div>
    )
} 