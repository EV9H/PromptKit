import React from "react";
import Link from "next/link";
import { Bot, Code, Image, BookText, Database, PenTool, Briefcase, GraduationCap, Calendar, ListFilter } from "lucide-react";

interface Category {
    id: string;
    name: string;
    description: string | null;
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
                <Link
                    key={category.id}
                    href={`/prompts/categories/${category.id}`}
                    className="group flex flex-col items-center p-4 bg-card text-card-foreground rounded-lg border border-border transition-all hover:border-primary/50 hover:shadow-md"
                >
                    <div className="flex flex-col items-center text-center p-2">
                        {getCategoryIcon(category.name)}
                        <h3 className="font-medium group-hover:text-primary">{category.name}</h3>
                        {category.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {category.description}
                            </p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
}; 