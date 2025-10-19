# Study Together Feature - Implementation Guide

## Overview
The Study Together feature enables real-time collaborative study sessions with multiple participants. Users can create or join study rooms, participate in synchronized focus sessions, chat with each other, and collaborate on a shared drawing canvas.

## Features Implemented

### 1. Room Management (Create / Join / Share)
- **Create Room**: Users can create public or private study rooms with custom names
- **Join Room**: Users can join rooms by entering a 6-character room code
- **Browse Rooms**: Public rooms are listed for easy discovery
- **Room Codes**: Each room gets a unique, shareable 6-character code
- **Room Themes**: Support for customizable room themes (default: forest)

### 2. Participant Management
- **Real-time Participant List**: See all users currently in the room
- **Online Status**: Visual indicators showing who's online/offline
- **Participant Status**: Track whether users are studying, on break, or away
- **Study Time Tracking**: Display total study time for each participant
- **Host Badge**: Visual indicator showing the room host

### 3. Session Control (Pomodoro / Focus / Break)
- **Shared Timer**: Synchronized timer visible to all participants
- **Session Types**:
  - Pomodoro (25 minutes)
  - Focus (50 minutes)
  - Break (5 minutes)
- **Host Controls**: Only the room host can start/stop sessions
- **Real-time Sync**: Timer syncs across all participants in real-time
- **System Messages**: Automatic chat notifications when sessions start/stop

### 4. Chat & Reactions
- **Real-time Chat**: Persistent text chat for all room members
- **System Messages**: Automatic notifications for room events (joins, leaves, sessions)
- **Quick Reactions**: One-click emoji reactions (👍, 💪, 🎉, ☕)
- **Message Types**: Support for user messages, system messages, and reactions
- **User Identification**: Each message shows the sender's name

### 5. Collaborative Drawing Canvas
- **Shared Canvas**: Real-time collaborative drawing space
- **Participant Counter**: Shows number of active participants
- **Drawing Tools**: Basic drawing capabilities (integrated via CollaborativeCanvas component)
- **Real-time Updates**: Canvas changes sync across all participants

### 6. Personal Playlist (Coming Soon)
- User-specific music playlists
- Not shared with other participants
- Independent playback controls

### 7. Access Control & Privacy
- **Public Rooms**: Discoverable by all users
- **Private Rooms**: Access via invite code only
- **RLS Policies**: Row-level security ensures data privacy
- **Host Permissions**: Special controls for room hosts

### 8. Distraction Detection
- Infrastructure in place for tracking:
  - Tab switches
  - Return to tab
  - Inactive periods
- Logs focus events for later analysis

## Database Schema

### Tables Created
1. **study_rooms** - Room information and settings
2. **room_participants** - Active participants in each room
3. **room_sessions** - Shared timer sessions
4. **room_chat_messages** - Chat history
5. **user_playlists** - Personal playlists (per user)
6. **playlist_tracks** - Tracks in playlists
7. **canvas_sessions** - Canvas state per room
8. **canvas_strokes** - Individual drawing strokes
9. **room_ambient_settings** - Room-wide ambient sound settings
10. **focus_events** - Distraction detection logs
11. **room_access** - Access control for rooms

### Key Features
- Cascade deletes when rooms are deleted
- Row-level security (RLS) on all tables
- Real-time subscriptions via Supabase Realtime
- Optimistic UI updates

## API Service Layer

### File: `/services/studyTogetherService.ts`

Key functions:
- `createRoom()` - Create a new study room
- `getRooms()` - Get available public rooms
- `getRoom()` - Get specific room details
- `getRoomByCode()` - Find room by code
- `joinRoom()` - Join a room
- `leaveRoom()` - Leave a room
- `getRoomParticipants()` - Get all participants
- `startSession()` - Start a shared timer session
- `stopSession()` - Stop the active session
- `getActiveSession()` - Get current running session
- `sendChatMessage()` - Send a chat message
- `getChatMessages()` - Retrieve chat history
- `getCanvasSession()` - Get/create canvas session
- `updateCanvasData()` - Update canvas state
- `logFocusEvent()` - Log distraction events
- `subscribeToRoom()` - Real-time subscriptions

## Custom Hook

### File: `/hooks/useStudyTogetherRoom.ts`

Provides a complete interface for managing room state:
```typescript
const {
  room,                  // Current room data
  participants,          // List of participants
  currentSession,        // Active timer session
  chatMessages,          // Chat history
  canvasSession,         // Canvas state
  loading,               // Loading state
  error,                 // Error messages
  isHost,                // Whether current user is host
  joinRoom,              // Join room function
  leaveRoom,             // Leave room function
  startSession,          // Start timer
  stopSession,           // Stop timer
  sendMessage,           // Send chat message
  updateStatus,          // Update participant status
  logFocusEvent,         // Log focus event
  updateCanvas,          // Update canvas
  reloadData,            // Reload all data
} = useStudyTogetherRoom(roomId);
```

## Real-time Features

The system uses Supabase Realtime to provide instant updates:

1. **Participant Updates**: Automatically updates when users join/leave
2. **Chat Messages**: New messages appear instantly
3. **Session Changes**: Timer starts/stops sync immediately
4. **Canvas Updates**: Drawing changes propagate in real-time

## Usage Flow

### Creating a Room
1. Click "Create Room" button
2. Enter room name
3. Choose public or private
4. Room is created with unique code
5. Creator automatically joins as host

### Joining a Room
1. Option A: Browse public rooms list and click "Join"
2. Option B: Click "Join by Code" and enter 6-character code
3. User is added to participants
4. System message announces join
5. Full room interface is displayed

### Starting a Study Session (Host Only)
1. Choose session type (Pomodoro/Focus/Break)
2. Timer starts and syncs to all participants
3. System message announces session start
4. Timer counts down in real-time
5. Completion triggers success message

### Chatting
1. Type message in chat input
2. Press Enter or click Send
3. Message appears for all participants
4. Use reaction buttons for quick responses

### Leaving a Room
1. Click "Leave Room" button
2. Participant status updated
3. System message announces departure
4. Returns to room list

## Environment Requirements

- Supabase project with configured tables
- Run the schema migrations in `/supabase/schema.sql`
- Realtime enabled on all study_together tables
- Authentication configured

## Future Enhancements

### Short Term
- [ ] Complete personal playlist functionality
- [ ] Room themes with visual customization
- [ ] Ambient sounds integration
- [ ] Enhanced canvas tools (colors, brush sizes)

### Medium Term
- [ ] Voice chat integration
- [ ] Screen sharing for study groups
- [ ] Breakout rooms for pair programming
- [ ] Study goals and progress tracking
- [ ] Room analytics and insights

### Long Term
- [ ] AI-powered study recommendations
- [ ] Integration with calendar and tasks
- [ ] Gamification and achievements
- [ ] Mobile app for on-the-go studying
- [ ] Integration with external tools (Notion, Google Docs, etc.)

## Troubleshooting

### Room not loading
- Check browser console for errors
- Verify Supabase connection
- Ensure RLS policies are correctly configured

### Real-time updates not working
- Verify Realtime is enabled in Supabase dashboard
- Check browser console for subscription errors
- Ensure network connection is stable

### Can't join room
- Verify room code is correct (6 characters)
- Check if room is private and requires invitation
- Ensure user is authenticated

## Contributing

When adding new features to Study Together:
1. Update database schema if needed
2. Add service functions to `studyTogetherService.ts`
3. Update the custom hook if state management is affected
4. Add real-time subscriptions for new data
5. Update this documentation

## Related Files

- `/components/pages/StudyTogetherRoomNew.tsx` - Main UI component
- `/services/studyTogetherService.ts` - API service layer
- `/hooks/useStudyTogetherRoom.ts` - State management hook
- `/supabase/schema.sql` - Database schema
- `/components/CollaborativeCanvas.tsx` - Drawing canvas component
