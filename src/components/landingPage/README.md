# Landing Page Components

This directory contains all the components specifically designed for the TheInfini AI landing page.

## Structure

```
landingPage/
├── Header/              # Navigation header with logo and menu
├── HeroSection/         # Main hero section with title and CTA
├── FeaturesSection/     # Features showcase with cards
├── AboutSection/        # About company and technology info
├── CTASection/          # Call-to-action section with demo
├── Footer/              # Site footer with links and newsletter
├── index.js             # Barrel export for clean imports
└── README.md            # This file
```

## Components Overview

### Header
- Fixed navigation bar
- Responsive mobile menu
- Smooth scrolling to sections
- Logo and CTA buttons

### HeroSection
- Centered layout with main messaging
- Feature highlights
- Primary call-to-action buttons
- Statistics display

### FeaturesSection
- Grid layout of feature cards
- Hover effects and animations
- Feature highlights with icons
- Secondary CTA section

### AboutSection
- Company information
- Technology stack showcase
- Statistics cards
- Mission and values

### CTASection
- Final call-to-action
- Interactive demo chat preview
- Trust indicators
- Feature benefits

### Footer
- Comprehensive site links
- Newsletter signup
- Social media links
- Legal and support links

## Usage

Import components individually:
```javascript
import Header from './Header/Header';
import HeroSection from './HeroSection/HeroSection';
```

Or use the barrel export for cleaner imports:
```javascript
import { Header, HeroSection, FeaturesSection } from '../components/landingPage';
```

## Styling

Each component has its own CSS file with:
- Component-specific styles
- Responsive design breakpoints
- Dark theme color variables
- Smooth animations and transitions

## Design System

All components follow the TheInfini AI design system:
- **Primary Color**: `#0a0a0a` (Deep black)
- **Accent Color**: `#fcd469` (Golden yellow)
- **Typography**: Inter font family
- **Spacing**: Consistent spacing units
- **Responsive**: Mobile-first approach
