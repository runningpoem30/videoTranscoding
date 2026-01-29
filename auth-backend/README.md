# Zylar Transcoder - Authentication Backend

This is the authentication backend for Zylar video transcoding platform, built with Express, Prisma, and PostgreSQL.

## Features

- **Email/Password Authentication** - Traditional signup and signin
- **Google OAuth** - Continue with Google
- **JWT Tokens** - Secure session management
- **User Video Management** - Save and retrieve CloudFront URLs per user
- **PostgreSQL Database** - Reliable data storage with Prisma ORM

## Setup Instructions

### 1. Install Dependencies

```bash
cd auth-backend
npm install
```

### 2. Set Up PostgreSQL Database

You have several options:

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb zylar_transcoder
```

#### Option B: Use a Cloud Provider (Recommended for Production)
- **Neon** (https://neon.tech) - Free tier available
- **Supabase** (https://supabase.com) - Free tier available
- **Railway** (https://railway.app) - Free tier available

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/zylar_transcoder?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
PORT=3001
```

### 4. Run Prisma Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start Development Server

```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### POST `/api/auth/signin`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/google`
```json
{
  "credential": "google-id-token"
}
```

#### GET `/api/auth/verify`
Headers: `Authorization: Bearer <token>`

### Videos

#### GET `/api/videos`
Get all videos for authenticated user
Headers: `Authorization: Bearer <token>`

#### POST `/api/videos`
Save a new video
Headers: `Authorization: Bearer <token>`
```json
{
  "originalFileName": "video.mp4",
  "originalFileSize": 125000000,
  "cloudfrontUrl": "https://d3qk5a8a9f1q78.cloudfront.net/processed/video/master.m3u8",
  "status": "completed"
}
```

#### DELETE `/api/videos/:id`
Delete a video
Headers: `Authorization: Bearer <token>`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized JavaScript origins:
   - `http://localhost:5173`
   - Your production domain
6. Copy the Client ID to `.env`

## Deployment to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Create `vercel.json`
Already included in the project.

### 3. Deploy
```bash
vercel
```

### 4. Set Environment Variables
In Vercel dashboard, add:
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`

## Database Schema

### User Model
- `id` - Unique identifier
- `email` - User email (unique)
- `password` - Hashed password (null for OAuth users)
- `name` - User display name
- `googleId` - Google OAuth ID (unique)
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Video Model
- `id` - Unique identifier
- `userId` - Foreign key to User
- `originalFileName` - Original uploaded file name
- `originalFileSize` - File size in bytes
- `cloudfrontUrl` - CloudFront HLS master playlist URL
- `status` - Processing status (processing, completed, failed)
- `createdAt` - Upload timestamp
- `updatedAt` - Last update timestamp

## Development

### View Database
```bash
npm run prisma:studio
```

### Create New Migration
```bash
npx prisma migrate dev --name your_migration_name
```

## Security Notes

- Always use HTTPS in production
- Change `JWT_SECRET` to a strong random string
- Use environment variables for all secrets
- Enable CORS only for trusted origins
- Implement rate limiting for production

## Troubleshooting

### Prisma Client Not Found
```bash
npm run prisma:generate
```

### Database Connection Issues
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify database exists
- Check firewall/network settings

### Port Already in Use
Change `PORT` in `.env` file
