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
  coverId: number;
  themes: string[];
  dateAdded: Date;
  attributeImpact: Partial<Record<AttributeType, number>>;
  coverUrl?: string;
}

export interface BookResult {
  key: string
  title: string
  author: string
  coverId: number | null
  firstPublishYear: number | null
  genre: Genre
  subjects: string[]
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

// ── Pet system (Option 2: stored companion) ──

export type PetStage = 'egg' | 'hatchling' | 'adult';

export interface PetTraits {
  /** Body type: 0=blob, 1=quadruped, 2=winged */
  bodyType: number;
  /** Primary color (hex) */
  primaryColor: string;
  /** Secondary color (hex) */
  secondaryColor: string;
  /** Markings: 0=none, 1=spots, 2=stripes */
  markingStyle: number;
  /** Eye style: 0=dot, 1=wide, 2=closed happy */
  eyeStyle: number;
  /** Accessory from dominant genre (e.g. tiny hat, scarf) — optional key */
  accessory: string | null;
}

export interface Pet {
  id: string;
  /** Deterministic identity; same seed = same base look */
  seed: string;
  name: string;
  stage: PetStage;
  traits: PetTraits;
  /** When this pet was first created */
  createdAt: Date;
  /** When stage or traits last changed */
  lastEvolvedAt: Date;
}
