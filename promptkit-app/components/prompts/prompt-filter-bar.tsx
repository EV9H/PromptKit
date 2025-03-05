"use client"

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import Link from "next/link";

interface Category {
    id: string;
    name: string;
}

interface PromptFilterBarProps {
    categories: Category[];
    selectedCategory?: string;
    sort?: string;
    search?: string;
}

export function PromptFilterBar({
    categories,
    selectedCategory,
    sort = "trending",
    search = "",
}: PromptFilterBarProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Setup react-hook-form
    const form = useForm({
        defaultValues: {
            search,
            category: selectedCategory || "",
            sort,
        },
    });

    // Apply filters when form is submitted
    const onSubmit = (values: any) => {
        const params = new URLSearchParams();

        if (values.search) {
            params.set("search", values.search);
        }

        if (values.category) {
            params.set("category", values.category);
        }

        if (values.sort) {
            params.set("sort", values.sort);
        }

        // Reset to page 1 when filters change
        params.set("page", "1");

        router.push(`${pathname}?${params.toString()}`);
    };

    // Handle search input
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(form.getValues());
    };

    return (
        <div className="w-full md:max-w-2xl space-y-2">
            <Form {...form}>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <FormField
                        control={form.control}
                        name="search"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search prompts..."
                                            className="pl-8"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Search</Button>
                </form>

                <div className="flex flex-wrap gap-2">
                    <FormField
                        control={form.control}
                        name="sort"
                        render={({ field }) => (
                            <FormItem className="flex-1 min-w-[160px]">
                                <Select
                                    value={field.value}
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        onSubmit({ ...form.getValues(), sort: value });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="trending">Trending</SelectItem>
                                        <SelectItem value="newest">Newest</SelectItem>
                                        <SelectItem value="oldest">Oldest</SelectItem>
                                        <SelectItem value="most_liked">Most Liked</SelectItem>
                                        <SelectItem value="most_copied">Most Copied</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value);

                                                // If user selects a category, we have two options:
                                                // 1. Apply filter on current page
                                                // 2. Navigate to the category page
                                                // Let's go with option 1 for consistency
                                                onSubmit({ ...form.getValues(), category: value });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Categories</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="mt-2 text-xs text-muted-foreground">
                                            <Link
                                                href="/prompts/categories"
                                                className="hover:text-primary hover:underline"
                                            >
                                                Browse all categories
                                            </Link>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </Form>
        </div>
    );
} 