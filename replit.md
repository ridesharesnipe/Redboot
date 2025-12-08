# Red Boot's Spelling Adventure

## Overview

Red Boot's Spelling Adventure is a pirate-themed spelling practice web application designed to help children memorize their weekly spelling lists through engaging treasure hunting adventures. The app features multiple pirate characters, progressive learning mechanics, photo-based word list extraction, and comprehensive progress tracking. Built as a full-stack TypeScript application with premium subscription features.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### December 8, 2025 - Parent Analytics Dashboard
- **Apple-Inspired Design**: Minimalist analytics page at /analytics with clean white background, subtle shadows, and modern typography
- **Stats Overview Cards**: Four stat cards displaying accuracy, sessions, time spent, and treasures collected with colored icons
- **Weekly Activity Chart**: Recharts AreaChart showing 7-day practice history with gradient fill and smooth tooltips
- **Word Mastery Ring**: SVG progress ring showing percentage of words mastered vs learning
- **Tricky Words Section**: Lists active tricky words with mistake counts and correct streaks
- **This Week's Words**: Displays current word list with practice count and best score
- **Recent Sessions Timeline**: Shows last 5 practice sessions with character icons, scores, and timestamps
- **API Endpoint**: GET /api/analytics returns aggregated stats, daily progress, word mastery, recent activity, tricky words, and current week data
- **Dashboard Integration**: "Parent Insights" card added to ParentDashboard with "View Insights" button navigating to /analytics
- **Database Enhancement**: Added practiceCount column to users table for tracking total practice sessions

### December 8, 2025 - 2025 Visual Enhancements
- **Badge Sparkle Effects**: Earned badges now have continuous shimmer animations with CSS pseudo-elements, legendary badges get special star orbit effects
- **Page Transitions**: App.tsx wrapped routes in page-enter animation class for smooth fade-in/scale transitions between pages
- **Dashboard Card Hover Effects**: Bento grid cards now float up on hover with colored glow effects (gold for treasures, green for progress, purple for tricky words)
- **Character Idle Animations**: Red Boot and Diego characters have breathing and sway animations on landing page for lifelike presence
- **Treasure Sparkle Effects**: Treasures on dashboard and vault display sparkle and glow animations, vault treasure piles have rotating sparkle decorations
- **New CSS Classes**: badge-sparkle, badge-particles, badge-legendary-sparkle, page-enter, bento-hover-float, bento-hover-gold/green/purple, character-idle-breathe, character-idle-sway, treasure-sparkle, treasure-glow

### December 8, 2025 - Comprehensive Responsive Design Overhaul (Extended)
- **Landing Page**: Island emoji (16rem → 6rem base), compass icon (4rem → text-4xl responsive), character cards (w-56 → w-40 base)
- **Parent Dashboard**: Red Boot image (w-96 → w-48 base), bento grid cards with responsive padding
- **PhotoCapture Component**: Word count display, anchor icon, and card content with sm:/md: breakpoints
- **Photo Capture Page**: Title, icons, celebration elements all responsive with mobile-first sizing
- **FridayTestSimulator**: Trophy emoji (text-8xl → text-5xl base), celebration text responsive
- **SpellingMemoryGame**: Feedback phase emoji and text headings responsive
- **Game Component Responsive Heights**: SeaMonsterBattle and TreasureRoad converted from fixed 500-700px heights to responsive min-h-[50vh] md:min-h-[60vh] lg:min-h-[700px]
- **Scaled Emojis & Characters**: Sea monsters, palm trees, boats, and characters use responsive text sizing (text-5xl sm:text-6xl md:text-8xl) to scale across devices
- **Responsive Spelling Input**: SimplePractice input area uses clamp() for fluid font-size (24px to 48px), letter-spacing, and border width
- **Mobile CSS Utilities**: Added game-specific breakpoints at 480px and 768px in index.css with .game-container, .game-emoji-lg/xl, .game-character classes
- **Treasure Display Optimization**: Treasure collection shows max 12 items on mobile with "+X" indicator for remaining
- **Responsive Patterns**: Tailwind mobile-first approach with sm:/md:/lg: breakpoints, inline clamp() for continuous scaling

### December 7, 2025 - UI Modernization with 2025 Design Trends
- **Bento Grid Layout**: Dashboard reorganized into modular grid boxes for stats, word list, practice button, and treasure preview
- **Aurora Background**: Soft moving ocean-themed color gradients with CSS animations (--aurora-color-1/2/3 custom properties)
- **Claymorphism Styling**: Soft 3D tactile feel for all cards and buttons using clay-card and clay-button classes
  - Cards: Multi-layered shadows, subtle borders, 1px/2px transforms on hover
  - Buttons: 3D pressed effects with transform on click, gradient highlights
- **Micro-Interactions**: Enhanced button animations including micro-bounce, sparkle-hover, pulse-glow, and icon-bounce effects
- **shadcn Button Components**: All buttons converted to use shadcn Button component with consistent hover/disabled behavior
- **data-testid Coverage**: Every interactive element has descriptive data-testid attributes for testing
- **Friday Take Test Button**: Restored "Take Test" CTA that appears when readyForTest is true on Fridays

### October 5, 2025 - Atmospheric Sound Effects Integration
- **Seagull Sounds on Splash Screen**: Ambient seagull calls play on the first-time visitor splash screen (plays at 0s and 5s during 10-second countdown)
- **Seagull Sounds on Landing Page**: Periodic seagull calls every 15-25 seconds (randomized) for pirate harbor atmosphere with proper timer cleanup on navigation
- **Harbor Waves on Photo Upload**: Dock/harbor water ambience plays on photo capture page for immersive pirate dock experience
- **Audio Files**: seagull-sound-effect-272695.mp3 and amb_harbor_waves-24587.mp3 integrated via AudioContext playAudioFile()
- **Technical Implementation**: Uses refs for timer management with proper cleanup to prevent audio leaks, browser-compatible TypeScript types

### October 3, 2025 - 3D Sea Monster Battle Enhancements
- **3D Perspective System**: Added CSS 3D perspective (1200px) to battle container with transformStyle: 'preserve-3d' for depth effects
- **3D Rolling Waves**: Ocean waves now use rotateX and translateZ animations to create waves rolling toward viewer
  - Three wave layers with varying rotation angles (-2° to 2°, -1° to 1°) and Z-depth movement
  - Enhanced opacity and shadows for realistic depth perception
- **3D Rocking Boat**: Diego's pirate boat animates with multi-axis rotation
  - rotateX (-8° to 8°), rotateY (-6° to 6°), rotateZ (-4° to 4°), and translateZ (0 to 15px)
  - Different animation durations (2.8s to 4.2s) create realistic ocean bobbing
  - Enhanced drop shadows for 3D depth
- **Technical Implementation**: Proper preserve-3d propagation through parent elements ensures all 3D transforms render correctly

### October 2, 2025 - Treasure Vault System & Escalating Rewards
- **Escalating Treasure Rewards**: Practice now awards increasing treasures - first 3 words get 5 each, next 3 get 10, next 3 get 15, final words get 25 treasures each
- **Treasure Vault Page**: New dedicated vault page with animated treasure chests for both Red Boot and Diego
  - Glass morphism design with glowing effects and particle animations
  - Click-to-open animated chest with character-specific sounds (Red Boot says "Arrr, me treasure!", Diego barks)
  - Chest upgrades: Wooden → Silver (50+) → Gold (200+) → Legendary (500+)
  - Separate treasure counts for each character across 6 types (diamonds, coins, crowns, bags, stars, trophies)
- **Database Treasure Tracking**: Added 12 new columns to users table to track treasures by type for both characters
- **Treasure Distribution**: Treasures automatically distributed evenly across all 6 types and saved to database after each practice session
- **Navigation**: Golden "Treasure Vault" button added to landing page with treasure chest sound effect

### October 2, 2025 - Treasure Map Visual Enhancements
- **Glass Morphism Palm Trees**: Increased palm tree size to text-8xl (matching sea monster scale) with glass morphism styling (rgba backgrounds, backdrop-filter blur, white borders) and floating animations
- **Sand Mounds**: Added amber gradient sand mounds under X marks for buried treasure effect
- **Enhanced Digging Animation**: Upgraded to 12 smoke particles and 15 dirt particles with enhanced shadows and glowing effects
- **Bigger Red Boot Character**: Scaled Red Boot to w-28 h-28 (matching Diego's size) with enhanced border and shadow
- **Treasure Chest Animation**: Animated treasure chest appears when digging completes, lid rotates open with gold lock detail and glow effect
- **Glass Morphism Treasures**: Treasures fly out of chest with 1080deg spinning animation, landing in collection area with continuous spin effect
- **Flying Seagulls**: Added 4 animated seagulls flying across treasure map at different heights with pointer-events-none
- **Red Boot Voice Line**: Added "Arrr, me treasure!" pirate voice line (British accent, rate 0.75, pitch 0.9) triggered when chest opens

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with custom pirate-themed design system including character fonts (Pirata One, Fredoka One)

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect for seamless social login
- **Session Management**: Express sessions with PostgreSQL session store

### Game Engine Components
- **Memory Training**: Spaced repetition system for word memorization with learning phases (study → recall → feedback)
- **Character System**: Pirate characters including Red Boot (the brave captain) and Diego the Pup Pup (his loyal first mate) with unique personalities
- **Progress Tracking**: Comprehensive analytics including accuracy rates, time spent, weekly streaks, and mastery levels
- **Test Simulation**: Friday test simulator with realistic timing and parent voice recording features

### Data Architecture
- **User Management**: Parent accounts with multiple child profiles
- **Word Lists**: Weekly spelling lists with JSON storage for words and metadata
- **Progress System**: Detailed tracking of learning sessions, test results, and character unlocks
- **Session Storage**: Secure session management with automatic cleanup

### Premium Features Architecture
- **Free Tier**: Red Boot character only, one word list per week
- **Premium Tier**: All four characters, unlimited word lists, advanced progress analytics
- **Subscription Management**: Stripe integration for payment processing and subscription lifecycle

## External Dependencies

### Payment Processing
- **Stripe**: Payment gateway for subscription management with webhook integration for subscription lifecycle events

### Database Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket connections for optimal performance
- **Drizzle Kit**: Database migrations and schema management

### Authentication Services
- **Replit Auth**: OAuth 2.0 / OpenID Connect integration supporting Google, GitHub, Apple, X (Twitter), and email/password logins
- **Login Flow**: Users click "Start Adventure" on landing page and are redirected to Replit Auth login page

### Media Processing
- **Web Speech API**: Text-to-speech for word pronunciation and speech recognition for voice commands
- **Camera API**: Photo capture functionality for extracting spelling words from physical documents

### Development Tools
- **Replit Platform**: Integrated development environment with cartographer and dev banner plugins
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### UI Component Libraries
- **Radix UI**: Accessible, unstyled component primitives for complex UI elements (dialogs, dropdowns, forms)
- **Lucide React**: Consistent icon library for UI elements
- **Class Variance Authority**: Type-safe component variant management