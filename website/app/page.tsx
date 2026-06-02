import { HomeComponent } from '@/components/Home';
import { RuntimeContextProvider } from '@/providers/RuntimeContextProvider';
import { getExperienceCategories, getCities } from '@/lib/data';

export default async function Home() {
  // Fetch suggestions data server-side from local JSON
  const [experienceCategories, cities] = await Promise.all([
    getExperienceCategories(),
    getCities(),
  ]);

  return (
    <RuntimeContextProvider
      cities={cities || []}
      experienceCategories={experienceCategories || []}
    >
      <HomeComponent />
    </RuntimeContextProvider>
  );
}
