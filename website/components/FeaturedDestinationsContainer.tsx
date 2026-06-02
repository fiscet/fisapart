import { FeaturedDestinations } from './FeaturedDestinations';
import { getFeaturedCities } from '@/lib/data';

export async function FeaturedDestinationsContainer() {
  const featuredCities = await getFeaturedCities();
  return <FeaturedDestinations featuredCities={featuredCities} />;
}
