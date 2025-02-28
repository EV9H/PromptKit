"use client"

import Link from 'next/link'

interface FilterBarProps {
    searchParams: {
        category?: string
        sort?: string
        search?: string
    }
    categories: Array<{
        id: string
        name: string
    }>
}

export default function FilterBar({ searchParams, categories }: FilterBarProps) {
    return (
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                {/* Search */}
                <div className="w-full sm:w-auto">
                    <form className="flex">
                        <input
                            type="text"
                            placeholder="Search prompts..."
                            defaultValue={searchParams.search || ''}
                            name="search"
                            className="px-3 py-2 border border-gray-300 rounded-l-md w-full"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-r-md"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Sort options */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Sort by:</span>
                    <select
                        defaultValue={searchParams.sort || 'trending'}
                        onChange={(e) => {
                            const url = new URL(window.location.href)
                            url.searchParams.set('sort', e.target.value)
                            window.location.href = url.toString()
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="trending">Trending</option>
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="most_copied">Most Copied</option>
                        <option value="most_liked">Most Liked</option>
                    </select>
                </div>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mt-4">
                <Link
                    href="/explore"
                    className={`px-3 py-1 rounded-full text-sm ${!searchParams.category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                >
                    All
                </Link>
                {categories.map(category => (
                    <Link
                        key={category.id}
                        href={`/explore?category=${category.id}`}
                        className={`px-3 py-1 rounded-full text-sm ${searchParams.category === category.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                        {category.name}
                    </Link>
                ))}
            </div>
        </div>
    )
} 