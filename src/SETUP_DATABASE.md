# EZ Grades Database Setup

This guide will help you set up the EZ Grades database in your Supabase project.

## Quick Setup

1. **Go to your Supabase project dashboard**
   - Navigate to the SQL Editor in your Supabase dashboard
   - Create a new query

2. **Run the schema file**
   - Copy the entire contents of `/supabase/schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the schema

3. **Verify the setup**
   - Go to the Database → Tables section
   - You should see all the tables created:
     - `profiles`
     - `chat_history`
     - `tracks`
     - `user_play_history`
     - `user_volume_settings`
     - `tasks`
     - `notes`
     - `weekly_goals`
     - `daily_sessions`
     - `focus_sessions`
     - `ambient_sounds`
     - `user_ambient_settings`
     - `blocked_sites`
     - `user_settings`
     - `ambience_modes`

4. **Test the setup**
   - Use the Database Init component in the app (available in development mode)
   - This will populate the database with sample data

## What's Included

The schema includes:

### Break Mode Tables
- **tracks**: Background music and ambient tracks
- **user_play_history**: Track what users listen to
- **user_volume_settings**: User volume preferences

### Dashboard Tables
- **tasks**: User tasks and to-dos
- **notes**: User study notes
- **weekly_goals**: Weekly study hour goals
- **daily_sessions**: Daily study session tracking

### Focus Mode Tables
- **focus_sessions**: Focus session tracking
- **ambient_sounds**: Available ambient sounds
- **user_ambient_settings**: User ambient sound preferences
- **blocked_sites**: Distraction blocker URLs
- **user_settings**: User preferences
- **ambience_modes**: Available background environments

### Security
- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Public tables (like tracks, ambient_sounds) are read-only for users

### Sample Data
The schema includes sample data for:
- 5 background tracks
- 6 ambient sounds
- 6 ambience modes

## Troubleshooting

### Tables not showing up
- Make sure you ran the entire schema file
- Check the Supabase logs for any errors
- Verify you have the necessary permissions

### RLS errors
- The schema sets up proper Row Level Security
- Users can only access data they own
- Some tables are public read-only

### Missing data
- Use the Database Init component in the app
- This will add sample data if the tables are empty

## Manual Table Creation

If you prefer to create tables manually, here are the key commands:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create main tables (see schema.sql for complete structure)
-- Tables will be created with proper foreign keys and indexes
```

For the complete SQL schema, see `/supabase/schema.sql`.