export type Genre = 
  | 'Fiction'
  | 'Non-Fiction'
  | 'Mystery'
  | 'Science Fiction'
  | 'Fantasy'
  | 'Biography'
  | 'History'
  | 'Self-Help'
  | 'Philosophy'
  | 'Poetry'
  | 'Romance'
  | 'Thriller'
  | 'Other';

export type AttributeType = 
  | 'wisdom'
  | 'curiosity'
  | 'empathy'
  | 'imagination'
  | 'focus'
  | 'creativity'
  | 'resilience';

export interface Attribute {
  name: AttributeType;
  value: number;
  maxValue: number;
  level: number;
  color: string;
  icon: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: Genre;
  themes: string[];
  dateAdded: Date;
  attributeImpact: Partial<Record<AttributeType, number>>;
  coverUrl?: string;
}

export interface ReadingSession {
  id: string;
  duration: number; // in seconds
  date: Date;
  attributeGains: Partial<Record<AttributeType, number>>;
}

export interface CharacterJournalEntry {
  id: string;
  date: Date;
  description: string;
  triggerBook?: Book;
  attributeChange?: AttributeType;
  evolutionLevel?: number;
}

export interface CharacterState {
  attributes: Record<AttributeType, Attribute>;
  totalBooksRead: number;
  totalReadingTime: number; // in seconds
  currentLevel: number;
  visualTraits: {
    baseColor: string;
    accessories: string[];
    aura: string;
  };
}

export interface OnboardingAnswers {
  favoriteGenres: Genre[];
  readingGoal: 'casual' | 'moderate' | 'avid';
  preferredAttributes: AttributeType[];
}
