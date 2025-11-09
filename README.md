# Epoch Pod

**Personalized history podcasts delivered to your inbox.**

Epoch Pod is an AI-powered platform that generates narrative podcast episodes about historical topics and delivers them via email and RSS feeds that work seamlessly with Apple Podcasts and other podcast apps.

## Features

- **AI-Generated Content**: Structured 5-act narratives with citations and sources
- **Text-to-Speech**: High-quality audio with OpenAI TTS and ElevenLabs support
- **Email Delivery**: Beautiful HTML emails with React Email components and RFC 8058 one-click unsubscribe
- **RSS Feeds**: Standards-compliant feeds with Podcasting 2.0 transcript tags
- **Personalization**: Per-user topics, voice preferences, and delivery cadence
- **Accessibility**: Full transcripts and WCAG 2.1 AA compliance
- **Apple Podcasts Ready**: Byte-range support, proper enclosures, and validated feeds

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

### Installation

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
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env` with your configuration:
```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-with-openssl-rand-base64-32"
OPENAI_API_KEY="sk-..."
RESEND_API_KEY="re_..."
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

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

1. **Outline**: AI drafts 5-act narrative structure with citations
2. **Script**: Expands outline into 1,200-1,800 word narration
3. **Audio**: TTS converts script to MP3 with proper metadata
4. **Storage**: Uploads to Blob storage with byte-range support
5. **Publish**: Updates RSS feed and sends email notifications

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

### ✅ Completed (Phase 1)
- [x] Next.js 15 App Router setup
- [x] Monorepo structure (apps/web, packages/*)
- [x] TypeScript strict mode
- [x] Prisma schema design
- [x] Zod schemas for structured outputs
- [x] Basic UI scaffolding

### 🚧 In Progress (Phase 2)
- [ ] Auth.js implementation
- [ ] Database migrations
- [ ] User preferences UI

### 📋 Upcoming
- [ ] AI content generation pipeline
- [ ] TTS integration
- [ ] RSS feed builder
- [ ] Email templates
- [ ] Apple Podcasts submission

## Contributing

This is currently a personal project, but suggestions and feedback are welcome!

## License

See [LICENSE](LICENSE) file for details.

---

Built with ❤️ for history enthusiasts everywhere.
