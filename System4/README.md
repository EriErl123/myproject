# Pulse

Cinematic personal work intelligence dashboard and DTR tracker for individual professionals. The UI blends premium glassmorphism, dark cinematic surfaces, and high-density productivity analytics.

## Features
- Dark, premium dashboard with glass panels, glow accents, and motion.
- Interactive activity heatmap with day selection.
- Analytics charts for weekly hours, clock-in trends, overtime, and productivity.
- Daily timeline and AI-style insight cards.
- Mood tracking summary and focus distribution.

## Tech Stack
- Vite + React + TypeScript
- TailwindCSS
- Framer Motion
- Recharts
- Supabase client stub

## Getting Started
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## GitHub Pages Deployment
This project is configured with `base: './'` so it works when hosted from a subpath.

1. Build the site:
```bash
npm run build
```

2. Deploy the `dist` folder using your preferred GitHub Pages method.
	- You can use the GitHub Pages UI and a workflow that publishes `dist`.
	- Or manually push `dist` to a `gh-pages` branch.

## Environment Variables
Create a .env file if you want to connect Supabase later:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
