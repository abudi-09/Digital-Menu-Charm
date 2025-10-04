import { useQuery } from "@tanstack/react-query";
import { fetchQRStats } from "@/lib/qrApi";

export const useQRStats = () =>
  useQuery({
    queryKey: ["qr-stats"],
    queryFn: fetchQRStats,
    refetchInterval: 30_000,
  });

export default useQRStats;
