import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        outline: "border border-current",
        todo: "bg-pastel-blue text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
        "in-progress": "bg-pastel-orange text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
        done: "bg-pastel-green text-green-700 dark:bg-green-900/30 dark:text-green-300",
        cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        low: "bg-pastel-blue text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        medium: "bg-pastel-yellow text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
        high: "bg-pastel-orange text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
        urgent: "bg-pastel-red text-red-700 dark:bg-red-900/20 dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "todo" && "bg-blue-500",
            variant === "in-progress" && "bg-orange-500",
            variant === "done" && "bg-green-500",
            variant === "cancelled" && "bg-gray-400",
            variant === "urgent" && "bg-red-500",
            variant === "high" && "bg-orange-400",
            variant === "medium" && "bg-yellow-400",
            variant === "low" && "bg-blue-400"
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
