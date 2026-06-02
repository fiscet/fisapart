export type Currency = 'EUR' | 'USD' | 'GBP';

export type PriceRange = {
  _type: 'priceRange';
  startDate?: string;
  endDate?: string;
  price?: number;
  currency?: Currency;
  notes?: string;
};

export interface ApartmentData {
  _id: string;
  name?: string;
  location?: { city?: string; country?: string };
  imageUrl?: string;
  currentPrice?: number | null;
  currentCurrency?: Currency | null;
  totalPrice?: number | null;
  totalDays?: number | null;
  pricePeriods?: Array<{
    _type: "priceRange";
    startDate?: string;
    endDate?: string;
    price?: number;
    currency?: "USD" | "EUR" | "GBP";
    notes?: string;
  }>;
  slug?: string | null;
  capacity?: { minGuests?: number; maxGuests?: number } | null;
}
