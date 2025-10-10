'use server';

import { client } from '@/lib/sanity/client';
import { QUERY_ALL_APARTMENTS, QUERY_ALL_APARTMENTS_FILTERED } from '@/lib/sanity/queries';
import type { ApartmentListFilters } from '@/providers/ApartmentFiltersProvider';
import type { ApartmentData } from '@/types/apartment';

export async function fetchApartments(
  filters?: ApartmentListFilters
): Promise<ApartmentData[]> {
  try {
    if (filters && (filters.city || filters.experienceCategory || filters.capacity || (filters.checkin && filters.checkout))) {
      const query = QUERY_ALL_APARTMENTS_FILTERED;
      const params = {
        city: filters.city ?? '',
        experienceCategory: filters.experienceCategory ?? '',
        capacity: typeof filters.capacity === 'number' ? filters.capacity : undefined,
        checkin: filters.checkin ?? undefined,
        checkout: filters.checkout ?? undefined,
      };
      // Log the GROQ query and parameters being sent to Sanity
      console.log('[sanity] Executing filtered query', { query, params });
      const data = await client.fetch<ApartmentData[]>(query, params);
      return data;
    }
    // Log the GROQ query used when no filters are provided
    console.log('[sanity] Executing unfiltered query', { query: QUERY_ALL_APARTMENTS });
    const data = await client.fetch<ApartmentData[]>(QUERY_ALL_APARTMENTS);
    return data;
  } catch (error) {
    console.error('Error fetching apartments:', error);
    return [];
  }
}

