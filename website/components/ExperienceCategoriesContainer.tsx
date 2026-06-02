import { ExperienceCategories } from './ExperienceCategories';
import { getExperienceCategoryCards } from '@/lib/data';

export async function ExperienceCategoriesContainer() {
  const cards = await getExperienceCategoryCards();

  return (
    <ExperienceCategories
      categories={cards}
      title="Popular Experiences"
      subtitle="Browse by category"
    />
  );
}
