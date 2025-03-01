import React, { ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type HeadingProps<T extends ElementType> = {
    as?: T;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
    children: React.ReactNode;
} & HTMLAttributes<HTMLHeadingElement>;

export function Heading<T extends ElementType = "h2">({
    as,
    size = "lg",
    className,
    children,
    ...props
}: HeadingProps<T>) {
    const Component = as || "h2";

    const sizeClasses = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl",
        "3xl": "text-3xl",
        "4xl": "text-4xl md:text-5xl lg:text-6xl",
    };

    return (
        <Component
            className={cn(sizeClasses[size], className)}
            {...props}
        >
            {children}
        </Component>
    );
} 