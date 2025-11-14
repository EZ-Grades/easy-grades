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

  // AI service call using Perplexity API
  const callAIService = async (message: string, contextType: string): Promise<string> => {
    try {
      // Dynamically import the Perplexity service
      const { getStudyAssistance, isPerplexityConfigured } = await import('../services/perplexityService')
      
      // Check if Perplexity is configured
      if (!isPerplexityConfigured()) {
        throw new Error('AI service not configured. Please add VITE_PERPLEXITY_API_KEY to your environment variables.')
      }

      // Create context prompt based on type
      const contextPrompts = {
        general: 'You are a helpful study assistant. Answer questions clearly and provide actionable advice.',
        study_help: 'You are a study coach helping students learn effectively. Break down complex topics and provide clear explanations.',
        course_specific: 'You are an expert tutor for this specific course. Focus on course-related concepts and help students master the material.',
        homework_help: 'You are a homework helper. Guide students through problems without giving direct answers. Help them understand the process.'
      }
      
      const context = contextPrompts[contextType as keyof typeof contextPrompts] || contextPrompts.general
      
      // Get conversation history from current messages
      const conversationHistory = messages
        .slice(-5) // Only include last 5 messages for context
        .map(msg => ({
          role: msg.message_type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.message_type === 'user' ? msg.message : msg.response
        }))
      
      // Call Perplexity API
      const { data, error } = await getStudyAssistance(message, context, conversationHistory)
      
      if (error || !data) {
        throw new Error(error || 'Failed to get AI response')
      }
      
      return data
    } catch (error: any) {
      console.error('Error calling AI service:', error)
      
      // Fallback to helpful error message
      if (error.message.includes('not configured')) {
        return "I'm currently unavailable because the AI service hasn't been configured yet. Please contact your administrator to set up the PERPLEXITY_API_KEY."
      }
      
      return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
    }
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