/**
 * Mock Data Service
 * 
 * Provides fallback mock data when database tables are not available
 * This prevents the app from breaking due to missing database setup
 */

export interface MockTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  user_id: string;
}

export interface MockNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface MockProfile {
  id: string;
  full_name: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MockFocusSession {
  id: string;
  duration: number;
  session_type: 'pomodoro' | 'custom' | 'focus';
  completed: boolean;
  created_at: string;
  user_id: string;
}

export interface MockAmbientSound {
  id: string;
  name: string;
  file_url: string;
  category: string;
  volume: number;
}

export interface MockAmbienceMode {
  id: string;
  name: string;
  description: string;
  sounds: string[];
  background_color: string;
}

class MockDataService {
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Mock Tasks
  getMockTasks(userId: string): MockTask[] {
    return [
      {
        id: this.generateId(),
        title: "Complete Math Assignment",
        description: "Chapter 5 exercises",
        completed: false,
        priority: 'high',
        due_date: new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: this.generateId(),
        title: "Review History Notes",
        description: "World War II timeline",
        completed: true,
        priority: 'medium',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        user_id: userId
      },
      {
        id: this.generateId(),
        title: "Prepare for Science Quiz",
        completed: false,
        priority: 'high',
        due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
        user_id: userId
      }
    ];
  }

  // Mock Notes
  getMockNotes(userId: string): MockNote[] {
    return [
      {
        id: this.generateId(),
        title: "Study Session Notes",
        content: "Today I learned about calculus derivatives. Key points:\n- Power rule\n- Product rule\n- Chain rule",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      },
      {
        id: this.generateId(),
        title: "Project Ideas",
        content: "Ideas for the upcoming science project:\n1. Solar system model\n2. Volcano experiment\n3. Plant growth study",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        user_id: userId
      }
    ];
  }

  // Mock Profile
  getMockProfile(userId: string, userData?: any): MockProfile {
    return {
      id: userId,
      full_name: userData?.full_name || 'Demo User',
      username: userData?.username || 'demo_user',
      email: userData?.email || 'demo@ezgrades.app',
      avatar_url: userData?.avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Mock Focus Sessions
  getMockFocusSessions(userId: string): MockFocusSession[] {
    return [
      {
        id: this.generateId(),
        duration: 1500, // 25 minutes
        session_type: 'pomodoro',
        completed: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        user_id: userId
      },
      {
        id: this.generateId(),
        duration: 3000, // 50 minutes
        session_type: 'custom',
        completed: true,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        user_id: userId
      }
    ];
  }

  // Mock Ambient Sounds
  getMockAmbientSounds(): MockAmbientSound[] {
    return [
      {
        id: this.generateId(),
        name: "Rain Sounds",
        file_url: "https://www.soundjay.com/misc/sounds/rain-01.wav",
        category: "nature",
        volume: 0.7
      },
      {
        id: this.generateId(),
        name: "Forest Ambience",
        file_url: "https://www.soundjay.com/misc/sounds/forest-01.wav",
        category: "nature",
        volume: 0.6
      },
      {
        id: this.generateId(),
        name: "Coffee Shop",
        file_url: "https://www.soundjay.com/misc/sounds/coffee-shop-01.wav",
        category: "urban",
        volume: 0.5
      }
    ];
  }

  // Mock Ambience Modes
  getMockAmbienceModes(): MockAmbienceMode[] {
    return [
      {
        id: this.generateId(),
        name: "Rainy Day",
        description: "Perfect for deep focus",
        sounds: ["Rain Sounds"],
        background_color: "#4A90E2"
      },
      {
        id: this.generateId(),
        name: "Forest Retreat",
        description: "Nature sounds for relaxation",
        sounds: ["Forest Ambience"],
        background_color: "#7ED321"
      },
      {
        id: this.generateId(),
        name: "Study Café",
        description: "Coffee shop vibes",
        sounds: ["Coffee Shop"],
        background_color: "#D0743C"
      }
    ];
  }

  // Task Statistics
  getTaskStats(tasks: MockTask[]) {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const high_priority = tasks.filter(task => task.priority === 'high').length;
    
    return {
      total,
      completed,
      pending,
      high_priority,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  // Session Statistics
  getSessionStats(sessions: MockFocusSession[]) {
    const total_sessions = sessions.length;
    const completed_sessions = sessions.filter(session => session.completed).length;
    const total_time = sessions.reduce((acc, session) => acc + session.duration, 0);
    const avg_session_time = total_sessions > 0 ? Math.round(total_time / total_sessions) : 0;
    
    return {
      total_sessions,
      completed_sessions,
      total_time,
      avg_session_time,
      today_time: sessions
        .filter(session => {
          const today = new Date().toDateString();
          const sessionDate = new Date(session.created_at).toDateString();
          return today === sessionDate;
        })
        .reduce((acc, session) => acc + session.duration, 0)
    };
  }
}

export const mockDataService = new MockDataService();

// Helper function to simulate API delay
export function simulateApiDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Error handling wrapper
export async function withMockFallback<T>(
  apiCall: () => Promise<T>,
  mockData: T,
  errorMessage: string = "Using mock data"
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.warn(`${errorMessage}:`, error);
    await simulateApiDelay(200); // Small delay to simulate network
    return mockData;
  }
}