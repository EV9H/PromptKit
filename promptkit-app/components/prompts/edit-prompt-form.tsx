"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

// Form schema using zod for validation
const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description cannot exceed 500 characters"),
    content: z.string().min(20, "Prompt content must be at least 20 characters"),
    categoryId: z.string({
        required_error: "Please select a category",
    }),
    isPublic: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface EditPromptFormProps {
    promptId: string;
    initialData: FormValues;
    categories: Array<{
        id: string;
        name: string;
    }>;
}

export function EditPromptForm({ promptId, initialData, categories }: EditPromptFormProps) {
    const router = useRouter();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData,
    });

    const onSubmit = async (data: FormValues) => {
        try {
            const response = await fetch(`/api/prompts/${promptId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update prompt");
            }

            toast({
                title: "Success!",
                description: "Your prompt has been updated.",
            });

            router.push(`/prompts/${promptId}`);
            router.refresh();
        } catch (error) {
            console.error("Error updating prompt:", error);
            toast({
                title: "Error",
                description: "Failed to update prompt. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter a title for your prompt" {...field} />
                            </FormControl>
                            <FormDescription>
                                A clear and concise title to help others find your prompt.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Briefly describe what your prompt does"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                A short summary of what your prompt does and how it should be used.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prompt Content</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter your prompt content here"
                                    className="min-h-[200px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                The full text of your prompt. Be as detailed as needed.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Choose the most relevant category for your prompt.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Make Public</FormLabel>
                                <FormDescription>
                                    Public prompts are visible to all users. Private prompts are only visible to you.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-between">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/my-prompts">Cancel</Link>
                    </Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Form>
    );
} 