import { useFetch } from "@raycast/utils";
import { useAuthHeaders } from "./use-auth-headers";
import { Opportunity } from "../types";

interface People {
  id: string;
  name: {
    firstName: string;
    lastName: string;
  };
  emails: {
    primaryEmail: string;
  };
  phones: {
    primaryPhoneNumber: string;
    primaryPhoneCountryCode: string;
  };
  jobTitle: string;
  avatarUrl: string;
  city: string;
  company?: {
    id: string;
    name: string;
    employees: number;
    address: {
      addressStreet1: string | null;
      addressStreet2: string | null;
      addressCity: string | null;
      addressPostcode: string | null;
      addressState: string | null;
      addressCountry: string | null;
      addressLat: string | null;
      addressLng: string | null;
    };
  };
  pointOfContactForOpportunities?: Opportunity[];
}

interface PeopleResponse {
  data: {
    people: People[];
  };
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
}

export function useGetPeople() {
  const { data, isLoading, error, revalidate } = useFetch<PeopleResponse>(`https://api.twenty.com/rest/people`, {
    headers: useAuthHeaders(),
  });

  console.dir(data?.data.people[1].pointOfContactForOpportunities, { depth: null });

  return {
    people: data?.data.people ?? [],
    isLoading,
    error,
    revalidate,
  };
}
