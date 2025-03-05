import { FetchPromptsOptions, ProcessedPrompt } from "./prompt-utils";

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

interface PromptsFetchResponse {
    prompts: ProcessedPrompt[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

interface Category {
    id: string;
    name: string;
    description?: string;
    [key: string]: any;
}

/**
 * Fetches prompts from the API with various filters
 */
export async function fetchPrompts(options: FetchPromptsOptions): Promise<ApiResponse<PromptsFetchResponse>> {
    try {
        // Build query parameters
        const params = new URLSearchParams();
        if (options.categoryId) params.append('categoryId', options.categoryId);
        if (options.search) params.append('search', options.search);
        if (options.sort) params.append('sort', options.sort);
        if (options.page) params.append('page', options.page.toString());
        if (options.pageSize) params.append('pageSize', options.pageSize.toString());
        if (options.userId) params.append('userId', options.userId);
        if (options.isPublic !== undefined) params.append('isPublic', options.isPublic.toString());

        // Make the API request
        const response = await fetch(`/api/prompts/fetch?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error("Error fetching prompts:", error);
        return { error: error instanceof Error ? error.message : "Failed to fetch prompts" };
    }
}

/**
 * Fetches all categories
 */
export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
    try {
        const response = await fetch('/api/categories');

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { error: error instanceof Error ? error.message : "Failed to fetch categories" };
    }
}

/**
 * Fetches a single category by ID
 */
export async function fetchCategory(id: string): Promise<ApiResponse<Category>> {
    try {
        const response = await fetch(`/api/categories?id=${id}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return { data };
    } catch (error) {
        console.error("Error fetching category:", error);
        return { error: error instanceof Error ? error.message : "Failed to fetch category" };
    }
} 