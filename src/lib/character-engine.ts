import { AttributeType, Genre, Book, CharacterState, Attribute } from '@/types/reading';

const GENRE_ATTRIBUTE_MAP: Record<Genre, Partial<Record<AttributeType, number>>> = {
  'Fiction': { imagination: 8, empathy: 6, creativity: 5 },
  'Non-Fiction': { wisdom: 10, curiosity: 7, focus: 5 },
  'Mystery': { focus: 9, curiosity: 7, wisdom: 4 },
  'Science Fiction': { imagination: 9, curiosity: 8, creativity: 6 },
  'Fantasy': { imagination: 10, creativity: 8, empathy: 5 },
  'Biography': { wisdom: 8, empathy: 7, resilience: 6 },
  'History': { wisdom: 9, curiosity: 6, focus: 5 },
  'Self-Help': { wisdom: 7, resilience: 9, focus: 6 },
  'Philosophy': { wisdom: 10, curiosity: 8, focus: 7 },
  'Poetry': { creativity: 10, empathy: 8, imagination: 7 },
  'Romance': { empathy: 10, imagination: 6, creativity: 5 },
  'Thriller': { focus: 9, resilience: 7, curiosity: 6 },
  'Other': { wisdom: 5, curiosity: 5, focus: 5 },
};

const ATTRIBUTE_COLORS: Record<AttributeType, string> = {
  wisdom: '#9B7EBD',
  curiosity: '#A8D8EA',
  empathy: '#D8A7B1',
  imagination: '#E8B86D',
  focus: '#A8C5A0',
  creativity: '#F4A6D7',
  resilience: '#C9A9E0',
};

export function initializeCharacter(): CharacterState {
  const attributes: Record<AttributeType, Attribute> = {
    wisdom: { name: 'wisdom', value: 0, maxValue: 100, level: 1, color: ATTRIBUTE_COLORS.wisdom, icon: '🦉' },
    curiosity: { name: 'curiosity', value: 0, maxValue: 100, level: 1, color: ATTRIBUTE_COLORS.curiosity, icon: '🔍' },
    empathy: { name: 'empathy', value: 0, maxValue: 100, level: 1, color: ATTRIBUTE_COLORS.empathy, icon: '💖' },
    imagination: { name: 'imagination', value: 0, maxValue: 100, level: 1, color: ATTRIBUTE_COLORS.imagination, icon: '✨' },
    focus: { name: 'focus', value: 0, maxValue: 100, level: 1, color: ATTRIBUTE_COLORS.focus, icon: '🎯' },
    creativity: { name: 'creativity', value: 0, maxValue: 100, level: 1, color: ATTRIBUTE_COLORS.creativity, icon: '🎨' },
    resilience: { name: 'resilience', value: 0, maxValue: 100, level: 1, color: ATTRIBUTE_COLORS.resilience, icon: '🛡️' },
  };

  return {
    attributes,
    totalBooksRead: 0,
    totalReadingTime: 0,
    currentLevel: 1,
    visualTraits: {
      baseColor: '#FFDAB9',
      accessories: [],
      aura: 'none',
    },
  };
}

export function calculateBookImpact(genre: Genre): Partial<Record<AttributeType, number>> {
  return GENRE_ATTRIBUTE_MAP[genre] || GENRE_ATTRIBUTE_MAP['Other'];
}

export function applyBookToCharacter(character: CharacterState, book: Book): CharacterState {
  const impact = calculateBookImpact(book.genre);
  const updatedAttributes = { ...character.attributes };

  Object.entries(impact).forEach(([attr, points]) => {
    const attribute = updatedAttributes[attr as AttributeType];
    const newValue = Math.min(attribute.value + points, attribute.maxValue);
    const newLevel = Math.floor(newValue / 20) + 1;
    
    updatedAttributes[attr as AttributeType] = {
      ...attribute,
      value: newValue,
      level: newLevel,
    };
  });

  const newLevel = calculateCharacterLevel(updatedAttributes);
  const visualTraits = updateVisualTraits(character.visualTraits, newLevel, updatedAttributes);

  return {
    ...character,
    attributes: updatedAttributes,
    totalBooksRead: character.totalBooksRead + 1,
    currentLevel: newLevel,
    visualTraits,
  };
}

export function applyReadingSession(character: CharacterState, durationSeconds: number): CharacterState {
  const pointsPerMinute = 0.5;
  const effectiveMinutes = durationSeconds / 60;
  const totalPoints = Math.floor(effectiveMinutes * pointsPerMinute);
  const pointsPerAttribute = Math.floor(totalPoints / 7);

  const updatedAttributes = { ...character.attributes };
  Object.keys(updatedAttributes).forEach((attr) => {
    const attribute = updatedAttributes[attr as AttributeType];
    const newValue = Math.min(attribute.value + pointsPerAttribute, attribute.maxValue);
    const newLevel = Math.floor(newValue / 20) + 1;
    
    updatedAttributes[attr as AttributeType] = {
      ...attribute,
      value: newValue,
      level: newLevel,
    };
  });

  const newLevel = calculateCharacterLevel(updatedAttributes);

  return {
    ...character,
    attributes: updatedAttributes,
    totalReadingTime: character.totalReadingTime + durationSeconds,
    currentLevel: newLevel,
  };
}

function calculateCharacterLevel(attributes: Record<AttributeType, Attribute>): number {
  const totalValue = Object.values(attributes).reduce((sum, attr) => sum + attr.value, 0);
  return Math.floor(totalValue / 100) + 1;
}

function updateVisualTraits(
  currentTraits: CharacterState['visualTraits'],
  level: number,
  attributes: Record<AttributeType, Attribute>
): CharacterState['visualTraits'] {
  const accessories = [...currentTraits.accessories];
  
  if (level >= 5 && !accessories.includes('hat')) accessories.push('hat');
  if (level >= 10 && !accessories.includes('book')) accessories.push('book');
  if (level >= 15 && !accessories.includes('glasses')) accessories.push('glasses');
  
  let aura = 'none';
  if (level >= 8) aura = 'soft-glow';
  if (level >= 16) aura = 'radiant';
  if (level >= 25) aura = 'ethereal';

  return {
    ...currentTraits,
    accessories,
    aura,
  };
}

export function getAttributeColor(attributeType: AttributeType): string {
  return ATTRIBUTE_COLORS[attributeType];
}

export function generateJournalEntry(character: CharacterState, book?: Book): string {
  const entries = [
    `Your character's ${book?.genre || 'reading journey'} has deepened their understanding of the world.`,
    `Through the pages, your character discovered new facets of themselves.`,
    `The story resonated deeply, leaving lasting impressions on your character's soul.`,
    `Your character emerged from this reading experience transformed.`,
    `Each word absorbed has woven itself into your character's essence.`,
  ];
  
  return entries[Math.floor(Math.random() * entries.length)];
}

export function getRecommendations(character: CharacterState): Genre[] {
  const attributeValues = Object.entries(character.attributes)
    .sort((a, b) => a[1].value - b[1].value);
  
  const lowestAttribute = attributeValues[0][0] as AttributeType;
  
  const recommendedGenres: Genre[] = [];
  Object.entries(GENRE_ATTRIBUTE_MAP).forEach(([genre, impacts]) => {
    if (impacts[lowestAttribute] && impacts[lowestAttribute]! >= 7) {
      recommendedGenres.push(genre as Genre);
    }
  });
  
  return recommendedGenres.slice(0, 3);
}
