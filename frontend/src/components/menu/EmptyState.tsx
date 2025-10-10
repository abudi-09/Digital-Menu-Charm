import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  illustration,
  className,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border/60 bg-background/70 p-12 text-center backdrop-blur-sm",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border/70 bg-background/90 text-4xl">
        {illustration ?? "🍽️"}
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-serif font-semibold text-foreground">
          {title}
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel ? (
        <Button
          variant="ghost"
          className="rounded-full px-6"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </motion.div>
  );
};
