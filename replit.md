# Red Boot's Spelling Adventure

## Overview

Red Boot's Spelling Adventure is a pirate-themed web application designed to help children learn spelling through engaging treasure-hunting adventures. It offers progressive learning, photo-based word list extraction, and comprehensive progress tracking. The application is built as a full-stack TypeScript application with premium subscription features, aiming to make spelling practice fun and effective for children while providing valuable insights for parents.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite.
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack Query (React Query) for server state management and caching.
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS.
- **Styling**: Tailwind CSS with a custom pirate-themed design system using character fonts (Pirata One, Fredoka One).
- **UI/UX Decisions**:
    - Bento Grid Layout for dashboards with Aurora Background (soft moving ocean-themed gradients).
    - Claymorphism Styling for cards and buttons, providing a soft 3D tactile feel.
    - Micro-Interactions: Enhanced button animations (micro-bounce, sparkle-hover, pulse-glow, icon-bounce).
    - Comprehensive Responsive Design: Mobile-first approach using Tailwind's `sm:/md:/lg:` breakpoints and `clamp()` for fluid scaling of elements, games, and text.
    - Visual Enhancements: Badge sparkle effects, smooth page transitions, dashboard card hover effects, character idle animations, treasure sparkle effects.
    - 3D Enhancements: Sea Monster Battle features 3D perspective, rolling waves, and a rocking boat. Treasure Map includes glass morphism palm trees, sand mounds, enhanced digging animations, and animated treasure chests.

### Backend Architecture
- **Runtime**: Node.js with Express.js server.
- **Language**: TypeScript with ES modules.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations.
- **Authentication**: Email/password authentication using `bcryptjs` for password hashing and `jsonwebtoken` for JWT sessions.
- **Session Management**: Express sessions with PostgreSQL session store.

### Game Engine Components
- **Memory Training**: Spaced repetition system with learning phases (study, recall, feedback).
- **Character System**: Pirate characters (Red Boot, Diego the Pup Pup) with unique personalities.
- **Progress Tracking**: Analytics including accuracy rates, time spent, weekly streaks, and mastery levels.
- **Test Simulation**: Friday test simulator with realistic timing and parent voice recording features.
- **Treasure Vault System**: Escalating treasure rewards, a dedicated vault page with animated chests that upgrade based on treasure count, and character-specific treasure tracking.

### Data Architecture
- **User Management**: Parent accounts supporting multiple child profiles.
- **Word Lists**: Weekly spelling lists with JSON storage.
- **Progress System**: Detailed tracking of learning sessions, test results, and character unlocks.
- **Session Storage**: Secure session management.

### Premium Features Architecture
- **Free Tier**: Red Boot character only, one word list per week.
- **Premium Tier**: All four characters, unlimited word lists, advanced analytics.

## External Dependencies

### Payment Processing
- **Stripe**: Payment gateway for subscription management and webhooks.
- **Pricing** (live Stripe Price IDs, product: `prod_UBaIgdIbncWBiW`):
  - Annual: `price_1TDD7kIKeiiO81plM6B0Qr6E` — $39.96/year ($3.33/mo)
  - Monthly: `price_1TDD7kIKeiiO81pl2nj2Idxz` — $6.87/month
  - Abandonment offer: `price_1TDD7kIKeiiO81plWbH5mvUP` — $23.88/year ($1.99/mo, no trial)
- **Env vars needed**: `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ABANDONMENT`

### Database Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle Kit**: Database migrations and schema management.

### Authentication Services
- **Replit Auth**: OAuth 2.0 / OpenID Connect integration for social logins (Google, GitHub, Apple, X).
- **SendGrid**: (Optional) For email delivery in password reset functionality.

### Media Processing
- **Web Speech API**: Text-to-speech for word pronunciation and speech recognition.
- **Camera API**: Photo capture functionality for word extraction.

### Native Mobile (Capacitor)
- **Capacitor 7**: Wraps the web app for iOS and Android deployment.
- **Plugins**: `@capacitor/camera`, `@capacitor/splash-screen`, `@capacitor/status-bar`, `@capacitor/keyboard`.

### Development Tools
- **Replit Platform**: Integrated development environment.
- **ESBuild**: Fast bundling for production.
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer.

### UI Component Libraries
- **Radix UI**: Accessible, unstyled component primitives.
- **Lucide React**: Icon library.
- **Class Variance Authority**: Type-safe component variant management.