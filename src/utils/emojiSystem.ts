// Dynamic Emoji System for Dollar App
// Provides rotating emoji collections for various business categories

export interface EmojiCategory {
  name: string;
  emojis: string[];
  description: string;
}

export const emojiCategories: Record<string, EmojiCategory> = {
  food: {
    name: 'Food & Dining',
    emojis: ['🌮', '🍕', '🍔', '🍣', '🥗', '🍜', '🧁', '🍩'],
    description: 'Local businesses, cafes, and food establishments'
  },
  beverages: {
    name: 'Beverages',
    emojis: ['🍺', '☕', '🍷', '🧋', '🥤', '🍹'],
    description: 'Bars, coffee shops, and beverage services'
  },
  beauty: {
    name: 'Beauty & Wellness',
    emojis: ['💅', '💄', '🧴', '✂️', '🧘‍♀️'],
    description: 'Salons, spas, and wellness centers'
  },
  retail: {
    name: 'Retail & Shopping',
    emojis: ['👟', '🛍️', '👕', '💍', '📱', '👜'],
    description: 'Stores, boutiques, and retail establishments'
  },
  services: {
    name: 'Services',
    emojis: ['🔧', '🏠', '🚗', '📊', '💻', '🎨'],
    description: 'Professional and technical services'
  }
};

// Get all emojis from all categories
export const getAllEmojis = (): string[] => {
  return Object.values(emojiCategories).flatMap(category => category.emojis);
};

// Get random emoji from a specific category
export const getRandomEmojiFromCategory = (categoryKey: string): string => {
  const category = emojiCategories[categoryKey];
  if (!category) return '🌮'; // Default fallback
  
  const randomIndex = Math.floor(Math.random() * category.emojis.length);
  return category.emojis[randomIndex];
};

// Get random emoji from all categories
export const getRandomEmoji = (): string => {
  const allEmojis = getAllEmojis();
  const randomIndex = Math.floor(Math.random() * allEmojis.length);
  return allEmojis[randomIndex];
};

// Get multiple random emojis (no duplicates)
export const getRandomEmojis = (count: number): string[] => {
  const allEmojis = getAllEmojis();
  const shuffled = [...allEmojis].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, allEmojis.length));
};

// Get emoji for business type with fallback
export const getBusinessEmoji = (businessType?: string): string => {
  if (!businessType) return getRandomEmoji();
  
  const type = businessType.toLowerCase();
  
  if (type.includes('food') || type.includes('business') || type.includes('cafe')) {
    return getRandomEmojiFromCategory('food');
  }
  if (type.includes('bar') || type.includes('coffee') || type.includes('drink')) {
    return getRandomEmojiFromCategory('beverages');
  }
  if (type.includes('salon') || type.includes('spa') || type.includes('beauty')) {
    return getRandomEmojiFromCategory('beauty');
  }
  if (type.includes('shop') || type.includes('store') || type.includes('retail')) {
    return getRandomEmojiFromCategory('retail');
  }
  if (type.includes('service') || type.includes('repair') || type.includes('tech')) {
    return getRandomEmojiFromCategory('services');
  }
  
  return getRandomEmoji();
};

// Seeded random for consistent emojis per session
export const getSeededRandomEmoji = (seed: string): string => {
  const allEmojis = getAllEmojis();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % allEmojis.length;
  return allEmojis[index];
};

// Generate emoji rotation for a list of items
export const generateEmojiRotation = (items: any[], useSeeded: boolean = false): string[] => {
  if (useSeeded) {
    return items.map((item, index) => 
      getSeededRandomEmoji(item.id || item.name || index.toString())
    );
  }
  return getRandomEmojis(items.length);
};

// Emoji animation utilities
export const emojiAnimationClasses = [
  'animate-bounce',
  'animate-pulse',
  'animate-float',
  'animate-ping'
];

export const getRandomAnimationClass = (): string => {
  const randomIndex = Math.floor(Math.random() * emojiAnimationClasses.length);
  return emojiAnimationClasses[randomIndex];
};