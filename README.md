# InsightBoard AI

A smart dashboard for analyzing meeting transcripts, generating AI-powered action items, and visualizing progress.

## 📋 Project Information

- **GitHub Repository**: [https://github.com/sudhanshu786kumar/saas-autonomix-app](https://github.com/sudhanshu786kumar/saas-autonomix-app)
- **Live Application**: [https://sudhanshu-autonomix-ai-saas.vercel.app/](https://sudhanshu-autonomix-ai-saas.vercel.app/)
- **Completion Level**: ✅ **All Levels Completed** (Level 1, 2, and 3)
- **LLM Provider**: Google Gemini API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sudhanshu786kumar/saas-autonomix-app.git
cd saas-autonomix/insightboard-ai
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

# AI Provider
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

### Frontend & Framework
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Shadcn/ui components
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & Database
- **Authentication**: NextAuth.js v4 with Prisma Adapter
- **Database**: PostgreSQL with Prisma ORM v6
- **API Routes**: Next.js API routes with server actions
- **Password Hashing**: bcryptjs

### AI & Analytics
- **LLM Provider**: Google Gemini API
- **AI SDK**: @google/generative-ai
- **Charts & Visualization**: Recharts
- **Date Handling**: date-fns

### Development & Testing
- **Testing Framework**: Jest + React Testing Library
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript
- **Package Manager**: npm

### Deployment & Infrastructure
- **Hosting**: Vercel
- **Database**: PostgreSQL (hosted)
- **Environment**: Production-ready with environment variables
- **CI/CD**: Automated deployment via Vercel

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

## 📊 Project Completion Status

### ✅ Level 1 - Core Features
- [x] Transcript submission via multiline form
- [x] AI-powered action item generation with priority and tags
- [x] Task list with complete/delete functionality
- [x] Progress visualization (pie charts for completion, bar charts for priority)
- [x] Clean, responsive UI with modern design

### ✅ Level 2 - Enhanced Features
- [x] Advanced filtering and sorting (status, creation date, priority)
- [x] Priority management with editable UI controls
- [x] Comprehensive database integration with proper schema
- [x] Enhanced analytics with multiple chart types
- [x] Real-time data updates and state management

### ✅ Level 3 - Advanced Features
- [x] Complete authentication system with NextAuth.js
- [x] Comprehensive test suite with Jest and React Testing Library
- [x] AI auto-tagging and sentiment analysis
- [x] Alternative LLM support (Google Gemini)
- [x] Production-ready deployment with Vercel
- [x] Database migrations and proper data modeling
