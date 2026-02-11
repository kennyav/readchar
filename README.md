# ReadSelf: Character Evolution Through Reading

A mobile reading companion that transforms your reading habits into a living, evolving character. As you read different genres, topics, and styles, your character develops unique attributes, visual traits, and personality dimensions that reflect your literary journey.

## Features Implemented

### Core Components

1. **Onboarding Flow** (`src/components/onboarding/OnboardingFlow.tsx`)
   - 3-step onboarding process
   - Genre selection (up to 3)
   - Reading goal setting (casual/moderate/avid)
   - Preferred attributes selection (up to 3)

2. **Character System**
   - **CharacterAvatar** - Animated character display with breathing motion, level indicator, and visual accessories
   - **AttributeConstellation** - Radial orbital display of 7 core attributes with progress rings
   - **AttributeDetailDialog** - Deep dive into individual attributes showing contributing books and progress

3. **Reading Log**
   - **BookLogCard** - Elegant cards showing book details and attribute impacts
   - **AddBookDialog** - Manual book entry with title, author, and genre
   - **ReadingTimerDialog** - Focused reading session timer with pause/complete functionality

4. **Main Application** (`src/pages/ReadSelfApp.tsx`)
   - Tabbed interface: Character, Library, Stats
   - Character display with constellation and action buttons
   - Reading library with book history
   - Statistics dashboard with key metrics

### Character Engine (`src/lib/character-engine.ts`)

- 7 core attributes: Wisdom, Curiosity, Empathy, Imagination, Focus, Creativity, Resilience
- Genre-to-attribute mapping system
- Character leveling based on total attribute points
- Visual trait evolution (accessories, aura effects)
- Reading session point calculations
- Recommendation engine for balanced growth

### Design System

**Color Palette:**
- Background: Soft cream (#F9F6F1) with paper texture
- Character Base: Peachy-beige (#FFDAB9)
- Attribute Colors: Jewel tones (amethyst, sage, amber, rose quartz, sky blue, etc.)

**Typography:**
- Google Fonts integration: Fraunces, Newsreader, Manrope, JetBrains Mono
- Serif fonts for headers, clean sans-serif for UI

**Visual Effects:**
- Soft UI (Neumorphism) for character and interactive elements
- Smooth animations with Framer Motion
- Breathing idle animation for character
- Evolution celebration animations

### Data Persistence

- LocalStorage-based data persistence
- Stores character state, book log, and onboarding status
- Automatic save on state changes

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **ShadCN UI** components
- **Lucide React** icons
- **date-fns** for date formatting

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

## Application Flow

1. **First Time User**: Goes through onboarding flow to set preferences
2. **Main Hub**: Character display with attribute constellation
3. **Log Books**: Add books manually, system calculates attribute impacts
4. **Reading Sessions**: Timer-based focused reading for attribute points
5. **Character Evolution**: Visual changes at level milestones
6. **Recommendations**: Suggested genres based on underdeveloped attributes

## Architecture

```
src/
├── components/
│   ├── character/          # Character display components
│   ├── onboarding/         # Onboarding flow
│   ├── reading/            # Reading log and dialogs
│   └── ui/                 # ShadCN UI components
├── lib/
│   ├── character-engine.ts # Game logic and calculations
│   └── utils.ts            # Utility functions
├── pages/
│   └── ReadSelfApp.tsx     # Main application
└── types/
    └── reading.ts          # TypeScript interfaces

```

## Key Features

- ✅ Character avatar with level and visual evolution
- ✅ 7 attribute constellation with progress tracking
- ✅ Book logging with genre-based attribute impacts
- ✅ Reading session timer
- ✅ Attribute detail views
- ✅ Reading statistics dashboard
- ✅ Genre recommendations for balance
- ✅ Evolution animations
- ✅ LocalStorage persistence
- ✅ Responsive design
- ✅ Soft UI (Neumorphism) aesthetic

## Future Enhancements

- ISBN scanning for book entry
- Character journal narrative feed
- Social sharing of character cards
- Theme customization
- Reading streaks and achievements
- Integration with reading platforms (Goodreads, etc.)
