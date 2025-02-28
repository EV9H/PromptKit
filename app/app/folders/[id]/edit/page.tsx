import { createClient } from '@/app/supabase/server'
import { redirect } from 'next/navigation'
import FolderForm from '../../folder-form'

export default async function EditFolderPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Fetch the folder
    const { data: folder } = await supabase
        .from('folders')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)  // Ensure only owner can edit
        .single()

    if (!folder) {
        // Folder not found or doesn't belong to user
        redirect('/dashboard')
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
        const rootFolders = folders.filter(f => !f.parent_id)
        formattedFolders.push(
            ...rootFolders.map(f => ({
                id: f.id,
                name: f.name,
                displayName: f.name,
            }))
        )

        // Then add child folders with indentation
        const childFolders = folders.filter(f => f.parent_id)
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
            <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Edit Folder</h1>

                <FolderForm
                    folders={formattedFolders}
                    userId={user.id}
                    folder={folder}
                />
            </div>
        </div>
    )
} 