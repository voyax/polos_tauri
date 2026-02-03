import { useQuery } from "@tanstack/react-query";
import { getHospitalConfig } from "@/lib/database";

export function useHospitalConfig() {
  return useQuery({
    queryKey: ["hospitalConfig"],
    queryFn: getHospitalConfig,
    staleTime: 1000 * 60 * 5, // 5分钟内不重新获取
  });
}
