import { createClient } from '@/app/supabase/server'
import Link from 'next/link'

export default async function Home() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Fetch some trending prompts to display on the landing page
    const { data: trendingPrompts } = await supabase
        .from('trending_prompts')
        .select('*')
        .limit(6)

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 py-16 bg-gradient-to-b from-blue-50 to-white">
                <h1 className="text-5xl font-bold mb-4 text-center">Welcome to PromptKit</h1>
                <p className="text-xl mb-8 text-center max-w-2xl text-gray-600">
                    Store, organize, and share your favorite AI prompts. Discover prompts created by others.
                </p>

                <div className="flex flex-wrap gap-4 justify-center mb-12">
                    {user ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                            >
                                My Dashboard
                            </Link>
                            <Link
                                href="/explore"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg"
                            >
                                Explore Prompts
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/auth/login"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/explore"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg"
                            >
                                Explore Prompts
                            </Link>
                        </>
                    )}
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h2 className="text-xl font-semibold mb-2">Organize Prompts</h2>
                        <p className="text-gray-600">
                            Create folders and categories to organize your prompts for different purposes.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <h2 className="text-xl font-semibold mb-2">One-Click Copy</h2>
                        <p className="text-gray-600">
                            Copy prompts with a single click. No more retyping or searching through notes.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        <h2 className="text-xl font-semibold mb-2">Share & Discover</h2>
                        <p className="text-gray-600">
                            Share your prompts with the community and discover prompts from others.
                        </p>
                    </div>
                </div>
            </main>

            {/* Trending Prompts Section */}
            {trendingPrompts && trendingPrompts.length > 0 && (
                <section className="py-16 px-4 sm:px-20 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold">Trending Prompts</h2>
                            <Link href="/explore" className="text-blue-600 hover:underline">
                                View All →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trendingPrompts.map((prompt) => (
                                <Link
                                    key={prompt.id}
                                    href={`/prompts/${prompt.id}`}
                                    className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    {prompt.preview_image && (
                                        <div className="h-48 bg-gray-100">
                                            <img
                                                src={prompt.preview_image}
                                                alt={prompt.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex items-center mb-2">
                                            <img
                                                src={prompt.creator_avatar || '/default-avatar.png'}
                                                alt={prompt.creator_username}
                                                className="w-6 h-6 rounded-full mr-2"
                                            />
                                            <span className="text-sm text-gray-700">{prompt.creator_username}</span>
                                        </div>
                                        <h3 className="font-medium text-lg">{prompt.title}</h3>
                                        {prompt.description && (
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{prompt.description}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                                            <div className="flex items-center space-x-4">
                                                <span className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    {prompt.copy_count}
                                                </span>
                                                <span className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    {prompt.like_count}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="bg-gray-100 py-8 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-gray-600">
                        © {new Date().getFullYear()} PromptKit. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}