import { useState, useCallback } from "react";
import { useFetch } from "@raycast/utils";
import { useAuthHeaders } from "./use-auth-headers";
import { Company, Person } from "../types";

interface Opportunity {
  id: string;
  name: string;
  amount: {
    amountMicros: number;
    currencyCode: string;
  };
  closeDate: string;
  stage?: string;
  position: number;
  pointOfContactId: string;
  companyId: string;
  company: Company | null;
  pointOfContact: Person | null;
}

interface OpportunitiesResponse {
  data: {
    opportunities: Opportunity[];
  };
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
}

interface UseGetOpportunitiesOptions {
  limit?: number;
  orderBy?: string;
  initialCursor?: string;
}

export function useGetOpportunities({ limit = 20, orderBy = "name", initialCursor }: UseGetOpportunitiesOptions = {}) {
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [allOpportunities, setAllOpportunities] = useState<Opportunity[]>([]);

  const { data, isLoading, error, revalidate } = useFetch<OpportunitiesResponse>(
    `https://api.twenty.com/rest/opportunities?limit=${limit}&order_by=${orderBy}${cursor ? `&starting_after=${cursor}` : ""}`,
    {
      headers: useAuthHeaders(),
    },
  );

  const loadMore = useCallback(() => {
    if (data?.pageInfo.hasNextPage) {
      setCursor(data.pageInfo.endCursor);
      setAllOpportunities((prev) => [...prev, ...data.data.opportunities]);
    }
  }, [data]);

  const opportunities = allOpportunities.length > 0 ? allOpportunities : (data?.data.opportunities ?? []);

  return {
    opportunities,
    isLoading,
    error,
    loadMore,
    hasMore: data?.pageInfo.hasNextPage ?? false,
    revalidate,
  };
}
