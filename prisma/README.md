# Database Seeding

This directory contains the database seed script for Epoch Pod.

## Running the Seed Script

The seed script populates your database with sample content across all three episode formats:

```bash
cd apps/web
npx prisma db seed
```

Or run it directly:

```bash
cd apps/web
npm run db:seed
```

## What Gets Created

The seed script creates:

### 🎤 Interviews (2)
- **Albert Einstein** - Discussing the Theory of Relativity, spacetime, and E=mc²
- **Cleopatra VII** - Exploring Egyptian politics, Roman diplomacy, and her reign

### ⚖️ Debates (2)
- **Napoleon Bonaparte: Tyrant or Reformer?** - Examining his legacy with two opposing perspectives
- **Christopher Columbus: Explorer or Colonizer?** - Debating the impact of 1492

### 🎮 Adventures (1)
- **The Roman Senator's Dilemma** - An 11-episode branching narrative set during the Ides of March (44 BCE)
  - 1 START node
  - 4 DECISION nodes
  - 2 STORY nodes
  - 4 ENDING nodes (victory, defeat, bittersweet, neutral)
  - Multiple paths leading to different historical outcomes

### 📊 Total Content
- **15 episodes** created
- **11 adventure nodes** with interconnected choices
- All episodes have `PUBLISHED` status and placeholder audio URLs

## Sample Content Details

### Interviews
Each interview includes:
- Host and guest with different AI voices
- Structured dialogue with intro/segments/outro
- Historical context and sources
- Topics designed to showcase the interview format

### Debates
Each debate includes:
- Clear opposing positions
- Structured arguments with opening statements, main points, and conclusions
- Topics designed to encourage user voting
- Ready for the voting and follow-up episode system

### Adventures
The Roman Senator adventure features:
- Complex decision tree with multiple branching paths
- Historically accurate scenarios from 44 BCE Rome
- 4 distinct endings based on player choices:
  - **Liberator**: Join the conspiracy and save the Republic
  - **Proscribed**: Oppose the Triumvirate and face death
  - **Exile**: Escape Rome but lose everything
  - **Imperial Senator**: Survive by serving the new Empire

## Note on Audio URLs

The seed script uses placeholder audio URLs (e.g., `https://placeholder-audio.com/...`). In a production environment, you would:

1. Generate actual audio using the AI generation endpoints:
   - `/api/generate/interview`
   - `/api/generate/debate`
   - `/api/generate/adventure`

2. Or run the seed script after setting up audio generation to create real audio files

## Resetting the Database

To clear all data and re-seed:

```bash
cd apps/web
npx prisma migrate reset
```

This will:
1. Drop the database
2. Recreate it
3. Run all migrations
4. Automatically run the seed script

## Testing Features

After seeding, you can test:

### Interview Features
- Visit `/episodes` to see Einstein and Cleopatra interviews
- Test the two-voice audio player
- View guest information and question previews

### Debate Features
- Visit debate episodes to see the voting interface
- Vote on Napoleon or Columbus debates (works for anonymous users)
- Check real-time voting statistics

### Adventure Features
- Visit `/adventures` to browse available adventures
- Start the Roman Senator adventure
- Make choices and see how they affect the story
- Experience different endings by making different choices

## Modifying Seed Data

To add or modify seed content, edit `prisma/seed.ts`:

- Add new interviews by creating `Episode` + `Interview` records
- Add new debates by creating `Episode` + `Debate` records
- Add new adventures by creating `Adventure` + `AdventureNode` + `Choice` records

Remember to follow the schema constraints:
- Adventures must have exactly 1 START node
- All nodes must be reachable from the START node
- ENDING nodes cannot have outgoing choices
- DECISION nodes must have at least 1 choice
