import db from '@/data/db.json';
import type { ApartmentData, Currency, PriceRange } from '@/types/apartment';
import type { SuggestionItem } from '@/types/suggestion';
import { getCurrentPrice } from '@/lib/pricing';

// ----- Raw JSON shapes (mirror of data/db.json) -----

type RawImage = { url: string; alt?: string; caption?: string; isMain?: boolean };

type RawCity = {
  _id: string;
  name: string;
  slug: string;
  region?: string;
  country?: string;
  description?: string;
  image?: string;
  active?: boolean;
  featured?: boolean;
};

type RawCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
};

type RawAmenity = {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  category?: string;
};

type RawApartment = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  citySlug: string;
  location?: { city?: string; country?: string; address?: string; lat?: number; lng?: number };
  experienceCategorySlug?: string;
  amenitySlugs?: string[];
  images?: RawImage[];
  pricePeriods?: PriceRange[];
  capacity?: { minGuests?: number; maxGuests?: number; bedrooms?: number; bathrooms?: number };
  active?: boolean;
  featured?: boolean;
  createdAt?: string;
};

const cities = db.cities as RawCity[];
const categories = db.experienceCategories as RawCategory[];
const amenities = db.amenities as RawAmenity[];
const apartments = db.apartments as RawApartment[];

// ----- Helpers -----

function mainImageUrl(apartment: RawApartment): string {
  const main = apartment.images?.find((img) => img.isMain);
  return main?.url ?? apartment.images?.[0]?.url ?? '';
}

function categoryName(slug?: string): string | undefined {
  return categories.find((c) => c.slug === slug)?.name;
}

function includesCI(haystack: string | undefined, needle: string): boolean {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/** Un periodo di prezzo si sovrappone all'intervallo richiesto? */
function periodOverlaps(period: PriceRange, checkin: string, checkout: string): boolean {
  if (!period.startDate) return false;
  if (period.startDate > checkout) return false;
  if (period.endDate) return period.endDate >= checkin;
  return period.startDate >= checkin;
}

function toApartmentData(apartment: RawApartment): ApartmentData {
  const { currentPrice, currentCurrency } = getCurrentPrice(apartment.pricePeriods);
  return {
    _id: apartment._id,
    name: apartment.name,
    location: { city: apartment.location?.city, country: apartment.location?.country },
    imageUrl: mainImageUrl(apartment),
    currentPrice,
    currentCurrency: currentCurrency as Currency | null,
    pricePeriods: apartment.pricePeriods,
    slug: apartment.slug,
    capacity: apartment.capacity
      ? { minGuests: apartment.capacity.minGuests, maxGuests: apartment.capacity.maxGuests }
      : null,
  };
}

export type ApartmentFilters = {
  city?: string | null;
  experienceCategory?: string | null;
  capacity?: number | null;
  checkin?: string | null;
  checkout?: string | null;
};

// ----- Public API (sostituisce le query GROQ di Sanity) -----

export async function getApartments(filters?: ApartmentFilters): Promise<ApartmentData[]> {
  let result = apartments.filter((a) => a.active !== false);

  if (filters) {
    const { city, experienceCategory, capacity, checkin, checkout } = filters;

    const hasCity = Boolean(city && city.trim());
    const hasCategory = Boolean(experienceCategory && experienceCategory.trim());

    if (hasCity || hasCategory) {
      result = result.filter((a) => {
        const cityMatch = hasCity
          ? includesCI(a.location?.city, city as string) || includesCI(a.citySlug, city as string)
          : false;
        const catMatch = hasCategory
          ? includesCI(categoryName(a.experienceCategorySlug), experienceCategory as string) ||
            includesCI(a.experienceCategorySlug, experienceCategory as string)
          : false;
        if (hasCity && hasCategory) return cityMatch || catMatch;
        return hasCity ? cityMatch : catMatch;
      });
    }

    if (typeof capacity === 'number') {
      result = result.filter((a) => {
        const min = a.capacity?.minGuests ?? 0;
        const max = a.capacity?.maxGuests ?? 999;
        return capacity >= min && capacity <= max;
      });
    }

    if (checkin && checkout) {
      result = result.filter((a) =>
        (a.pricePeriods ?? []).some((p) => periodOverlaps(p, checkin, checkout))
      );
    }
  }

  return result
    .slice()
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .map(toApartmentData);
}

export async function getFeaturedApartments(): Promise<ApartmentData[]> {
  return apartments
    .filter((a) => a.active !== false && a.featured)
    .slice(0, 8)
    .map(toApartmentData);
}

export type ApartmentDetail = {
  _id: string;
  name?: string;
  slug?: string;
  location?: { city?: string; country?: string };
  imageUrl?: string;
  images?: RawImage[];
  currentPrice?: number | null;
  currentCurrency?: Currency | null;
  capacity?: { minGuests?: number; maxGuests?: number; bedrooms?: number; bathrooms?: number } | null;
  category?: string | null;
  amenities?: Array<{ _id: string; name?: string; icon?: string }>;
  description?: string | null;
};

export async function getApartmentBySlug(slug: string): Promise<ApartmentDetail | null> {
  const apartment = apartments.find((a) => a.slug === slug && a.active !== false);
  if (!apartment) return null;

  const { currentPrice, currentCurrency } = getCurrentPrice(apartment.pricePeriods);
  const apartmentAmenities = (apartment.amenitySlugs ?? [])
    .map((s) => amenities.find((am) => am.slug === s))
    .filter((am): am is RawAmenity => Boolean(am))
    .map((am) => ({ _id: am._id, name: am.name, icon: am.icon }));

  return {
    _id: apartment._id,
    name: apartment.name,
    slug: apartment.slug,
    location: { city: apartment.location?.city, country: apartment.location?.country },
    imageUrl: mainImageUrl(apartment),
    images: apartment.images ?? [],
    currentPrice,
    currentCurrency: currentCurrency as Currency | null,
    capacity: apartment.capacity ?? null,
    category: categoryName(apartment.experienceCategorySlug) ?? null,
    amenities: apartmentAmenities,
    description: apartment.description ?? null,
  };
}

export async function getCities(): Promise<SuggestionItem[]> {
  return cities
    .filter((c) => c.active !== false)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ _id: c._id, name: c.name, slug: c.slug, description: c.description ?? null }));
}

export type FeaturedCity = { name: string; image: string; count: number };

export async function getFeaturedCities(): Promise<FeaturedCity[]> {
  return cities
    .filter((c) => c.active !== false && c.featured)
    .map((c) => ({
      name: c.name,
      image: c.image ?? '',
      count: apartments.filter((a) => a.citySlug === c.slug && a.active !== false).length,
    }));
}

export type ExperienceCategoryCard = {
  name: string;
  image: string;
  count: number;
  slug?: string;
  description?: string;
};

export async function getExperienceCategories(): Promise<SuggestionItem[]> {
  return categories
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ _id: c._id, name: c.name, slug: c.slug, description: c.description ?? null }));
}

export async function getExperienceCategoryCards(): Promise<ExperienceCategoryCard[]> {
  return categories.map((c) => ({
    name: c.name,
    image: c.image ?? '',
    slug: c.slug,
    description: c.description,
    count: apartments.filter(
      (a) => a.experienceCategorySlug === c.slug && a.active !== false
    ).length,
  }));
}
