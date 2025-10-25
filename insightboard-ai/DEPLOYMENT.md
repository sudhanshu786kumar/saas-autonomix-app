# Deployment Guide

## Vercel Deployment (Recommended)

1. **Fork/Clone the repository**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Set Environment Variables**:
   ```
   OPENAI_API_KEY=your-openai-key
   ANTHROPIC_API_KEY=your-anthropic-key (optional)
   GOOGLE_API_KEY=your-google-key (optional)
   DATABASE_URL=your-postgresql-url
   NEXTAUTH_SECRET=your-random-secret
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

4. **Database Setup**:
   - Use Vercel Postgres, Supabase, or PlanetScale
   - Run migrations: `npx prisma migrate deploy`

5. **Deploy**: Vercel will automatically deploy on push to main

## Netlify Deployment

1. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**: Same as Vercel

3. **Database**: Use Supabase or external PostgreSQL

## Railway Deployment

1. **Connect GitHub repository**
2. **Add PostgreSQL service**
3. **Set environment variables**
4. **Deploy automatically**

## Environment Variables Required

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret for JWT signing
- `NEXTAUTH_URL`: Your app's URL

### Optional (for AI features)
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key  
- `GOOGLE_API_KEY`: Google Gemini API key

## Database Migration

After deployment, run:
```bash
npx prisma migrate deploy
npx prisma generate
```

## Testing Deployment

1. Visit your deployed URL
2. Sign up for a new account
3. Submit a test transcript
4. Verify action items are generated
5. Test task management features
