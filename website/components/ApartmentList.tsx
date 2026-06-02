'use client';
import { useEffect, useState } from 'react';
import { ApartmentCard } from './ApartmentCard';
import { useApartmentFilters } from '@/providers/ApartmentFiltersProvider';
import { fetchApartments } from '@/lib/data/actions';

type Currency = 'EUR' | 'USD' | 'GBP';

type ApartmentListItem = {
  _id: string;
  name?: string;
  location?: { city?: string; country?: string };
  imageUrl?: string;
  currentPrice?: number | null;
  currentCurrency?: Currency | null;
  slug?: string | null;
};

export function ApartmentList() {
  const { filters } = useApartmentFilters();
  const [apartments, setApartments] = useState<ApartmentListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      const data = await fetchApartments(filters);
      if (active) setApartments(data);
      if (active) setLoading(false);
    }
    run();
    return () => {
      active = false;
    };
  }, [filters]);

  return (
    <section className="bg-muted/50 px-4 py-16" data-testid="section-apartment-list">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3
              className="text-foreground text-3xl font-bold"
              data-testid="text-apartment-list-title"
            >
              Our Apartments
            </h3>
            <p className="text-muted-foreground" data-testid="text-apartment-list-subtitle"></p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-card animate-pulse overflow-hidden rounded-xl border border-neutral-200 shadow-sm"
              >
                <div className="bg-muted h-48 w-full" />
                <div className="space-y-3 p-4">
                  <div className="bg-muted h-3 w-1/3 rounded" />
                  <div className="bg-muted h-4 w-2/3 rounded" />
                  <div className="bg-muted h-6 w-1/2 rounded" />
                </div>
              </div>
            ))
          ) : apartments.length === 0 ? (
            <div
              className="text-muted-foreground col-span-full py-12 text-center"
              data-testid="text-no-apartments"
            >
              No apartments available.
            </div>
          ) : (
            apartments.map((apartment) => (
              <ApartmentCard key={apartment._id} apartment={apartment} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default ApartmentList;
