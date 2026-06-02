import type { PriceRange } from '@/types/apartment';

/**
 * Calcola il prezzo totale per un appartamento in un intervallo di date
 * @param checkin - Data di check-in (stringa ISO YYYY-MM-DD)
 * @param checkout - Data di check-out (stringa ISO YYYY-MM-DD)
 * @param pricePeriods - Array dei periodi di prezzo dell'appartamento
 * @returns Oggetto con prezzo totale e numero di notti
 */
export function calculateTotalPrice(
  checkin: string,
  checkout: string,
  pricePeriods: PriceRange[]
): { totalPrice: number; totalDays: number } {
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);

  if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
    return { totalPrice: 0, totalDays: 0 };
  }

  if (checkinDate >= checkoutDate) {
    return { totalPrice: 0, totalDays: 0 };
  }

  let totalPrice = 0;
  let totalDays = 0;
  const currentDate = new Date(checkinDate);

  // Itera attraverso ogni notte tra checkin e checkout
  while (currentDate < checkoutDate) {
    totalPrice += findPriceForDate(currentDate, pricePeriods);
    totalDays++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { totalPrice, totalDays };
}

/** Trova il prezzo per una data specifica nei periodi di prezzo */
function findPriceForDate(date: Date, pricePeriods: PriceRange[]): number {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD

  for (const period of pricePeriods) {
    if (isDateInPricePeriod(dateString, period.startDate, period.endDate)) {
      return period.price || 0;
    }
  }

  return 0;
}

/** Verifica se una data (YYYY-MM-DD) è compresa in un periodo di prezzo */
function isDateInPricePeriod(date: string, startDate?: string, endDate?: string): boolean {
  if (!startDate) return false;
  if (!endDate) return date === startDate;
  return date >= startDate && date <= endDate;
}

/**
 * Restituisce il prezzo/valuta "corrente": il periodo che copre oggi,
 * altrimenti il primo periodo disponibile.
 */
export function getCurrentPrice(
  pricePeriods: PriceRange[] | undefined
): { currentPrice: number | null; currentCurrency: PriceRange['currency'] | null } {
  if (!pricePeriods || pricePeriods.length === 0) {
    return { currentPrice: null, currentCurrency: null };
  }

  const today = new Date().toISOString().split('T')[0];
  const active = pricePeriods.find(
    (p) => p.startDate && p.endDate && p.startDate <= today && p.endDate >= today
  );
  const chosen = active ?? pricePeriods[0];

  return {
    currentPrice: chosen.price ?? null,
    currentCurrency: chosen.currency ?? null,
  };
}
