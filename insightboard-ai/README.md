# InsightBoard AI

A smart dashboard for analyzing meeting transcripts, generating AI-powered action items, and visualizing progress.

## Tech Stack
- Framework: `Next.js 16` (App Router, Turbopack)
- Language: `TypeScript`
- UI: `Tailwind CSS + Shadcn` (Radix UI)
- Auth: `NextAuth` with `PrismaAdapter`
- LLM: `OpenAI` (`gpt-4o-mini` via `openai` SDK)
- Database: `PostgreSQL` + `Prisma`
- Charts: `Recharts`

## Features (Level 1)
- Transcript submission via a multiline form
- AI generates action items with priority and tags
- Task list supports complete/delete and updates charts
- Progress visualization: pie (completion) and bar (priority)
- Clean, responsive UI

## Enhancements (Level 2)
- Filter and sort tasks (status, creation date, priority)
- Priority shown and editable in UI
- Stored in a real database with fields: id, text, status, priority, tags, timestamps

## Advanced (Level 3)
- Authentication added to protect dashboard routes
- Optional AI auto-tagging and sentiment analysis in analysis result

## Setup (Local)
1. Create `.env.local` with:
```
OPENAI_API_KEY=your-openai-key
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3001
```
2. Install and generate Prisma client:
```
npm install
npx prisma migrate dev --name init
```
3. Run dev server:
```
npx next dev -p 3001
```
4. Open `http://localhost:3000`.

## Usage
- Sign up at `Auth → Sign Up`
- Sign in with the created credentials
- Submit a transcript to auto-generate tasks
- Manually add tasks via the "Create Action Item" form
- Toggle completion and change priority from the task list

## Hosted Link
- Deployed URL:[https://sudhanshu-autonomix-ai-saas.vercel.app/](Vercel)

## Notes
- Secrets are not committed; use environment variables.
- Works from a fresh clone with minimal setup.
- Default DB reset for development: `npx prisma migrate reset --force`.

## Level Completed
- ✅ **Level 1**: Fully implemented (transcript submission, AI analysis, task management, progress visualization, modern UI, hosting)
- ✅ **Level 2**: Fully implemented (filtering/sorting, AI prioritization, bar charts, database integration)
- ✅ **Level 3**: Fully implemented (authentication, testing, AI auto-tagging, sentiment analysis, alternative LLM support)

## Testing
```bash
npm test          # Run tests
