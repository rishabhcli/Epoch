# Database Schema Updates for Production Readiness

## Overview

Add generation tracking fields to support background job processing and progress tracking.

## Required Schema Changes

### 1. Add Generation Status to Episode Model

```prisma
model Episode {
  // ... existing fields ...

  // Generation tracking (NEW)
  generationStatus   GenerationStatus @default(PENDING)
  generationJobId    String?
  generationError    String?          @db.Text
  generationProgress Int              @default(0) // 0-100
  generationStartedAt DateTime?
  generationCompletedAt DateTime?

  // ... existing relations ...

  @@index([generationJobId])
  @@index([generationStatus, createdAt])
}

enum GenerationStatus {
  PENDING               // Job created, not started
  GENERATING_OUTLINE    // Creating content outline
  GENERATING_SCRIPT     // Writing the script
  GENERATING_AUDIO      // Creating audio files
  UPLOADING             // Uploading to storage
  COMPLETED             // Successfully finished
  FAILED                // Generation failed
}
```

### 2. Add Generation Metrics Table (Optional - for cost tracking)

```prisma
model GenerationMetrics {
  id              String   @id @default(cuid())
  episodeId       String
  type            EpisodeType
  gpt4TokensUsed  Int
  ttsCharsUsed    Int
  estimatedCost   Float
  actualDuration  Int      // seconds to generate
  createdAt       DateTime @default(now())

  episode         Episode  @relation(fields: [episodeId], references: [id], onDelete: Cascade)

  @@index([episodeId])
  @@index([type, createdAt])
}
```

### 3. Add Audio Cache Table (Optional - for cost optimization)

```prisma
model AudioCache {
  id              String   @id @default(cuid())
  cacheKey        String   @unique
  audioUrl        String
  audioBytes      BigInt
  mimeType        String   @default("audio/mpeg")
  parameters      Json     // Store generation parameters
  usageCount      Int      @default(1)
  createdAt       DateTime @default(now())
  lastUsedAt      DateTime @default(now())

  @@index([cacheKey])
  @@index([lastUsedAt])
}
```

## Migration Steps

### Step 1: Create Migration File

```bash
cd apps/web
npx prisma migrate dev --name add_generation_tracking
```

### Step 2: Review Generated Migration

The migration will be created in `prisma/migrations/`. Review it before applying.

### Step 3: Apply Migration

```bash
npx prisma migrate deploy
```

### Step 4: Update Prisma Client

```bash
npx prisma generate
```

## Update Existing Episodes (Optional)

If you have existing episodes, you may want to update them:

```sql
-- Set existing episodes to COMPLETED status
UPDATE "Episode"
SET "generationStatus" = 'COMPLETED',
    "generationProgress" = 100
WHERE "status" = 'PUBLISHED' AND "audioUrl" IS NOT NULL;
```

## Testing the Migration

```typescript
// Test creating an episode with new fields
const episode = await prisma.episode.create({
  data: {
    // ... standard fields ...
    generationStatus: 'PENDING',
    generationJobId: 'test-job-123',
    generationProgress: 0,
    generationStartedAt: new Date(),
  }
});

// Test updating generation progress
await prisma.episode.update({
  where: { id: episode.id },
  data: {
    generationStatus: 'GENERATING_AUDIO',
    generationProgress: 75,
  }
});

// Test querying by status
const pending = await prisma.episode.findMany({
  where: {
    generationStatus: 'PENDING',
  }
});
```

## Rollback Plan

If you need to rollback this migration:

```bash
# Reset to previous migration
npx prisma migrate resolve --rolled-back <migration_name>

# Or drop the columns manually
ALTER TABLE "Episode" DROP COLUMN "generationStatus";
ALTER TABLE "Episode" DROP COLUMN "generationJobId";
ALTER TABLE "Episode" DROP COLUMN "generationError";
ALTER TABLE "Episode" DROP COLUMN "generationProgress";
ALTER TABLE "Episode" DROP COLUMN "generationStartedAt";
ALTER TABLE "Episode" DROP COLUMN "generationCompletedAt";
```

## Impact Assessment

- **Breaking Changes**: None (all new fields are optional or have defaults)
- **Performance Impact**: Minimal (new indexes may slightly slow writes, significantly improve reads)
- **Storage Impact**: ~100 bytes per episode
- **Deployment Risk**: Low (backward compatible)

## Next Steps

1. Apply this migration
2. Update API routes to set these fields
3. Implement background job workers
4. Add progress tracking UI

## References

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Database Indexes](https://www.prisma.io/docs/concepts/components/prisma-schema/indexes)
