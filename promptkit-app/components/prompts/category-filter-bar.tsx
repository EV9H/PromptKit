'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Grid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Category {
    id: string;
    name: string;
    description?: string;
    [key: string]: any;
}

interface CategoryFilterBarProps {
    categories: Category[];
    currentCategoryId?: string;
    baseUrl: string;
    searchValue?: string;
    sortValue?: string;
}

export function CategoryFilterBar({
    categories,
    currentCategoryId,
    baseUrl,
    searchValue = '',
    sortValue = 'trending',
}: CategoryFilterBarProps) {
    const [search, setSearch] = React.useState(searchValue);
    const [sort, setSort] = React.useState(sortValue);
    const router = useRouter();

    // Validate sort value on mount
    useEffect(() => {
        const validSortOptions = ['trending', 'newest', 'oldest', 'most_copied', 'most_liked', 'most_viewed'];
        if (sortValue && !validSortOptions.includes(sortValue)) {
            // If invalid sort option, default to trending
            setSort('trending');
        } else {
            setSort(sortValue);
        }
    }, [sortValue]);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    // Handle search form submission
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigateWithFilters(currentCategoryId, sort, search);
    };

    // Handle sort change
    const handleSortChange = (value: string) => {
        setSort(value);
        navigateWithFilters(currentCategoryId, value, search);
    };

    // Handle category change
    const handleCategoryChange = (categoryId: string | undefined) => {
        navigateWithFilters(categoryId, sort, search);
    };

    // Helper function to navigate with filters
    const navigateWithFilters = (categoryId: string | undefined, sortValue: string, searchValue: string) => {
        const params = new URLSearchParams();
        if (categoryId) params.append('category', categoryId);
        if (searchValue) params.append('search', searchValue);
        if (sortValue) params.append('sort', sortValue);
        router.push(`${baseUrl}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col space-y-4 mb-6">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex w-full max-w-sm items-center space-x-2">
                <Input
                    type="search"
                    placeholder="Search prompts..."
                    value={search}
                    onChange={handleSearchChange}
                    className="flex-1"
                />
                <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                </Button>
            </form>

            {/* Sort Options */}
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Sort by:</span>
                <Select value={sort} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="trending">Trending</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="most_copied">Most Copied</SelectItem>
                        <SelectItem value="most_liked">Most Liked</SelectItem>
                        <SelectItem value="most_viewed">Most Viewed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Categories Header with View All Link */}
            <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">Categories:</span>
                <Link
                    href="/prompts/categories"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                    <Grid className="h-3 w-3" />
                    View All Categories
                </Link>
            </div>

            {/* Categories List */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={!currentCategoryId ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(undefined)}
                >
                    All
                </Button>

                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant={currentCategoryId === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryChange(category.id)}
                    >
                        {category.name}
                    </Button>
                ))}
            </div>
        </div>
    );
} 