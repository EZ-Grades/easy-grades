import { projectId, publicAnonKey } from '../utils/supabase/info'
import { supabase } from '../lib/supabase'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4faddd75`

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  } else {
    headers['Authorization'] = `Bearer ${publicAnonKey}`
  }
  
  return headers
}

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers = await getAuthHeaders()
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { ...headers, ...options.headers },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Health check
export const healthCheck = () => apiRequest('/health')

// Authentication
export const signUpUser = async (email: string, password: string, fullName: string) => {
  return apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, fullName }),
  })
}

// Chat API
export const sendChatMessage = async (message: string) => {
  return apiRequest('/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export const getChatHistory = async () => {
  return apiRequest('/chat/history')
}

// User preferences
export const getUserPreferences = async () => {
  return apiRequest('/user/preferences')
}

export const updateUserPreferences = async (preferences: any) => {
  return apiRequest('/user/preferences', {
    method: 'POST',
    body: JSON.stringify(preferences),
  })
}

// Study sessions
export const saveStudySession = async (sessionData: {
  duration: number
  type: string
  completed: boolean
}) => {
  return apiRequest('/study/session', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  })
}

export const getStudySessions = async () => {
  return apiRequest('/study/sessions')
}

// Tasks
export const getTasks = async () => {
  return apiRequest('/tasks')
}

export const createTask = async (task: {
  title: string
  description?: string
  priority?: string
  due_date?: string
}) => {
  return apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  })
}

export const updateTask = async (id: string, updates: any) => {
  return apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export const deleteTask = async (id: string) => {
  return apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  })
}

// Notes
export const getNotes = async () => {
  return apiRequest('/notes')
}

export const createNote = async (note: {
  title: string
  content: string
  tags?: string[]
}) => {
  return apiRequest('/notes', {
    method: 'POST',
    body: JSON.stringify(note),
  })
}

export const updateNote = async (id: string, updates: any) => {
  return apiRequest(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
}

export const deleteNote = async (id: string) => {
  return apiRequest(`/notes/${id}`, {
    method: 'DELETE',
  })
}