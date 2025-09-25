import { sendChatMessage, getChatHistory } from './api'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatResponse {
  success: boolean
  response?: string
  error?: string
}

class AIFunctionality {
  async processMessage(message: string, userId?: string): Promise<ChatResponse> {
    try {
      // Use the backend API for real AI responses
      const response = await sendChatMessage(message)
      
      return {
        success: true,
        response: response.response
      }
    } catch (error) {
      console.error('Error processing AI message:', error)
      
      // Fallback to mock response if API fails
      const mockResponse = this.generateContextualResponse(message)
      
      return {
        success: true,
        response: mockResponse
      }
    }
  }

  private generateContextualResponse(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    // Subject-specific responses
    if (lowerMessage.includes('math') || lowerMessage.includes('calculus') || lowerMessage.includes('algebra')) {
      return "For mathematical concepts like this, it's helpful to start with the fundamentals. Let me break down the steps: First, identify what type of problem you're dealing with... Then, apply the relevant formulas or methods... Finally, check your work by substituting back or using alternative approaches."
    }
    
    if (lowerMessage.includes('science') || lowerMessage.includes('chemistry') || lowerMessage.includes('physics') || lowerMessage.includes('biology')) {
      return "Scientific concepts often involve understanding both theory and practical applications. In this case, the key principles are... The experimental evidence supporting this includes... To remember this effectively, try connecting it to real-world examples you've observed."
    }
    
    if (lowerMessage.includes('history') || lowerMessage.includes('literature') || lowerMessage.includes('english')) {
      return "When studying humanities subjects, context is crucial. Consider the historical period, cultural influences, and social factors at play... The key themes to focus on are... To analyze this effectively, look for patterns and connections between different sources or time periods."
    }
    
    if (lowerMessage.includes('study') || lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('prepare')) {
      return "Effective study strategies are personalized, but here are some proven techniques: Active recall (testing yourself without looking at notes), spaced repetition (reviewing material at increasing intervals), and elaborative practice (explaining concepts in your own words). For exam preparation specifically, create a study schedule, practice past questions, and focus on understanding rather than memorization."
    }
    
    if (lowerMessage.includes('motivation') || lowerMessage.includes('tired') || lowerMessage.includes('stressed')) {
      return "It's completely normal to feel this way during your studies! Remember that learning is a process, and every expert was once a beginner. Break large tasks into smaller, manageable chunks. Celebrate small wins along the way. Take regular breaks using techniques like the Pomodoro method. And remember - you're investing in your future self!"
    }
    
    // Default response
    return "That's an excellent question! I'm here to help you learn and understand. Could you provide a bit more context or specify what particular aspect you'd like me to explain?"
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const response = await getChatHistory()
      const history = response.history || []
      
      const messages: ChatMessage[] = []
      
      // Convert database records to chat messages
      history.forEach((record: any) => {
        messages.push({
          id: `${record.id}-user`,
          role: 'user',
          content: record.message,
          timestamp: new Date(record.created_at)
        })
        
        messages.push({
          id: `${record.id}-assistant`,
          role: 'assistant',
          content: record.response,
          timestamp: new Date(record.created_at)
        })
      })

      // Sort by timestamp (oldest first for proper chat flow)
      return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    } catch (error) {
      console.error('Error fetching chat history:', error)
      return []
    }
  }
}

export const aiChatService = new AIFunctionality()