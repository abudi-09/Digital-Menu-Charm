import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuSkeletonGridProps {
  columns?: number;
  count?: number;
}

export const MenuSkeletonGrid = ({
  columns = 3,
  count = 6,
}: MenuSkeletonGridProps) => {
  const columnClass =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-6 ${columnClass}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-background/80 p-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.25 }}
        >
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
