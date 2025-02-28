import { createClient } from '@/app/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function FolderPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // If not logged in, redirect to login page
    if (!user) {
        redirect('/auth/login')
    }

    // Fetch the current folder
    const { data: folder } = await supabase
        .from('folders')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

    if (!folder) {
        // Folder not found or doesn't belong to user
        redirect('/dashboard')
    }

    // Fetch subfolders
    const { data: subfolders } = await supabase
        .from('folders')
        .select('*')
        .eq('parent_id', folder.id)
        .eq('user_id', user.id)
        .order('name')

    // Fetch prompts in this folder
    const { data: prompts } = await supabase
        .from('prompts')
        .select('*, prompt_images(image_url)')
        .eq('folder_id', folder.id)
        .eq('user_id', user.id)
        .order('title')

    // Fetch parent folder for breadcrumb navigation
    let parentFolder = null
    if (folder.parent_id) {
        const { data: parent } = await supabase
            .from('folders')
            .select('id, name')
            .eq('id', folder.parent_id)
            .single()

        parentFolder = parent
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb navigation */}
            <div className="flex items-center text-sm mb-6">
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    My Prompts
                </Link>
                <span className="mx-2">/</span>

                {parentFolder && (
                    <>
                        <Link href={`/folders/${parentFolder.id}`} className="text-blue-600 hover:underline">
                            {parentFolder.name}
                        </Link>
                        <span className="mx-2">/</span>
                    </>
                )}

                <span className="font-medium">{folder.name}</span>
            </div>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{folder.name}</h1>
                    {folder.description && (
                        <p className="text-gray-600 mt-1">{folder.description}</p>
                    )}
                </div>
                <div className="space-x-4">
                    <Link
                        href={`/prompts/new?folder=${folder.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Add Prompt
                    </Link>
                    <Link
                        href={`/folders/new?parent=${folder.id}`}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                    >
                        Add Subfolder
                    </Link>
                    <Link
                        href={`/folders/${folder.id}/edit`}
                        className="text-gray-600 hover:text-gray-800 px-4 py-2"
                    >
                        Edit Folder
                    </Link>
                </div>
            </div>

            {/* Subfolders Section */}
            {subfolders && subfolders.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Subfolders</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {subfolders.map((subfolder) => (
                            <Link
                                key={subfolder.id}
                                href={`/folders/${subfolder.id}`}
                                className="block p-6 border rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    <span className="font-medium">{subfolder.name}</span>
                                </div>
                                {subfolder.description && (
                                    <p className="text-sm text-gray-600 mt-2">{subfolder.description}</p>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Prompts Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Prompts</h2>
                {prompts && prompts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {prompts.map((prompt) => {
                            // Get the first image if any
                            const previewImage = prompt.prompt_images && prompt.prompt_images.length > 0
                                ? prompt.prompt_images[0].image_url
                                : null;

                            return (
                                <Link
                                    key={prompt.id}
                                    href={`/prompts/${prompt.id}`}
                                    className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {previewImage && (
                                        <div className="h-40 bg-gray-100">
                                            <img
                                                src={previewImage}
                                                alt={prompt.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-medium text-lg">{prompt.title}</h3>
                                        {prompt.description && (
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{prompt.description}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-gray-500">
                                                {new Date(prompt.created_at).toLocaleDateString()}
                                            </span>
                                            {prompt.is_public && (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Public</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500">No prompts in this folder yet.</p>
                )}
            </div>
        </div>
    )
} 