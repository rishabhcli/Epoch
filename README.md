# Epoch Pod

**AI-powered historical storytelling in multiple immersive formats.**

Epoch Pod is a multi-format history platform that generates personalized podcast content through AI. Experience history through narrative podcasts, interviews with historical figures, interactive debates, and choose-your-own-adventure stories. All delivered via email and RSS feeds compatible with Apple Podcasts and other podcast apps.

## Features

### 🎭 Multiple Episode Formats
- **Narrative Podcasts**: Traditional 5-act storytelling with citations and sources
- **Historical Interviews**: AI-powered conversations with figures like Einstein, Cleopatra, and Ada Lovelace
- **Interactive Debates**: Two-sided arguments on controversial topics with real-time voting
- **Choose Your Own Adventure**: Branching narrative journeys where your choices shape history

### 🤖 AI-Powered Generation
- **Multi-Voice Audio**: 2-3 different AI voices for interviews and debates
- **Structured Outputs**: Zod-validated schemas ensure consistent quality
- **Historical Accuracy**: Built-in citation and source tracking
- **Branching Narratives**: Complex decision trees with path validation

### 📧 Delivery & Distribution
- **Email Delivery**: Beautiful HTML emails with React Email components and RFC 8058 one-click unsubscribe
- **RSS Feeds**: Standards-compliant feeds with Podcasting 2.0 transcript tags
- **Personalization**: Per-user topics, voice preferences, and delivery cadence
- **Apple Podcasts Ready**: Byte-range support, proper enclosures, and validated feeds

### 🎨 User Experience
- **Interactive Voting**: Vote on debates and unlock follow-up episodes based on community results
- **Journey Tracking**: Adventures remember your progress across sessions
- **SEO Optimized**: JSON-LD structured data, dynamic OG images, and comprehensive metadata
- **Accessibility**: Full transcripts and WCAG 2.1 AA compliance

## Architecture

### Monorepo Structure

```
apps/
  web/                 # Next.js App Router application
    app/
      (marketing)/     # Public marketing pages
      dashboard/       # User dashboard
      episodes/        # Episode pages
      api/
        rss/           # RSS feed endpoints
        generate/      # Episode generation
        webhooks/      # Email webhooks
    lib/               # Core libraries
    components/        # React components
    emails/            # React Email templates

packages/
  schema/              # Zod schemas for structured outputs
  agent/               # AI agent toolkit (optional)

prisma/                # Database schema and migrations
```

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Auth.js (NextAuth v5)
- **Email**: Resend + React Email
- **Storage**: Vercel Blob
- **AI**: OpenAI (GPT-4 + TTS)
- **TTS**: OpenAI TTS / ElevenLabs
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript + Zod

## Getting Started

### Prerequisites

- Node.js 18.17+
- PostgreSQL database
- OpenAI API key
- (Optional) ElevenLabs API key
- (Optional) Resend API key

### Quick Start (Recommended)

We provide setup scripts that handle installation, database migration, and sample data in one command:

**Linux/macOS:**
```bash
git clone https://github.com/risban933/Epoch.git
cd Epoch
./scripts/setup-dev.sh
```

**Windows:**
```bash
git clone https://github.com/risban933/Epoch.git
cd Epoch
scripts\setup-dev.bat
```

This will:
1. Install all dependencies
2. Run database migrations
3. Seed sample content (2 interviews, 2 debates, 1 adventure with 11 episodes)
4. Provide next steps for running the dev server

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/risban933/Epoch.git
cd Epoch
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/epochpod"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

4. Initialize the database:
```bash
cd apps/web
npx prisma migrate dev
npx prisma generate
```

5. (Optional) Seed sample data:
```bash
npx prisma db seed
```

6. Start the development server:
```bash
cd ../..
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Sample Content

After seeding, you'll have access to:
- **Interviews**: Albert Einstein on Relativity, Cleopatra on Egyptian Politics
- **Debates**: Napoleon (Tyrant or Reformer?), Columbus (Explorer or Colonizer?)
- **Adventures**: Roman Senator's Dilemma (11-episode branching narrative)

## Development

### Database

```bash
# Push schema changes (development)
npm run db:push

# Create a migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy!

Vercel automatically:
- Builds the Next.js app
- Provisions Vercel Blob storage
- Enables byte-range requests for audio
- Configures serverless functions

### RSS Feed

After deployment, your RSS feed will be available at:
- Public feed: `https://your-domain.com/api/rss`
- Private feeds: `https://your-domain.com/api/rss/[userId]?token=...`

### Apple Podcasts Submission

1. Validate your feed at https://podba.se/validate/
2. Ensure artwork meets Apple's specs (square, 1400x1400 minimum)
3. Submit via Apple Podcasts Connect
4. Wait for approval (typically 1-3 days)

## Content Generation Pipeline

### Narrative Podcasts
1. **Outline**: AI drafts 5-act narrative structure with citations
2. **Script**: Expands outline into 1,200-1,800 word narration
3. **Audio**: TTS converts script to MP3 with proper metadata
4. **Storage**: Uploads to Blob storage with byte-range support
5. **Publish**: Updates RSS feed and sends email notifications

### Historical Interviews
1. **Outline**: AI generates guest biography, questions, and context
2. **Script**: Creates dialogue between host and historical figure
3. **Audio**: Multi-voice TTS with different voices for host and guest
4. **Storage**: Uploads audio with metadata
5. **Publish**: Makes available with interactive transcript

### Interactive Debates
1. **Outline**: AI researches topic and formulates both positions
2. **Script**: Generates structured arguments with evidence
3. **Audio**: Three-voice generation (moderator + 2 debaters)
4. **Storage**: Uploads with voting metadata
5. **Publish**: Enables voting and follow-up episode unlocking

### Choose Your Own Adventure
1. **Outline**: AI creates branching narrative tree with 8-12 nodes
2. **Validation**: Ensures all paths are valid and reachable
3. **Scripts**: Generates individual scripts for each node
4. **Audio**: Creates separate audio files for all nodes
5. **Storage**: Uploads all episodes with connection metadata
6. **Publish**: Enables journey tracking and choice selection

## Email Compliance

Epoch Pod follows best practices for email deliverability:

- ✅ SPF, DKIM, and DMARC authentication
- ✅ `List-Unsubscribe` header (RFC 2369)
- ✅ `List-Unsubscribe-Post` one-click (RFC 8058)
- ✅ Bounce and complaint handling via webhooks
- ✅ Gmail/Yahoo 2024 bulk sender requirements

## Accessibility

- Full transcripts on episode pages
- Downloadable transcript files
- Keyboard-accessible audio player
- ARIA labels and semantic HTML
- WCAG 2.1 AA compliance

## Project Status

### ✅ Completed (Phases 1-9)

**Phase 1: Project Scaffolding**
- [x] Next.js 15 App Router with TypeScript
- [x] Monorepo structure (apps/web, packages/schema, packages/agent)
- [x] Prisma schema with 16 models (expanded from 6)
- [x] Zod schemas for structured AI outputs
- [x] ESLint, Prettier, Tailwind CSS configuration

**Phase 2: Authentication & Database**
- [x] Auth.js (NextAuth v5) with Prisma adapter
- [x] Email magic link authentication via Resend
- [x] Protected dashboard with middleware
- [x] Session management (JWT strategy)
- [x] Auth pages (signin, signout, verify-request, error)

**Phase 3: AI Content Generation (Narrative)**
- [x] OpenAI integration with structured outputs
- [x] Outline generator (5-act narrative structure)
- [x] Script expansion service (1,200-1,800 words)
- [x] TTS adapter abstraction (OpenAI TTS + ElevenLabs)
- [x] Audio generation with streaming support
- [x] Episode generation orchestrator

**Phase 4: Storage & Media Hosting**
- [x] Vercel Blob integration
- [x] Audio upload service with metadata tracking
- [x] Byte-range (HTTP 206) support verification
- [x] Automatic CDN caching

**Phase 5: RSS Feed Generation**
- [x] RSS 2.0 feed builder with iTunes tags
- [x] Podcasting 2.0 transcript tags
- [x] Public feed endpoint (/api/rss)
- [x] Private personalized feeds (/api/rss/[userId])
- [x] Feed validation utilities
- [x] Apple Podcasts compliance

**Phase 6: Email Delivery System**
- [x] React Email templates (episode notification, digest)
- [x] Email service with RFC 8058 one-click unsubscribe
- [x] Webhook handlers for bounces/complaints
- [x] Email event tracking
- [x] Resend integration with proper headers
- [x] Auto-unsubscribe on hard bounce/complaint

**Phase 7: Frontend UI & UX**
- [x] Public episodes list page
- [x] Individual episode page with transcript
- [x] Dashboard episodes management
- [x] Accessible audio player with keyboard controls
- [x] User preferences page (topics, voice, cadence)
- [x] Private RSS feed URL management
- [x] Responsive design with dark mode

**Phase 8: SEO & Metadata**
- [x] JSON-LD structured data (PodcastSeries, PodcastEpisode, Organization, Website)
- [x] Dynamic sitemap.xml with all published episodes
- [x] robots.txt with podcast crawler allowlist
- [x] Dynamic OG image generation for episodes (Next.js ImageResponse)
- [x] Root-level OG image for homepage
- [x] Enhanced Metadata API with OpenGraph and Twitter Cards
- [x] Breadcrumb navigation schema

**Phase 9: Multi-Format Content (NEW!)**
- [x] **Historical Figure Interviews**
  - [x] Interview schema and database models
  - [x] Multi-voice interview generation (2 voices: host + guest)
  - [x] Interview-specific audio generation
  - [x] InterviewPlayer component with dialogue display
  - [x] Interview creation UI (/dashboard/interviews/new)
  - [x] API endpoint (/api/generate/interview)

- [x] **Interactive Historical Debates**
  - [x] Debate schema and database models
  - [x] Three-voice debate generation (moderator + 2 debaters)
  - [x] Voting system (authenticated + anonymous)
  - [x] Real-time vote statistics API
  - [x] Follow-up episode unlocking based on votes
  - [x] DebatePlayer component with voting UI
  - [x] Debate creation UI (/dashboard/debates/new)
  - [x] API endpoints (/api/generate/debate, /api/debates/vote, /api/debates/[id]/stats)

- [x] **Choose Your Own Adventure**
  - [x] Adventure schema with branching node system
  - [x] 4 node types (START, DECISION, STORY, ENDING)
  - [x] Adventure generation with path validation
  - [x] Journey tracking across sessions
  - [x] AdventurePlayer component with choice selection
  - [x] Adventure catalog and detail pages (/adventures)
  - [x] Adventure creation UI (/dashboard/adventures/new)
  - [x] API endpoints (/api/generate/adventure, /api/adventures/[id]/start, /api/adventures/journey/[id]/choose)

- [x] **Universal Episode System**
  - [x] EpisodeType enum (NARRATIVE, INTERVIEW, DEBATE, ADVENTURE)
  - [x] Type-based conditional rendering
  - [x] Automatic journey creation for adventures
  - [x] 10 new database models
  - [x] 11 new API endpoints
  - [x] 7 new UI components

- [x] **Developer Experience**
  - [x] Database seed script with sample content
  - [x] Quick-start setup scripts (Linux/macOS/Windows)
  - [x] Comprehensive documentation (FEATURE_PLANS.md, IMPLEMENTATION_STATUS.md, prisma/README.md)
  - [x] 15 pre-built sample episodes (2 interviews, 2 debates, 11 adventure nodes)

### 📋 Upcoming (Phases 10-14)
- [ ] Background jobs (Vercel Cron for scheduled generation)
- [ ] Testing infrastructure (Jest, Playwright, E2E tests)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Security hardening (CSP headers, RBAC)
- [ ] Apple Podcasts submission
- [ ] AI Agent toolkit (optional)
- [ ] Social sharing features
- [ ] Analytics dashboard
- [ ] User-generated content moderation

### 📊 Statistics
- **Total Files Created**: 115+
- **Lines of Code**: ~23,500+
- **Commits**: 14+
- **Database Models**: 16 (from 6)
- **API Endpoints**: 28+ (from 17)
- **UI Components**: 15+ (from 8)
- **Phases Completed**: 9 of 14 (64%!)

## Contributing

This is currently a personal project, but suggestions and feedback are welcome!

## License

See [LICENSE](LICENSE) file for details.

---

Built with ❤️ for history enthusiasts everywhere.
