import { createClient } from '@/app/supabase/server'
import { redirect } from 'next/navigation'
import FolderForm from '../folder-form'

export default async function NewFolderPage({
    searchParams,
}: {
    searchParams: { parent?: string }
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Get all folders for parent selection
    const { data: folders } = await supabase
        .from('folders')
        .select('id, name, parent_id')
        .eq('user_id', user.id)
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

    // Initialize with the parent ID from the query parameter if it exists
    const initialParent = searchParams?.parent || null

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Create New Folder</h1>

                <FolderForm
                    folders={formattedFolders}
                    initialParent={initialParent}
                    userId={user.id}
                />
            </div>
        </div>
    )
} 