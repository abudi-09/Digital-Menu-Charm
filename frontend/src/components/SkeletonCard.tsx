import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonCard = () => {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full sm:aspect-video" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start gap-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full sm:w-28" />
        </div>
      </div>
    </Card>
  );
};
