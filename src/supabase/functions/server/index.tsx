import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client for server operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Health check endpoint
app.get("/make-server-4faddd75/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// User signup endpoint
app.post("/make-server-4faddd75/auth/signup", async (c) => {
  try {
    const { email, password, fullName } = await c.req.json();

    if (!email || !password || !fullName) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        full_name: fullName,
        username: fullName.split(' ')[0] || 'Scholar'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      user: data.user,
      message: "User created successfully"
    });
  } catch (err) {
    console.error('Server error during signup:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Chat endpoint for AI interactions
app.post("/make-server-4faddd75/chat", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { message } = await c.req.json();
    
    if (!message) {
      return c.json({ error: "Message is required" }, 400);
    }

    // Get Perplexity API key from environment
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      return c.json({ error: "AI service not configured" }, 503);
    }

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are EZ Grades AI, a helpful study assistant. Provide concise, accurate, and educational responses to help students learn effectively. Focus on explanations, study tips, and academic guidance.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error:', response.status, await response.text());
      return c.json({ error: "AI service temporarily unavailable" }, 503);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response at this time.";

    // Save chat history
    try {
      await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          message,
          response: aiResponse
        });
    } catch (historyError) {
      console.error('Error saving chat history:', historyError);
      // Continue even if history save fails
    }

    return c.json({ response: aiResponse });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get chat history
app.get("/make-server-4faddd75/chat/history", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: history, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching chat history:', error);
      return c.json({ error: "Failed to fetch chat history" }, 500);
    }

    return c.json({ history: history || [] });
  } catch (err) {
    console.error('Chat history endpoint error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// User preferences and settings endpoints
app.get("/make-server-4faddd75/user/preferences", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get user preferences from KV store
    const preferences = await kv.get(`user_preferences:${user.id}`);
    
    return c.json({ 
      preferences: preferences || {
        theme: 'light',
        notifications: true,
        study_reminders: true,
        break_reminders: true,
        focus_sounds: true,
        volume: 0.5
      }
    });
  } catch (err) {
    console.error('Get preferences error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/make-server-4faddd75/user/preferences", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const preferences = await c.req.json();
    
    // Save preferences to KV store
    await kv.set(`user_preferences:${user.id}`, preferences);
    
    return c.json({ success: true, preferences });
  } catch (err) {
    console.error('Save preferences error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Study sessions tracking
app.post("/make-server-4faddd75/study/session", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Allow anonymous sessions for guest users
    let userId = 'guest';
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user?.id) {
        userId = user.id;
      }
    }

    const { duration, type, completed } = await c.req.json();
    
    if (!duration || !type) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Save session to KV store
    const sessionData = {
      duration,
      type,
      completed: completed || false,
      timestamp: new Date().toISOString()
    };

    // Get existing sessions
    const sessions = await kv.get(`study_sessions:${userId}`) || [];
    sessions.push(sessionData);
    
    // Keep only last 100 sessions
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    
    await kv.set(`study_sessions:${userId}`, sessions);
    
    return c.json({ success: true, session: sessionData });
  } catch (err) {
    console.error('Save study session error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.get("/make-server-4faddd75/study/sessions", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Allow anonymous sessions for guest users
    let userId = 'guest';
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user?.id) {
        userId = user.id;
      }
    }

    const sessions = await kv.get(`study_sessions:${userId}`) || [];
    
    return c.json({ sessions });
  } catch (err) {
    console.error('Get study sessions error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Task management
app.get("/make-server-4faddd75/tasks", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Allow anonymous tasks for guest users
    let userId = 'guest';
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user?.id) {
        userId = user.id;
      }
    }

    const tasks = await kv.get(`tasks:${userId}`) || [];
    
    return c.json({ tasks });
  } catch (err) {
    console.error('Get tasks error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/make-server-4faddd75/tasks", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Allow anonymous tasks for guest users
    let userId = 'guest';
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user?.id) {
        userId = user.id;
      }
    }

    const { title, description, priority, due_date } = await c.req.json();
    
    if (!title) {
      return c.json({ error: "Title is required" }, 400);
    }

    const newTask = {
      id: crypto.randomUUID(),
      title,
      description: description || '',
      priority: priority || 'medium',
      due_date: due_date || null,
      completed: false,
      created_at: new Date().toISOString()
    };

    // Get existing tasks
    const tasks = await kv.get(`tasks:${userId}`) || [];
    tasks.push(newTask);
    
    await kv.set(`tasks:${userId}`, tasks);
    
    return c.json({ success: true, task: newTask });
  } catch (err) {
    console.error('Create task error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.put("/make-server-4faddd75/tasks/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Allow anonymous tasks for guest users
    let userId = 'guest';
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user?.id) {
        userId = user.id;
      }
    }

    const taskId = c.req.param('id');
    const updates = await c.req.json();
    
    // Get existing tasks
    const tasks = await kv.get(`tasks:${userId}`) || [];
    const taskIndex = tasks.findIndex((task: any) => task.id === taskId);
    
    if (taskIndex === -1) {
      return c.json({ error: "Task not found" }, 404);
    }
    
    // Update task
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    await kv.set(`tasks:${userId}`, tasks);
    
    return c.json({ success: true, task: tasks[taskIndex] });
  } catch (err) {
    console.error('Update task error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.delete("/make-server-4faddd75/tasks/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Allow anonymous tasks for guest users
    let userId = 'guest';
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user?.id) {
        userId = user.id;
      }
    }

    const taskId = c.req.param('id');
    
    // Get existing tasks
    const tasks = await kv.get(`tasks:${userId}`) || [];
    const filteredTasks = tasks.filter((task: any) => task.id !== taskId);
    
    await kv.set(`tasks:${userId}`, filteredTasks);
    
    return c.json({ success: true });
  } catch (err) {
    console.error('Delete task error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Notes management
app.get("/make-server-4faddd75/notes", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Allow anonymous notes for guest users
    let userId = 'guest';
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user?.id) {
        userId = user.id;
      }
    }

    const notes = await kv.get(`notes:${userId}`) || [];
    
    return c.json({ notes });
  } catch (err) {
    console.error('Get notes error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post("/make-server-4faddd75/notes", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Allow anonymous notes for guest users
    let userId = 'guest';
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user?.id) {
        userId = user.id;
      }
    }

    const { title, content, tags } = await c.req.json();
    
    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    const newNote = {
      id: crypto.randomUUID(),
      title,
      content,
      tags: tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Get existing notes
    const notes = await kv.get(`notes:${userId}`) || [];
    notes.push(newNote);
    
    await kv.set(`notes:${userId}`, notes);
    
    return c.json({ success: true, note: newNote });
  } catch (err) {
    console.error('Create note error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.put("/make-server-4faddd75/notes/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Allow anonymous notes for guest users
    let userId = 'guest';
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user?.id) {
        userId = user.id;
      }
    }

    const noteId = c.req.param('id');
    const updates = await c.req.json();
    
    // Get existing notes
    const notes = await kv.get(`notes:${userId}`) || [];
    const noteIndex = notes.findIndex((note: any) => note.id === noteId);
    
    if (noteIndex === -1) {
      return c.json({ error: "Note not found" }, 404);
    }
    
    // Update note
    notes[noteIndex] = { 
      ...notes[noteIndex], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    await kv.set(`notes:${userId}`, notes);
    
    return c.json({ success: true, note: notes[noteIndex] });
  } catch (err) {
    console.error('Update note error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.delete("/make-server-4faddd75/notes/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Allow anonymous notes for guest users
    let userId = 'guest';
    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
      if (!authError && user?.id) {
        userId = user.id;
      }
    }

    const noteId = c.req.param('id');
    
    // Get existing notes
    const notes = await kv.get(`notes:${userId}`) || [];
    const filteredNotes = notes.filter((note: any) => note.id !== noteId);
    
    await kv.set(`notes:${userId}`, filteredNotes);
    
    return c.json({ success: true });
  } catch (err) {
    console.error('Delete note error:', err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

console.log('🚀 EZ Grades server is starting...');

Deno.serve(app.fetch);