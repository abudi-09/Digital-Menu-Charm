import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonCard = () => {
  return (
    <Card className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card/90 shadow-soft">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </Card>
  );
};
