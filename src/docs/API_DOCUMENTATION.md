# EZ Grades API Documentation

## Overview
EZ Grades uses Supabase as its backend, providing RESTful API endpoints, real-time subscriptions, authentication, and Edge Functions.

## Base Configuration

### Environment Variables
```bash
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Authentication Headers
```typescript
Authorization: Bearer <access_token>
apikey: <anon_key>
```

---

## Authentication Endpoints

### Sign Up
**Endpoint:** `POST /auth/v1/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "data": {
    "full_name": "John Doe",
    "username": "johndoe"
  }
}
```

**Response (Success):**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "John Doe",
      "username": "johndoe"
    }
  }
}
```

**Error Codes:**
- `400` - Invalid request (weak password, invalid email)
- `422` - Email already registered

---

### Sign In
**Endpoint:** `POST /auth/v1/token?grant_type=password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** Same as Sign Up

**Error Codes:**
- `400` - Invalid credentials
- `401` - Unauthorized

---

### Sign In with Google OAuth
**Endpoint:** `POST /auth/v1/authorize`

**Request Body:**
```json
{
  "provider": "google",
  "options": {
    "redirectTo": "https://your-app.com/auth/callback"
  }
}
```

**Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

**Flow:**
1. Redirect user to returned URL
2. User authenticates with Google
3. Google redirects to your callback URL with code
4. Exchange code for session token

---

### Password Reset Request
**Endpoint:** `POST /auth/v1/recover`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password recovery email sent"
}
```

---

### Update Password
**Endpoint:** `PUT /auth/v1/user`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "password": "NewSecurePassword123!"
}
```

**Response:**
```json
{
  "user": { /* user object */ }
}
```

---

### Sign Out
**Endpoint:** `POST /auth/v1/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Successfully signed out"
}
```

---

### Get Current User
**Endpoint:** `GET /auth/v1/user`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "user_metadata": {
    "full_name": "John Doe",
    "username": "johndoe"
  }
}
```

---

## Database API Endpoints

### Tasks

#### Get All Tasks
**Endpoint:** `GET /rest/v1/tasks`

**Headers:**
```
Authorization: Bearer <access_token>
apikey: <anon_key>
```

**Query Parameters:**
```
?user_id=eq.<user_id>&order=created_at.desc
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Complete homework",
    "description": "Math chapter 5",
    "completed": false,
    "priority": "high",
    "due_date": "2025-10-15T00:00:00Z",
    "created_at": "2025-10-09T10:00:00Z",
    "updated_at": "2025-10-09T10:00:00Z"
  }
]
```

#### Create Task
**Endpoint:** `POST /rest/v1/tasks`

**Request Body:**
```json
{
  "user_id": "uuid",
  "title": "Complete homework",
  "description": "Math chapter 5",
  "priority": "high",
  "due_date": "2025-10-15T00:00:00Z"
}
```

#### Update Task
**Endpoint:** `PATCH /rest/v1/tasks?id=eq.<task_id>`

**Request Body:**
```json
{
  "completed": true
}
```

#### Delete Task
**Endpoint:** `DELETE /rest/v1/tasks?id=eq.<task_id>`

---

### Notes

#### Get All Notes
**Endpoint:** `GET /rest/v1/notes`

**Query Parameters:**
```
?user_id=eq.<user_id>&order=created_at.desc
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Study Notes",
    "content": "Important concepts...",
    "category": "study",
    "tags": ["math", "algebra"],
    "created_at": "2025-10-09T10:00:00Z",
    "updated_at": "2025-10-09T10:00:00Z"
  }
]
```

#### Create Note
**Endpoint:** `POST /rest/v1/notes`

**Request Body:**
```json
{
  "user_id": "uuid",
  "title": "Study Notes",
  "content": "Important concepts...",
  "category": "study",
  "tags": ["math", "algebra"]
}
```

---

### Calendar Events

#### Get All Events
**Endpoint:** `GET /rest/v1/calendar_events`

**Query Parameters:**
```
?user_id=eq.<user_id>&start_time=gte.2025-10-01&end_time=lte.2025-10-31
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Math Exam",
    "description": "Final exam",
    "start_time": "2025-10-15T09:00:00Z",
    "end_time": "2025-10-15T11:00:00Z",
    "location": "Room 101",
    "color": "#7D4AE1",
    "created_at": "2025-10-09T10:00:00Z"
  }
]
```

#### Create Event
**Endpoint:** `POST /rest/v1/calendar_events`

**Request Body:**
```json
{
  "user_id": "uuid",
  "title": "Math Exam",
  "start_time": "2025-10-15T09:00:00Z",
  "end_time": "2025-10-15T11:00:00Z",
  "color": "#7D4AE1"
}
```

---

### Focus Sessions

#### Get Focus Sessions
**Endpoint:** `GET /rest/v1/focus_sessions`

**Query Parameters:**
```
?user_id=eq.<user_id>&order=created_at.desc&limit=10
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "duration_minutes": 25,
    "completed": true,
    "focus_type": "pomodoro",
    "subject": "Mathematics",
    "notes": "Focused well",
    "created_at": "2025-10-09T10:00:00Z"
  }
]
```

#### Create Focus Session
**Endpoint:** `POST /rest/v1/focus_sessions`

**Request Body:**
```json
{
  "user_id": "uuid",
  "duration_minutes": 25,
  "focus_type": "pomodoro",
  "subject": "Mathematics"
}
```

---

### Journal Entries

#### Get Journal Entries
**Endpoint:** `GET /rest/v1/journal_entries`

**Query Parameters:**
```
?user_id=eq.<user_id>&order=created_at.desc
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "entry_date": "2025-10-09",
    "content": "Had a productive study session today...",
    "mood": "happy",
    "stickers": [
      {
        "id": "sticker1",
        "x": 100,
        "y": 200,
        "emoji": "😊"
      }
    ],
    "created_at": "2025-10-09T20:00:00Z"
  }
]
```

---

### Music Playlists

#### Get Playlists
**Endpoint:** `GET /rest/v1/music_playlists`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Focus Beats",
    "description": "Instrumental music for deep focus",
    "is_public": true,
    "created_at": "2025-10-01T00:00:00Z"
  }
]
```

#### Get Tracks
**Endpoint:** `GET /rest/v1/music_tracks`

**Query Parameters:**
```
?playlist_id=eq.<playlist_id>&order=track_order.asc
```

**Response:**
```json
[
  {
    "id": "uuid",
    "playlist_id": "uuid",
    "title": "Focus Flow",
    "artist": "Study Beats",
    "duration_seconds": 180,
    "file_url": "https://storage.supabase.co/...",
    "track_order": 1
  }
]
```

---

### Ambient Sounds

#### Get Ambient Sounds
**Endpoint:** `GET /rest/v1/ambient_sounds`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Rain",
    "description": "Gentle rain sounds",
    "category": "nature",
    "file_url": "https://storage.supabase.co/...",
    "duration_seconds": 600,
    "is_loopable": true
  }
]
```

---

### Study Together Rooms

#### Get Active Rooms
**Endpoint:** `GET /rest/v1/study_rooms`

**Query Parameters:**
```
?is_active=eq.true&order=created_at.desc
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Math Study Group",
    "description": "Studying for finals",
    "host_user_id": "uuid",
    "subject": "Mathematics",
    "max_participants": 10,
    "current_participants": 3,
    "is_active": true,
    "created_at": "2025-10-09T10:00:00Z"
  }
]
```

#### Join Room
**Endpoint:** `POST /rest/v1/room_participants`

**Request Body:**
```json
{
  "room_id": "uuid",
  "user_id": "uuid"
}
```

---

## Edge Functions

### AI Chat Assistant
**Endpoint:** `POST /functions/v1/ai-chat`

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Explain photosynthesis"
    }
  ]
}
```

**Response:**
```json
{
  "response": "Photosynthesis is the process...",
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 120
  }
}
```

---

## Real-time Subscriptions

### Subscribe to Tasks Changes
```typescript
const subscription = supabase
  .channel('tasks-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Task changed:', payload);
    }
  )
  .subscribe();
```

### Subscribe to Study Room Participants
```typescript
const subscription = supabase
  .channel(`room-${roomId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'room_participants',
      filter: `room_id=eq.${roomId}`
    },
    (payload) => {
      console.log('Participant update:', payload);
    }
  )
  .subscribe();
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": "Additional context",
  "hint": "Suggestion to fix"
}
```

### Common Error Codes
- `PGRST116` - Row not found
- `PGRST106` - Table does not exist
- `23505` - Unique constraint violation
- `42501` - Permission denied (RLS)
- `22P02` - Invalid input syntax

---

## Rate Limiting

### Supabase Limits
- **API Requests:** 500 requests/second (Free tier)
- **Realtime Connections:** 200 concurrent (Free tier)
- **Storage:** 1GB (Free tier)
- **Database:** 500MB (Free tier)

### Best Practices
1. Implement client-side caching
2. Use batch operations when possible
3. Debounce frequent operations
4. Handle rate limit errors gracefully

---

## Security

### Row Level Security (RLS)
All tables have RLS policies enforcing:
- Users can only access their own data
- Public data (playlists, ambient sounds) is read-only
- Study rooms check participant membership

### API Key Safety
- Never expose service role key in frontend
- Use anon key for client-side requests
- RLS protects against unauthorized access

---

## Testing Endpoints

### Health Check
```bash
curl https://your-project.supabase.co/rest/v1/
```

### Test Authentication
```bash
curl -X POST https://your-project.supabase.co/auth/v1/token \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Test Database Query
```bash
curl https://your-project.supabase.co/rest/v1/tasks \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Client Library Usage

### Initialize Client
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Query with Filters
```typescript
const { data, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .eq('completed', false)
  .order('due_date', { ascending: true })
  .limit(10);
```

### Insert with Response
```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert({
    user_id: userId,
    title: 'New Task',
    priority: 'high'
  })
  .select()
  .single();
```

---

## Deployment Considerations

### Production Checklist
- [ ] Enable RLS on all tables
- [ ] Configure CORS for your domain
- [ ] Set up email templates (password reset, etc.)
- [ ] Configure OAuth providers
- [ ] Set up database backups
- [ ] Monitor API usage
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CDN for static assets
- [ ] Enable HTTPS only
- [ ] Review security policies

### Environment Setup
```bash
# Production
VITE_SUPABASE_URL=https://prod.supabase.co
VITE_SUPABASE_ANON_KEY=prod_anon_key

# Staging
VITE_SUPABASE_URL=https://staging.supabase.co
VITE_SUPABASE_ANON_KEY=staging_anon_key
```

---

**Last Updated:** October 9, 2025
**API Version:** v1
**Documentation Status:** ✅ Complete
