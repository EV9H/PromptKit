import { createClient } from '@/app/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Dashboard() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // If not logged in, redirect to login page
    if (!user) {
        redirect('/auth/login')
    }

    // Fetch user's folders (root level only)
    const { data: folders } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .is('parent_id', null)
        .order('name')

    // Fetch user's prompts that are not in any folder
    const { data: prompts } = await supabase
        .from('prompts')
        .select('*, prompt_images(image_url)')
        .eq('user_id', user.id)
        .is('folder_id', null)
        .order('title')

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Prompts</h1>
                <div className="space-x-4">
                    <Link
                        href="/prompts/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Create Prompt
                    </Link>
                    <Link
                        href="/folders/new"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                    >
                        Create Folder
                    </Link>
                </div>
            </div>

            {/* Folders Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Folders</h2>
                {folders && folders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {folders.map((folder) => (
                            <Link
                                key={folder.id}
                                href={`/folders/${folder.id}`}
                                className="block p-6 border rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    <span className="font-medium">{folder.name}</span>
                                </div>
                                {folder.description && (
                                    <p className="text-sm text-gray-600 mt-2">{folder.description}</p>
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No folders created yet.</p>
                )}
            </div>

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
                    <p className="text-gray-500">No prompts created yet.</p>
                )}
            </div>
        </div>
    )
} 