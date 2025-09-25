# EZ Grades Backend API Examples

This document provides examples of how to use the EZ Grades backend with SQL queries and REST API calls.

## Table of Contents

1. [Break Mode - Tracks](#break-mode---tracks)
2. [Dashboard - Tasks](#dashboard---tasks)
3. [Dashboard - Notes](#dashboard---notes)
4. [Dashboard - Weekly Goals](#dashboard---weekly-goals)
5. [Focus Mode - Sessions](#focus-mode---sessions)
6. [Focus Mode - Ambient Sounds](#focus-mode---ambient-sounds)
7. [Focus Mode - Distraction Blocker](#focus-mode---distraction-blocker)

## Break Mode - Tracks

### SQL Examples

```sql
-- Get all tracks ordered by name
SELECT * FROM tracks ORDER BY name;

-- Get tracks by mood
SELECT * FROM tracks WHERE mood = 'focus' ORDER BY name;

-- Get tracks by genre
SELECT * FROM tracks WHERE genre = 'lofi' ORDER BY created_at DESC;

-- Record a track play
INSERT INTO user_play_history (user_id, track_id)
VALUES ('user-uuid', 'track-uuid');

-- Get user's play history with track details
SELECT uph.*, t.name, t.mood, t.genre
FROM user_play_history uph
JOIN tracks t ON uph.track_id = t.id
WHERE uph.user_id = 'user-uuid'
ORDER BY uph.played_at DESC
LIMIT 50;

-- Get most played tracks for user
SELECT t.*, COUNT(uph.id) as play_count
FROM tracks t
JOIN user_play_history uph ON t.id = uph.track_id
WHERE uph.user_id = 'user-uuid'
GROUP BY t.id
ORDER BY play_count DESC
LIMIT 10;
```

### REST API Examples

```javascript
// Get all tracks
const { data: tracks } = await supabase
  .from('tracks')
  .select('*')
  .order('name');

// Get tracks by mood
const { data: focusTracks } = await supabase
  .from('tracks')
  .select('*')
  .eq('mood', 'focus')
  .order('name');

// Record play
await supabase
  .from('user_play_history')
  .insert({
    user_id: userId,
    track_id: trackId
  });

// Get play history
const { data: history } = await supabase
  .from('user_play_history')
  .select(`
    *,
    tracks (*)
  `)
  .eq('user_id', userId)
  .order('played_at', { ascending: false })
  .limit(50);
```

## Dashboard - Tasks

### SQL Examples

```sql
-- Get all tasks for a user
SELECT * FROM tasks 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC;

-- Create a new task
INSERT INTO tasks (user_id, title, completed)
VALUES ('user-uuid', 'Complete project', false);

-- Update task completion
UPDATE tasks 
SET completed = true, updated_at = NOW()
WHERE id = 'task-uuid' AND user_id = 'user-uuid';

-- Get task statistics
SELECT 
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN completed = true THEN 1 END) as completed_tasks,
  ROUND(
    COUNT(CASE WHEN completed = true THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as completion_percentage
FROM tasks 
WHERE user_id = 'user-uuid';

-- Delete completed tasks older than 30 days
DELETE FROM tasks 
WHERE user_id = 'user-uuid' 
  AND completed = true 
  AND updated_at < NOW() - INTERVAL '30 days';
```

### REST API Examples

```javascript
// Get user tasks
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Create task
const { data: newTask } = await supabase
  .from('tasks')
  .insert({
    user_id: userId,
    title: 'New task',
    completed: false
  })
  .select()
  .single();

// Update task
const { data: updatedTask } = await supabase
  .from('tasks')
  .update({ completed: true })
  .eq('id', taskId)
  .select()
  .single();

// Delete task
await supabase
  .from('tasks')
  .delete()
  .eq('id', taskId);
```

## Dashboard - Notes

### SQL Examples

```sql
-- Get all notes for a user
SELECT * FROM notes 
WHERE user_id = 'user-uuid' 
ORDER BY updated_at DESC;

-- Create a new note
INSERT INTO notes (user_id, title, content)
VALUES ('user-uuid', 'Meeting Notes', 'Important points from today...');

-- Update note content
UPDATE notes 
SET content = 'Updated content', updated_at = NOW()
WHERE id = 'note-uuid' AND user_id = 'user-uuid';

-- Search notes by content
SELECT * FROM notes 
WHERE user_id = 'user-uuid' 
  AND (title ILIKE '%search%' OR content ILIKE '%search%')
ORDER BY updated_at DESC;

-- Get recent notes (last 7 days)
SELECT * FROM notes 
WHERE user_id = 'user-uuid' 
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### REST API Examples

```javascript
// Get user notes
const { data: notes } = await supabase
  .from('notes')
  .select('*')
  .eq('user_id', userId)
  .order('updated_at', { ascending: false });

// Create note
const { data: newNote } = await supabase
  .from('notes')
  .insert({
    user_id: userId,
    title: 'New Note',
    content: 'Note content...'
  })
  .select()
  .single();

// Search notes
const { data: searchResults } = await supabase
  .from('notes')
  .select('*')
  .eq('user_id', userId)
  .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
  .order('updated_at', { ascending: false });

// Update note
const { data: updatedNote } = await supabase
  .from('notes')
  .update({
    title: 'Updated Title',
    content: 'Updated content'
  })
  .eq('id', noteId)
  .select()
  .single();
```

## Dashboard - Weekly Goals

### SQL Examples

```sql
-- Get current week's goal
SELECT * FROM weekly_goals 
WHERE user_id = 'user-uuid' 
  AND week_start_date = DATE_TRUNC('week', CURRENT_DATE)::date;

-- Create/update weekly goal
INSERT INTO weekly_goals (user_id, hours_goal, progress_hours, week_start_date)
VALUES ('user-uuid', 40, 0, DATE_TRUNC('week', CURRENT_DATE)::date)
ON CONFLICT (user_id, week_start_date) 
DO UPDATE SET hours_goal = EXCLUDED.hours_goal;

-- Update progress
UPDATE weekly_goals 
SET progress_hours = progress_hours + 2.5, updated_at = NOW()
WHERE user_id = 'user-uuid' 
  AND week_start_date = DATE_TRUNC('week', CURRENT_DATE)::date;

-- Get goal completion percentage
SELECT 
  hours_goal,
  progress_hours,
  ROUND((progress_hours / hours_goal) * 100, 2) as completion_percentage
FROM weekly_goals 
WHERE user_id = 'user-uuid' 
  AND week_start_date = DATE_TRUNC('week', CURRENT_DATE)::date;

-- Get historical weekly goals
SELECT * FROM weekly_goals 
WHERE user_id = 'user-uuid' 
ORDER BY week_start_date DESC 
LIMIT 12; -- Last 12 weeks
```

### REST API Examples

```javascript
// Get current weekly goal
const startOfWeek = new Date();
startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
const weekStart = startOfWeek.toISOString().split('T')[0];

const { data: goal } = await supabase
  .from('weekly_goals')
  .select('*')
  .eq('user_id', userId)
  .eq('week_start_date', weekStart)
  .single();

// Create/update weekly goal
const { data: updatedGoal } = await supabase
  .from('weekly_goals')
  .upsert({
    user_id: userId,
    hours_goal: 40,
    week_start_date: weekStart
  })
  .select()
  .single();

// Update progress
const { data: progressUpdate } = await supabase
  .from('weekly_goals')
  .update({ progress_hours: newProgressHours })
  .eq('user_id', userId)
  .eq('week_start_date', weekStart)
  .select()
  .single();
```

## Focus Mode - Sessions

### SQL Examples

```sql
-- Start a focus session
INSERT INTO focus_sessions (user_id, duration_minutes, start_time, ambience_mode, fullscreen)
VALUES ('user-uuid', 25, NOW(), 'Forest Retreat', true);

-- Update session progress
UPDATE focus_sessions 
SET completed_minutes = 15
WHERE id = 'session-uuid' AND user_id = 'user-uuid';

-- End session
UPDATE focus_sessions 
SET end_time = NOW(), completed = true, completed_minutes = 25
WHERE id = 'session-uuid' AND user_id = 'user-uuid';

-- Get user's focus sessions
SELECT * FROM focus_sessions 
WHERE user_id = 'user-uuid' 
ORDER BY start_time DESC 
LIMIT 50;

-- Get focus statistics
SELECT 
  COUNT(*) as total_sessions,
  SUM(completed_minutes) as total_focus_minutes,
  ROUND(AVG(completed_minutes), 2) as avg_session_length,
  COUNT(CASE WHEN fullscreen = true THEN 1 END) as fullscreen_sessions
FROM focus_sessions 
WHERE user_id = 'user-uuid' AND completed = true;

-- Calculate current streak
WITH daily_sessions AS (
  SELECT DATE(start_time) as session_date
  FROM focus_sessions 
  WHERE user_id = 'user-uuid' AND completed = true
  GROUP BY DATE(start_time)
  ORDER BY session_date DESC
),
streak_calculation AS (
  SELECT 
    session_date,
    ROW_NUMBER() OVER (ORDER BY session_date DESC) as row_num,
    (CURRENT_DATE - session_date) as days_ago
  FROM daily_sessions
)
SELECT COUNT(*) as current_streak
FROM streak_calculation 
WHERE days_ago = row_num - 1;

-- Get sessions by ambience mode
SELECT ambience_mode, COUNT(*) as usage_count
FROM focus_sessions 
WHERE user_id = 'user-uuid' AND completed = true
GROUP BY ambience_mode 
ORDER BY usage_count DESC;
```

### REST API Examples

```javascript
// Start focus session
const { data: session } = await supabase
  .from('focus_sessions')
  .insert({
    user_id: userId,
    duration_minutes: 25,
    start_time: new Date().toISOString(),
    ambience_mode: 'Forest Retreat',
    fullscreen: true
  })
  .select()
  .single();

// Update progress
const { data: updatedSession } = await supabase
  .from('focus_sessions')
  .update({ completed_minutes: 15 })
  .eq('id', sessionId)
  .select()
  .single();

// End session
const { data: completedSession } = await supabase
  .from('focus_sessions')
  .update({
    end_time: new Date().toISOString(),
    completed: true,
    completed_minutes: 25
  })
  .eq('id', sessionId)
  .select()
  .single();

// Get user sessions
const { data: sessions } = await supabase
  .from('focus_sessions')
  .select('*')
  .eq('user_id', userId)
  .order('start_time', { ascending: false })
  .limit(50);
```

## Focus Mode - Ambient Sounds

### SQL Examples

```sql
-- Get all ambient sounds
SELECT * FROM ambient_sounds ORDER BY name;

-- Get user's ambient sound settings
SELECT uas.*, as.name, as.icon
FROM user_ambient_settings uas
JOIN ambient_sounds as ON uas.ambient_sound_id = as.id
WHERE uas.user_id = 'user-uuid';

-- Enable/disable ambient sound
INSERT INTO user_ambient_settings (user_id, ambient_sound_id, enabled, volume)
VALUES ('user-uuid', 'sound-uuid', true, 60)
ON CONFLICT (user_id, ambient_sound_id) 
DO UPDATE SET enabled = EXCLUDED.enabled, volume = EXCLUDED.volume;

-- Get enabled sounds for user
SELECT as.*, uas.volume
FROM ambient_sounds as
JOIN user_ambient_settings uas ON as.id = uas.ambient_sound_id
WHERE uas.user_id = 'user-uuid' AND uas.enabled = true;

-- Adjust volume for specific sound
UPDATE user_ambient_settings 
SET volume = 75
WHERE user_id = 'user-uuid' AND ambient_sound_id = 'sound-uuid';
```

### REST API Examples

```javascript
// Get all ambient sounds
const { data: sounds } = await supabase
  .from('ambient_sounds')
  .select('*')
  .order('name');

// Get user settings with sound details
const { data: userSettings } = await supabase
  .from('user_ambient_settings')
  .select(`
    *,
    ambient_sounds (*)
  `)
  .eq('user_id', userId);

// Toggle ambient sound
const { data: setting } = await supabase
  .from('user_ambient_settings')
  .upsert({
    user_id: userId,
    ambient_sound_id: soundId,
    enabled: true,
    volume: 60
  })
  .select()
  .single();

// Adjust volume
const { data: updatedSetting } = await supabase
  .from('user_ambient_settings')
  .update({ volume: 75 })
  .eq('user_id', userId)
  .eq('ambient_sound_id', soundId)
  .select()
  .single();
```

## Focus Mode - Distraction Blocker

### SQL Examples

```sql
-- Get user settings
SELECT * FROM user_settings WHERE user_id = 'user-uuid';

-- Update blocker settings
INSERT INTO user_settings (user_id, distraction_block_enabled, show_blocked_sites)
VALUES ('user-uuid', true, true)
ON CONFLICT (user_id) 
DO UPDATE SET 
  distraction_block_enabled = EXCLUDED.distraction_block_enabled,
  show_blocked_sites = EXCLUDED.show_blocked_sites,
  updated_at = NOW();

-- Get blocked sites
SELECT * FROM blocked_sites 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC;

-- Add blocked site
INSERT INTO blocked_sites (user_id, url)
VALUES ('user-uuid', 'facebook.com');

-- Remove blocked site
DELETE FROM blocked_sites 
WHERE id = 'site-uuid' AND user_id = 'user-uuid';

-- Check if site is blocked
SELECT EXISTS(
  SELECT 1 FROM blocked_sites 
  WHERE user_id = 'user-uuid' AND url = 'facebook.com'
) as is_blocked;
```

### REST API Examples

```javascript
// Get user settings
const { data: settings } = await supabase
  .from('user_settings')
  .select('*')
  .eq('user_id', userId)
  .single();

// Update settings
const { data: updatedSettings } = await supabase
  .from('user_settings')
  .upsert({
    user_id: userId,
    distraction_block_enabled: true,
    show_blocked_sites: true
  })
  .select()
  .single();

// Get blocked sites
const { data: blockedSites } = await supabase
  .from('blocked_sites')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Add blocked site
const { data: newSite } = await supabase
  .from('blocked_sites')
  .insert({
    user_id: userId,
    url: 'facebook.com'
  })
  .select()
  .single();

// Remove blocked site
await supabase
  .from('blocked_sites')
  .delete()
  .eq('id', siteId);
```

## Using with the Service Layer

The backend service layer (`/services/backendService.ts`) provides convenient wrapper functions:

```javascript
import backendService from '../services/backendService';

// Examples using the service layer
const tasks = await backendService.tasks.getUserTasks(userId);
const newTask = await backendService.tasks.addTask(userId, 'New task');
const stats = await backendService.tasks.getTaskStats(userId);

const notes = await backendService.notes.getUserNotes(userId);
const goal = await backendService.weeklyGoals.getCurrentWeeklyGoal(userId);
const session = await backendService.focusSessions.startSession(userId, 25);
```

## Error Handling

Always handle errors appropriately:

```javascript
const result = await backendService.tasks.addTask(userId, title);
if (!result.success) {
  console.error('Error creating task:', result.error);
  // Handle error appropriately
} else {
  console.log('Task created:', result.data);
}
```

## Performance Tips

1. **Use indexes**: The schema includes performance indexes for common queries
2. **Limit results**: Always use LIMIT in queries that might return many rows
3. **Use select specific columns**: Only select the columns you need
4. **Batch operations**: Use batch inserts/updates when possible
5. **Cache frequently accessed data**: Consider caching user settings and preferences

## Security Notes

1. **Row Level Security (RLS)**: All tables have RLS policies that ensure users can only access their own data
2. **Input validation**: Always validate input on the client side
3. **Parameterized queries**: The service layer uses parameterized queries to prevent SQL injection
4. **Authentication**: All operations require a valid authenticated user