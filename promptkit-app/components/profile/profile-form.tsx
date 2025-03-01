"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

// Profile schema definition
const profileSchema = z.object({
    username: z.string().min(3, {
        message: "Username must be at least 3 characters.",
    }).max(50),
    full_name: z.string().max(100).optional().or(z.literal('')),
    avatar_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
    bio: z.string().max(500, {
        message: "Bio must not exceed 500 characters.",
    }).optional().or(z.literal('')),
});

type ProfileData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    profile: any;
    userId: string;
}

export default function ProfileForm({ profile, userId }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Default values from existing profile or empty values
    const defaultValues = {
        username: profile?.username || "",
        full_name: profile?.full_name || "",
        avatar_url: profile?.avatar_url || "",
        website: profile?.website || "",
        bio: profile?.bio || "",
    };

    const form = useForm<ProfileData>({
        resolver: zodResolver(profileSchema),
        defaultValues,
    });

    const getInitials = (name: string) => {
        if (!name) return "U";

        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    async function onSubmit(data: ProfileData) {
        setIsLoading(true);

        try {
            const response = await fetch("/api/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    id: userId,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update profile");
            }

            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={form.watch("avatar_url")} alt="Profile" />
                        <AvatarFallback>{getInitials(form.watch("full_name") || form.watch("username"))}</AvatarFallback>
                    </Avatar>

                    <div>
                        <h3 className="text-lg font-medium">{form.watch("full_name") || form.watch("username") || "Your Profile"}</h3>
                        <p className="text-sm text-muted-foreground">Upload a photo by entering an image URL below</p>
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormDescription>
                                This is your public display name.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormDescription>
                                Your full name will be displayed on your profile.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Avatar URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/avatar.jpg" {...field} />
                            </FormControl>
                            <FormDescription>
                                Enter the URL of your profile picture.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                                <Input placeholder="https://yourwebsite.com" {...field} />
                            </FormControl>
                            <FormDescription>
                                Your personal website or portfolio.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us about yourself..."
                                    className="min-h-32 resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Brief description about yourself (max 500 characters).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        </Form>
    );
} 