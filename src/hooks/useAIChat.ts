import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Database } from '../types/database'

type Tables = Database['public']['Tables']

export interface AIChat extends Tables['ai_chat_sessions']['Row'] {
  chat_history?: Tables['chat_history']['Row'][]
}

export interface ChatMessage extends Tables['chat_history']['Row'] {}

export function useAIChat() {
  const [sessions, setSessions] = useState<AIChat[]>([])
  const [currentSession, setCurrentSession] = useState<AIChat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .select(`
          *,
          chat_history (
            id,
            message,
            response,
            message_type,
            created_at
          )
        `)
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      setSessions(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching AI chat sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch chat sessions')
    } finally {
      setLoading(false)
    }
  }

  const createSession = async (title: string, contextType: 'general' | 'study_help' | 'course_specific' | 'homework_help' = 'general') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('ai_chat_sessions')
        .insert([{
          user_id: user.id,
          title,
          context_type: contextType
        }])
        .select()
        .single()
      
      if (error) throw error
      await fetchSessions()
      setCurrentSession(data)
      setMessages([])
      return { success: true, session: data }
    } catch (err) {
      console.error('Error creating chat session:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create chat session' }
    }
  }

  const selectSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId)
      if (!session) throw new Error('Session not found')

      setCurrentSession(session)
      
      // Fetch messages for this session
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setMessages(data || [])
      return { success: true }
    } catch (err) {
      console.error('Error selecting chat session:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to select session' }
    }
  }

  const sendMessage = async (message: string) => {
    if (!currentSession) {
      return { success: false, error: 'No active session' }
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Add user message to local state immediately
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        session_id: currentSession.id,
        message: message,
        response: '',
        message_type: 'user',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, userMessage])

      // Call AI service to get response
      const aiResponse = await callAIService(message, currentSession.context_type)
      
      // Save both user message and AI response to database
      const { data, error } = await supabase
        .from('chat_history')
        .insert([{
          user_id: user.id,
          session_id: currentSession.id,
          message: message,
          response: aiResponse,
          message_type: 'user'
        }])
        .select()
        .single()
      
      if (error) throw error

      // Update local state with actual database record
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== userMessage.id)
        return [
          ...filtered,
          data,
          {
            id: `assistant-${Date.now()}`,
            user_id: user.id,
            session_id: currentSession.id,
            message: aiResponse,
            response: '',
            message_type: 'assistant' as const,
            created_at: new Date().toISOString()
          }
        ]
      })

      // Update session's updated_at timestamp
      await supabase
        .from('ai_chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSession.id)

      return { success: true, message: data, response: aiResponse }
    } catch (err) {
      console.error('Error sending message:', err)
      
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')))
      
      return { success: false, error: err instanceof Error ? err.message : 'Failed to send message' }
    }
  }

  const deleteSession = async (sessionId: string) => {
    try {
      // Delete all chat history for this session first
      await supabase
        .from('chat_history')
        .delete()
        .eq('session_id', sessionId)

      // Delete the session
      const { error } = await supabase
        .from('ai_chat_sessions')
        .delete()
        .eq('id', sessionId)
      
      if (error) throw error

      // Update local state
      if (currentSession?.id === sessionId) {
        setCurrentSession(null)
        setMessages([])
      }
      
      await fetchSessions()
      return { success: true }
    } catch (err) {
      console.error('Error deleting session:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete session' }
    }
  }

  const updateSessionTitle = async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('ai_chat_sessions')
        .update({ title: newTitle })
        .eq('id', sessionId)
      
      if (error) throw error
      
      // Update local state
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title: newTitle } : null)
      }
      
      await fetchSessions()
      return { success: true }
    } catch (err) {
      console.error('Error updating session title:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update session title' }
    }
  }

  // Mock AI service call - replace with actual AI integration
  const callAIService = async (message: string, contextType: string): Promise<string> => {
    // This is a mock implementation. Replace with actual AI service calls
    // You might use OpenAI, Anthropic, or your preferred AI service here
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    const responses = {
      general: [
        "I understand you're looking for help. Could you provide more details about what you need assistance with?",
        "That's an interesting question! Let me help you work through this step by step.",
        "I'm here to help you with your studies. What specific topic would you like to explore?"
      ],
      study_help: [
        "Let's break this down into manageable parts. What subject are you studying?",
        "Great question! This topic requires understanding the fundamentals first. Let me explain...",
        "I can help you understand this concept better. What part is giving you trouble?"
      ],
      course_specific: [
        "For this course material, let's focus on the key concepts you need to master.",
        "This is a common challenge in this subject. Here's how to approach it...",
        "Let me help you connect this concept to what you've already learned."
      ],
      homework_help: [
        "I can guide you through this problem. Let's start by identifying what we know.",
        "Rather than giving you the answer, let me help you understand the process.",
        "This type of question requires a specific approach. Here's how to think about it..."
      ]
    }
    
    const contextResponses = responses[contextType as keyof typeof responses] || responses.general
    const randomResponse = contextResponses[Math.floor(Math.random() * contextResponses.length)]
    
    return randomResponse
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  return {
    sessions,
    currentSession,
    messages,
    loading,
    error,
    createSession,
    selectSession,
    sendMessage,
    deleteSession,
    updateSessionTitle,
    refetch: fetchSessions
  }
}