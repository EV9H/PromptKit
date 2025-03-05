import React from "react";
import Link from "next/link";
import { Bot, Code, Image, BookText, Database, PenTool, Briefcase, GraduationCap, Calendar, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Category {
    id: string;
    name: string;
    description: string | null;
    promptCount?: number;
}

interface PromptCategoryListProps {
    categories: Category[];
}

export const PromptCategoryList = ({ categories }: PromptCategoryListProps) => {
    const getCategoryIcon = (categoryName: string) => {
        const iconProps = { className: "h-8 w-8 mb-2" };

        switch (categoryName.toLowerCase()) {
            case "chatbot":
                return <Bot {...iconProps} />;
            case "text generation":
            case "creative writing":
                return <PenTool {...iconProps} />;
            case "image generation":
                return <Image {...iconProps} />;
            case "code assistant":
                return <Code {...iconProps} />;
            case "data analysis":
                return <Database {...iconProps} />;
            case "academic":
                return <GraduationCap {...iconProps} />;
            case "business":
                return <Briefcase {...iconProps} />;
            case "personal assistant":
                return <Calendar {...iconProps} />;
            default:
                return <ListFilter {...iconProps} />;
        }
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
            {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/prompts/categories/${category.id}`}
                    className="group flex flex-col items-center p-3 bg-card text-card-foreground rounded-lg border border-border transition-all hover:border-primary/50 hover:shadow-md"
                >
                    <div className="flex flex-col items-center text-center p-2 w-full">
                        <div className="rounded-full bg-background p-2 mb-2 border border-border group-hover:border-primary/20 transition-colors">
                            {getCategoryIcon(category.name)}
                        </div>
                        <h3 className="font-medium group-hover:text-primary text-sm">{category.name}</h3>

                        {category.promptCount !== undefined && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                                {category.promptCount} {category.promptCount === 1 ? 'prompt' : 'prompts'}
                            </Badge>
                        )}

                        {category.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {category.description}
                            </p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
}; 