import { ApartmentDetails } from './ApartmentDetails';
import { getApartmentBySlug } from '@/lib/data';

export async function ApartmentDetailsContainer({ slug }: { slug: string }) {
  const data = await getApartmentBySlug(slug);
  if (!data) {
    return <div className="text-muted-foreground p-6">Apartment not found.</div>;
  }
  return <ApartmentDetails apartment={data} />;
}
