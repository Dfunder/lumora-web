export type CategorySlug = 'education' | 'health' | 'environment' | 'disaster-relief' | 'animal-welfare' | 'general';

export interface CategoryInfo {
  name: string;
  description: string;
  color: string;
  slug: CategorySlug;
}

export const CAMPAIGN_CATEGORIES: Record<string, CategoryInfo> = {
  'education': { slug: 'education', name: 'Education', description: 'Support campaigns that help students access quality education.', color: 'from-blue-500 to-indigo-600' },
  'health': { slug: 'health', name: 'Health', description: 'Help provide medical care, supplies, and support to those in need.', color: 'from-green-500 to-emerald-600' },
  'environment': { slug: 'environment', name: 'Environment', description: 'Protect our planet with campaigns focused on sustainability and conservation.', color: 'from-teal-500 to-cyan-600' },
  'disaster-relief': { slug: 'disaster-relief', name: 'Disaster Relief', description: 'Support communities affected by natural disasters and emergencies.', color: 'from-orange-500 to-red-600' },
  'animal-welfare': { slug: 'animal-welfare', name: 'Animal Welfare', description: 'Help protect and care for animals in need.', color: 'from-pink-500 to-rose-600' },
  'general': { slug: 'general', name: 'General', description: 'Browse all campaigns making a difference.', color: 'from-purple-500 to-violet-600' },
};

export function getCategoryInfo(slug: string): CategoryInfo {
  return CAMPAIGN_CATEGORIES[slug] || CAMPAIGN_CATEGORIES['general'];
}

export const CATEGORY_LIST = Object.values(CAMPAIGN_CATEGORIES);
