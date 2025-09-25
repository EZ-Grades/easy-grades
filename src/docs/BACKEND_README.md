# EZ Grades Complete Backend Implementation

This document provides a comprehensive overview of the EZ Grades backend implementation using Supabase. The backend includes all necessary tables, relationships, API endpoints, and operations for the Break Mode, Dashboard, and Focus Mode features.

## Overview

The backend is built using:
- **Database**: PostgreSQL with Supabase
- **API Layer**: TypeScript service layer with full CRUD operations
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Type Safety**: Complete TypeScript type definitions
- **Testing**: Comprehensive test suite component

## Features Implemented

### 🎵 Break Mode - Tracks
- **Tables**: `tracks`, `user_play_history`, `user_volume_settings`
- **Features**: 
  - Track management with mood/genre filtering
  - Play history tracking
  - Volume controls
  - Music library with seeded content

### 📊 Dashboard
- **Tables**: `tasks`, `notes`, `weekly_goals`, `daily_sessions`
- **Features**:
  - Task management with CRUD operations
  - Notes system with full-text search capability
  - Weekly goals with progress tracking
  - Daily session statistics
  - Comprehensive analytics

### 🎯 Focus Mode
- **Tables**: `focus_sessions`, `ambient_sounds`, `user_ambient_settings`, `blocked_sites`, `user_settings`, `ambience_modes`
- **Features**:
  - Focus session tracking with timers
  - Ambient sound mixer
  - Distraction blocker
  - Environment themes
  - Session statistics and streaks

## Database Schema

### Core Tables

#### User Management
```sql
profiles              -- User profile information
chat_history         -- AI chat conversations
```

#### Break Mode
```sql
tracks               -- Music tracks library
user_play_history    -- Track play tracking
user_volume_settings -- Audio volume preferences
```

#### Dashboard
```sql
tasks                -- User task management
notes                -- Note-taking system
weekly_goals         -- Weekly study goals
daily_sessions       -- Daily activity tracking
```

#### Focus Mode
```sql
focus_sessions       -- Focus session tracking
ambient_sounds       -- Available ambient sounds
user_ambient_settings -- User sound preferences
blocked_sites        -- Distraction blocker sites
user_settings        -- Focus mode settings
ambience_modes       -- Environment themes
```

## Quick Start

### 1. Database Setup

Run the SQL schema file to set up all tables:

```bash
# In your Supabase SQL editor, run:
cat supabase/schema.sql
```

This will create:
- All required tables with proper relationships
- Row Level Security (RLS) policies
- Performance indexes
- Seed data for tracks, ambient sounds, and ambience modes

### 2. Environment Configuration

Ensure your Supabase configuration is set up in `/lib/supabase.ts`:

```typescript
const supabaseUrl = 'your-supabase-url'
const supabaseAnonKey = 'your-supabase-anon-key'
```

### 3. Using the Backend Service

Import and use the backend service in your components:

```typescript
import backendService from '../services/backendService';

// Example: Tasks
const tasks = await backendService.tasks.getUserTasks(userId);
const newTask = await backendService.tasks.addTask(userId, 'New task');

// Example: Focus Sessions
const session = await backendService.focusSessions.startSession(userId, 25);
const stats = await backendService.focusSessions.getSessionStats(userId);

// Example: Notes
const notes = await backendService.notes.getUserNotes(userId);
const newNote = await backendService.notes.addNote(userId, 'Title', 'Content');
```

## API Documentation

### Service Structure

The backend service is organized into modules:

```typescript
backendService = {
  tracks: {           // Music track operations
    getAllTracks(),
    getTrackById(),
    recordPlay(),
    getPlayHistory()
  },
  volume: {           // Volume settings
    getUserVolumeSettings(),
    updateVolumeSettings()
  },
  tasks: {            // Task management
    getUserTasks(),
    addTask(),
    updateTaskCompletion(),
    deleteTask(),
    getTaskStats()
  },
  notes: {            // Note management
    getUserNotes(),
    addNote(),
    updateNote(),
    deleteNote()
  },
  weeklyGoals: {      // Goal tracking
    getCurrentWeeklyGoal(),
    setWeeklyGoal(),
    updateProgress()
  },
  dailySessions: {    // Session tracking
    getTodaySession(),
    updateDailyStats(),
    getWeeklyStats()
  },
  focusSessions: {    // Focus mode
    startSession(),
    updateSessionProgress(),
    endSession(),
    getUserSessions(),
    getSessionStats()
  },
  ambientSounds: {    // Ambient audio
    getAllAmbientSounds(),
    getUserAmbientSettings(),
    toggleAmbientSound(),
    adjustVolume()
  },
  distractionBlocker: { // Website blocking
    getUserSettings(),
    updateSettings(),
    getBlockedSites(),
    addBlockedSite(),
    removeBlockedSite()
  },
  ambienceModes: {    // Environment themes
    getAllAmbienceModes(),
    getAmbienceModeById()
  }
}
```

### Response Format

All service methods return a consistent response format:

```typescript
// Success response
{
  success: true,
  data: any,
  error: null
}

// Error response  
{
  success: false,
  data: null,
  error: { message: string, code?: string }
}

// Query responses (for read operations)
{
  data: any[] | any,
  error: null | { message: string }
}
```

## Testing

### Backend Test Suite

A comprehensive test component is available at `/components/BackendTest.tsx`:

1. **Configuration Check**: Verifies Supabase setup
2. **Authentication Check**: Confirms user is logged in
3. **Individual Tests**: Test each service module
4. **Full Test Suite**: Runs all tests sequentially

### Running Tests

```typescript
// In development mode, the test component is visible
// Click "Run All Tests" to test all backend operations
// Individual module tests are also available
```

### Test Coverage

The test suite covers:
- ✅ Task CRUD operations
- ✅ Note management
- ✅ Weekly goal tracking
- ✅ Daily session statistics
- ✅ Focus session lifecycle
- ✅ Ambient sound settings
- ✅ Distraction blocker functionality
- ✅ Music track operations
- ✅ Volume settings

## Security

### Row Level Security (RLS)

All tables implement RLS policies that ensure:
- Users can only access their own data
- Public data (tracks, ambient sounds, ambience modes) is readable by all
- Proper authentication is required for all operations

### Example RLS Policies

```sql
-- Users can only see their own tasks
CREATE POLICY "Users can view own tasks" 
  ON tasks FOR SELECT USING (auth.uid() = user_id);

-- Users can only create tasks for themselves  
CREATE POLICY "Users can insert own tasks" 
  ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public data is viewable by everyone
CREATE POLICY "Tracks are viewable by everyone" 
  ON tracks FOR SELECT USING (true);
```

## Performance

### Indexes

The schema includes optimized indexes for:
- User-specific data queries (user_id columns)
- Time-based queries (created_at, start_time columns)  
- Status queries (completed, enabled columns)
- Search operations (text columns)

### Query Optimization

- All list queries include LIMIT clauses
- User-specific queries are indexed on user_id
- Time-based queries use appropriate date indexes
- Statistics queries are optimized for performance

## Data Relationships

### Entity Relationship Overview

```
Users (auth.users)
├── profiles (1:1)
├── tasks (1:many)
├── notes (1:many)
├── weekly_goals (1:many)
├── daily_sessions (1:many)
├── focus_sessions (1:many)
├── user_ambient_settings (1:many)
├── blocked_sites (1:many)
├── user_settings (1:1)
├── user_play_history (1:many)
└── user_volume_settings (1:1)

Public Data
├── tracks (read-only)
├── ambient_sounds (read-only)
└── ambience_modes (read-only)
```

## Migration and Deployment

### Database Migration

1. **Initial Setup**: Run the complete schema file
2. **Data Migration**: Import existing data if needed
3. **Seed Data**: Default tracks, sounds, and modes are included

### Environment Setup

Required environment variables:
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Troubleshooting

### Common Issues

1. **RLS Policies**: Ensure user is authenticated before making requests
2. **Foreign Key Constraints**: Verify related records exist before creating
3. **Unique Constraints**: Check for duplicate entries (e.g., weekly goals)
4. **Permission Errors**: Verify RLS policies are correctly configured

### Debug Tools

1. **Backend Test Component**: Use for comprehensive testing
2. **Supabase Dashboard**: Monitor queries and errors
3. **Browser Console**: Check for detailed error messages
4. **Network Tab**: Inspect API requests and responses

### Error Handling

```typescript
try {
  const result = await backendService.tasks.addTask(userId, title);
  if (!result.success) {
    console.error('Task creation failed:', result.error);
    // Handle error appropriately
  } else {
    console.log('Task created successfully:', result.data);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Contributing

### Adding New Features

1. **Update Schema**: Add new tables/columns in `schema.sql`
2. **Update Types**: Add TypeScript definitions in `types/database.ts`
3. **Create Service**: Add service methods in `services/backendService.ts`
4. **Add Tests**: Include test cases in `BackendTest.tsx`
5. **Update Documentation**: Document API examples and usage

### Code Standards

- Use TypeScript for all backend code
- Follow consistent error handling patterns
- Include proper type definitions
- Add comprehensive comments
- Write test cases for new features

## Support

For questions or issues:
1. Check the test suite for examples
2. Review the API documentation
3. Check Supabase dashboard for errors
4. Examine the browser console for debugging info

## License

This backend implementation is part of the EZ Grades application and follows the same license terms.