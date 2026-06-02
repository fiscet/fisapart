import { FeaturedApartments } from './FeaturedApartments';
import { getFeaturedApartments } from '@/lib/data';

export async function FeaturedApartmentsContainer() {
  const items = await getFeaturedApartments();
  return <FeaturedApartments apartments={items} />;
}
