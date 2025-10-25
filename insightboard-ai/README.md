# InsightBoard AI

A smart dashboard for analyzing meeting transcripts, generating AI-powered action items, and visualizing progress.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key (or Google Gemini API key)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd insightboard-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/insightboard"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Provider (choose one)
OPENAI_API_KEY="your-openai-api-key"
# OR
GEMINI_API_KEY="your-gemini-api-key"
```

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to `http://localhost:3000`

## 🎯 Features

- **AI-Powered Analysis**: Upload meeting transcripts and get intelligent action items
- **Task Management**: Create, update, and track tasks with priority levels
- **Progress Visualization**: Interactive charts showing completion rates and priority distribution
- **User Authentication**: Secure sign-up and sign-in with NextAuth
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Dynamic dashboard with live data updates

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI GPT-4 / Google Gemini
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library

## 📱 Usage

1. **Sign Up**: Create a new account at `/auth/signup`
2. **Sign In**: Access your dashboard at `/auth/signin`
3. **Submit Transcripts**: Upload meeting transcripts for AI analysis
4. **Manage Tasks**: Create, update, and track action items
5. **View Analytics**: Monitor progress with interactive charts

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔧 Development

### Database Management
```bash
# Reset database (development only)
npx prisma migrate reset --force

# View database in Prisma Studio
npx prisma studio

# Generate new migration
npx prisma migrate dev --name your-migration-name
```

### Code Quality
```bash
# Run linting
npm run lint

# Format code
npm run format
```

## 📊 API Endpoints

- `POST /api/auth/[...nextauth]` - Authentication endpoints
- `GET /api/transcripts` - Fetch user transcripts
- `POST /api/transcripts` - Create new transcript
- `PUT /api/tasks/:id` - Update task status/priority
- `DELETE /api/tasks/:id` - Delete task


## 🔗 Live Demo

[View Live Application](https://sudhanshu-autonomix-ai-saas.vercel.app/)
