import React from "react";

interface HeadingProps {
    title: string;
    description?: string;
    centered?: boolean;
}

export function Heading({
    title,
    description,
    centered = false,
}: HeadingProps) {
    return (
        <div className={centered ? "text-center" : ""}>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
                <p className="mt-2 text-muted-foreground">{description}</p>
            )}
        </div>
    );
} 