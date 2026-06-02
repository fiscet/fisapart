'use server';

import { getApartments, type ApartmentFilters } from '@/lib/data';
import type { ApartmentData } from '@/types/apartment';

export async function fetchApartments(filters?: ApartmentFilters): Promise<ApartmentData[]> {
  return getApartments(filters);
}
