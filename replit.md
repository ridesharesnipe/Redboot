# Red Boot's Spelling Adventure

## Overview

Red Boot's Spelling Adventure is a pirate-themed spelling practice web application designed to help children memorize their weekly spelling lists through engaging treasure hunting adventures. The app features multiple pirate characters, progressive learning mechanics, photo-based word list extraction, and comprehensive progress tracking. Built as a full-stack TypeScript application with premium subscription features.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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