"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

// Form schema using zod for validation
const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description cannot exceed 500 characters").optional(),
    content: z.string().min(20, "Prompt content must be at least 20 characters"),
    categoryId: z.string({
        required_error: "Please select a category",
    }),
    isPublic: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatePromptFormProps {
    categories: Array<{
        id: string;
        name: string;
    }>;
}

export function CreatePromptForm({ categories }: CreatePromptFormProps) {
    const router = useRouter();
    const [showAdditional, setShowAdditional] = useState(false);
    const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "My Prompt",
            description: "",
            content: "",
            categoryId: "",
            isPublic: false,
        },
    });

    // Focus on the content textarea when component mounts
    useEffect(() => {
        if (contentTextareaRef.current) {
            contentTextareaRef.current.focus();
        }
    }, []);

    const onSubmit = async (data: FormValues) => {
        try {
            const response = await fetch("/api/prompts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create prompt");
            }

            toast({
                title: "Success!",
                description: "Your prompt has been created.",
            });

            router.push(`/prompts/${result.prompt.id}`);
        } catch (error) {
            console.error("Error creating prompt:", error);
            toast({
                title: "Error",
                description: "Failed to create prompt. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">
                                Prompt<span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Enter your prompt content here..."
                                    className="min-h-[300px] text-base font-medium bg-background resize-y"
                                    {...field}
                                    ref={(e) => {
                                        field.ref(e);
                                        contentTextareaRef.current = e;
                                    }}
                                />
                            </FormControl>
                            <FormDescription>
                                The full text of your prompt. Be as detailed as needed.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Title <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter a title for your prompt" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Category <span className="text-red-500">*</span>
                                </FormLabel>
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Collapsible open={showAdditional} onOpenChange={setShowAdditional} className="w-full">
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" type="button" className="p-0 m-0 hover:bg-transparent">
                            <span>Additional Information</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showAdditional ? "transform rotate-180" : ""}`} />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description
                                        {/* <span className="text-gray-500">(optional)</span> */}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Briefly describe what your prompt does"
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        A short summary of what your prompt does and how it should be used will help others understand it better.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                    </CollapsibleContent>
                </Collapsible>
                <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Make Public</FormLabel>
                                <FormDescription>
                                    Private prompts are only visible to you.
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
                <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/prompts/explore">Cancel</Link>
                    </Button>
                    <Button type="submit" size="lg">Create Prompt</Button>
                </div>
            </form>
        </Form>
    );
} 