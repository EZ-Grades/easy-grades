// Mock API implementations for StudyHub functionality
// In a real application, these would be actual API calls to your backend

export interface Exam {
  id: string
  name: string
  description: string
  category: string
  provider: string
  total_questions: number
  duration_minutes: number
  passing_score: number
  exam_fee_usd: number
  icon_url?: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
}

export interface UserExam {
  id: string
  exam_id: string
  user_id: string
  enrolled_at: string
  progress: number
  last_study_session?: string
  total_study_time: number
}

export interface Question {
  id: string
  question_text: string
  options: Record<string, string>
  correct_answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  explanation?: string
}

export interface FlashcardSet {
  id: string
  name: string
  description: string
  card_count: number
  difficulty_filter: 'easy' | 'medium' | 'hard'
  is_ai_generated: boolean
  created_at: string
  progress?: number
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface TestSession {
  id: string
  questions: Question[]
  session_type: 'practice' | 'mock_exam'
  time_limit: number
  started_at: string
}

// Mock data
const mockExams: Exam[] = [
  {
    id: 'aws-saa',
    name: 'AWS Solutions Architect Associate',
    description: 'Design and deploy scalable, highly available, and fault-tolerant systems on AWS',
    category: 'cloud',
    provider: 'Amazon Web Services',
    total_questions: 65,
    duration_minutes: 130,
    passing_score: 72,
    exam_fee_usd: 150,
    difficulty: 'Intermediate'
  },
  {
    id: 'cissp',
    name: 'Certified Information Systems Security Professional',
    description: 'Advanced cybersecurity certification covering eight security domains',
    category: 'security',
    provider: '(ISC)²',
    total_questions: 125,
    duration_minutes: 180,
    passing_score: 70,
    exam_fee_usd: 749,
    difficulty: 'Advanced'
  },
  {
    id: 'ccna',
    name: 'Cisco Certified Network Associate',
    description: 'Networking fundamentals, IP connectivity, IP services, security fundamentals',
    category: 'network',
    provider: 'Cisco',
    total_questions: 120,
    duration_minutes: 120,
    passing_score: 82,
    exam_fee_usd: 300,
    difficulty: 'Intermediate'
  },
  {
    id: 'azure-fundamentals',
    name: 'Azure Fundamentals',
    description: 'Foundational knowledge of cloud services and how they are provided with Azure',
    category: 'cloud',
    provider: 'Microsoft',
    total_questions: 40,
    duration_minutes: 85,
    passing_score: 70,
    exam_fee_usd: 99,
    difficulty: 'Beginner'
  },
  {
    id: 'comptia-security',
    name: 'CompTIA Security+',
    description: 'IT security fundamentals including threats, attacks, vulnerabilities, and technologies',
    category: 'security',
    provider: 'CompTIA',
    total_questions: 90,
    duration_minutes: 90,
    passing_score: 75,
    exam_fee_usd: 370,
    difficulty: 'Intermediate'
  },
  {
    id: 'google-cloud-digital-leader',
    name: 'Google Cloud Digital Leader',
    description: 'Foundational knowledge of cloud technology and data to support business decisions',
    category: 'cloud',
    provider: 'Google Cloud',
    total_questions: 50,
    duration_minutes: 90,
    passing_score: 70,
    exam_fee_usd: 99,
    difficulty: 'Beginner'
  }
]

const mockQuestions: Record<string, Question[]> = {
  'aws-saa': [
    {
      id: 'q1',
      question_text: 'Which AWS service provides a fully managed NoSQL database with single-digit millisecond latency?',
      options: {
        'A': 'Amazon RDS',
        'B': 'Amazon DynamoDB',
        'C': 'Amazon Redshift',
        'D': 'Amazon ElastiCache'
      },
      correct_answer: 'B',
      difficulty: 'medium',
      points: 10,
      explanation: 'Amazon DynamoDB is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability.'
    },
    {
      id: 'q2',
      question_text: 'What is the minimum size for an Amazon S3 object?',
      options: {
        'A': '0 bytes',
        'B': '1 byte',
        'C': '1 KB',
        'D': '1 MB'
      },
      correct_answer: 'A',
      difficulty: 'easy',
      points: 5,
      explanation: 'Amazon S3 objects can be 0 bytes to 5 TB in size. The minimum size is 0 bytes.'
    },
    {
      id: 'q3',
      question_text: 'Which service would you use to implement a message queue in AWS?',
      options: {
        'A': 'Amazon SNS',
        'B': 'Amazon SQS',
        'C': 'Amazon SES',
        'D': 'Amazon SWF'
      },
      correct_answer: 'B',
      difficulty: 'medium',
      points: 10,
      explanation: 'Amazon Simple Queue Service (SQS) is a fully managed message queuing service.'
    }
  ]
}

const mockFlashcardSets: FlashcardSet[] = [
  {
    id: 'set1',
    name: 'AWS Core Services',
    description: 'Essential AWS services every Solutions Architect should know',
    card_count: 25,
    difficulty_filter: 'medium',
    is_ai_generated: true,
    created_at: '2024-01-15T10:00:00Z',
    progress: 68
  },
  {
    id: 'set2',
    name: 'Network Security Fundamentals',
    description: 'Basic concepts of network security and protection mechanisms',
    card_count: 18,
    difficulty_filter: 'easy',
    is_ai_generated: false,
    created_at: '2024-01-10T14:30:00Z',
    progress: 92
  },
  {
    id: 'set3',
    name: 'Cloud Computing Concepts',
    description: 'Foundational cloud computing terms and concepts',
    card_count: 30,
    difficulty_filter: 'easy',
    is_ai_generated: true,
    created_at: '2024-01-08T09:15:00Z',
    progress: 45
  }
]

let mockConversations: Conversation[] = []
let mockMessages: ChatMessage[] = []

// API implementations
export const ExamAPI = {
  async getAllExams(): Promise<Exam[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockExams
  },

  async getUserExams(userId: string): Promise<UserExam[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    // Mock enrolled exams for the user
    return [
      {
        id: 'ue1',
        exam_id: 'aws-saa',
        user_id: userId,
        enrolled_at: '2024-01-10T10:00:00Z',
        progress: 65,
        last_study_session: '2024-01-20T15:30:00Z',
        total_study_time: 1200
      },
      {
        id: 'ue2',
        exam_id: 'azure-fundamentals',
        user_id: userId,
        enrolled_at: '2024-01-05T14:00:00Z',
        progress: 89,
        last_study_session: '2024-01-19T11:15:00Z',
        total_study_time: 800
      }
    ]
  },

  async enrollUserInExam(userId: string, examId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800))
    // In real app, this would create the enrollment record
    console.log(`User ${userId} enrolled in exam ${examId}`)
  }
}

export const QuestionAPI = {
  async getQuestions(params: {
    exam_id: string
    difficulty?: 'easy' | 'medium' | 'hard'
    limit?: number
    random?: boolean
  }): Promise<Question[]> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    let questions = mockQuestions[params.exam_id] || []
    
    if (params.difficulty) {
      questions = questions.filter(q => q.difficulty === params.difficulty)
    }
    
    if (params.random) {
      questions = [...questions].sort(() => Math.random() - 0.5)
    }
    
    if (params.limit) {
      questions = questions.slice(0, params.limit)
    }
    
    return questions
  },

  async submitAnswer(
    userId: string,
    questionId: string,
    userAnswer: string,
    sessionType: 'practice' | 'mock_exam'
  ): Promise<{ isCorrect: boolean; explanation?: string }> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Find the question to check the answer
    const allQuestions = Object.values(mockQuestions).flat()
    const question = allQuestions.find(q => q.id === questionId)
    
    if (!question) {
      throw new Error('Question not found')
    }
    
    const isCorrect = question.correct_answer === userAnswer
    
    return {
      isCorrect,
      explanation: question.explanation
    }
  }
}

export const FlashcardAPI = {
  async getFlashcardSets(userId: string, includeAIGenerated: boolean = true): Promise<FlashcardSet[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    let sets = [...mockFlashcardSets]
    
    if (!includeAIGenerated) {
      sets = sets.filter(set => !set.is_ai_generated)
    }
    
    return sets
  },

  async generateFlashcardsFromQuestions(
    userId: string,
    examId: string,
    topicId?: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 20
  ): Promise<{ flashcards: any[]; set_id: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Longer delay for generation
    
    const exam = mockExams.find(e => e.id === examId)
    const setName = `${exam?.name || 'Unknown'} - AI Generated`
    
    const newSet: FlashcardSet = {
      id: `set_${Date.now()}`,
      name: setName,
      description: `AI-generated flashcards for ${exam?.name || 'exam'} preparation`,
      card_count: count,
      difficulty_filter: difficulty,
      is_ai_generated: true,
      created_at: new Date().toISOString(),
      progress: 0
    }
    
    mockFlashcardSets.push(newSet)
    
    return {
      flashcards: Array(count).fill(null).map((_, i) => ({
        id: `card_${i}`,
        front: `Question ${i + 1}`,
        back: `Answer ${i + 1}`
      })),
      set_id: newSet.id
    }
  }
}

export const AIHelperAPI = {
  async getConversations(userId: string): Promise<Conversation[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockConversations.filter(c => c.id.includes(userId))
  },

  async createConversation(userId: string): Promise<Conversation> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const conversation: Conversation = {
      id: `conv_${userId}_${Date.now()}`,
      title: 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockConversations.push(conversation)
    return conversation
  },

  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockMessages.filter(m => m.conversation_id === conversationId)
  },

  async sendMessage(
    conversationId: string,
    content: string
  ): Promise<{ userMessage: ChatMessage; aiMessage: ChatMessage }> {
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate AI thinking time
    
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      conversation_id: conversationId,
      role: 'user',
      content,
      created_at: new Date().toISOString()
    }
    
    // Generate AI response based on user input
    let aiResponse = "I understand your question about study planning. Let me help you create an effective approach."
    
    if (content.toLowerCase().includes('aws')) {
      aiResponse = "AWS certifications are excellent choices! For the Solutions Architect Associate, I recommend focusing on core services like EC2, S3, RDS, and VPC. Would you like me to create a detailed study plan?"
    } else if (content.toLowerCase().includes('security')) {
      aiResponse = "Security certifications like CompTIA Security+ or CISSP are highly valuable. I can help you understand key concepts like threat modeling, encryption, and access control. What specific area interests you most?"
    } else if (content.toLowerCase().includes('flashcard')) {
      aiResponse = "Flashcards are a great study tool! I can generate custom flashcard sets based on exam topics. Which certification are you preparing for?"
    } else if (content.toLowerCase().includes('study plan')) {
      aiResponse = "Creating a structured study plan is crucial for certification success. I can help you plan based on your timeline, current knowledge, and learning preferences. How much time do you have available each week?"
    }
    
    const aiMessage: ChatMessage = {
      id: `msg_${Date.now()}_ai`,
      conversation_id: conversationId,
      role: 'assistant',
      content: aiResponse,
      created_at: new Date().toISOString()
    }
    
    mockMessages.push(userMessage, aiMessage)
    
    return { userMessage, aiMessage }
  }
}

export const TestSessionAPI = {
  async startTestSession(
    userId: string,
    examId: string,
    sessionType: 'practice' | 'mock_exam',
    questionCount: number,
    timeLimit: number
  ): Promise<TestSession> {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const questions = await QuestionAPI.getQuestions({
      exam_id: examId,
      limit: questionCount,
      random: true
    })
    
    return {
      id: `session_${Date.now()}`,
      questions,
      session_type: sessionType,
      time_limit: timeLimit,
      started_at: new Date().toISOString()
    }
  }
}