/**
 * Perplexity AI Service
 * Handles AI-powered question generation, flashcard creation, and study assistance
 */

// Safe environment variable access
const getPerplexityApiKey = (): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_PERPLEXITY_API_KEY;
  }
  return undefined;
};

const PERPLEXITY_API_KEY = getPerplexityApiKey();
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export interface AIQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIFlashcard {
  question: string;
  answer: string;
  hint?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Generate practice questions for a certification using AI
 */
export async function generatePracticeQuestions(
  certificationName: string,
  count: number = 10,
  difficulty?: 'easy' | 'medium' | 'hard'
): Promise<{ data: AIQuestion[] | null; error: string | null }> {
  try {
    const difficultyPrompt = difficulty ? ` at ${difficulty} difficulty level` : '';
    
    const prompt = `Generate ${count} multiple-choice practice questions for the ${certificationName} certification exam${difficultyPrompt}.

For each question, provide:
1. A clear, exam-style question
2. Exactly 4 answer options (A, B, C, D)
3. The correct answer letter (A, B, C, or D)
4. A brief explanation of why the answer is correct
5. Difficulty level (easy, medium, or hard)

Format your response as a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "answer": "B",
    "explanation": "Explanation text here",
    "difficulty": "medium"
  }
]

Ensure the JSON is properly formatted and parseable. Only return the JSON array, no additional text.`;

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an expert exam question generator. Always respond with valid JSON only, no markdown or additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      jsonContent = jsonMatch ? jsonMatch[1].trim() : jsonContent;
    }

    const questions = JSON.parse(jsonContent);

    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array');
    }

    // Validate question format
    const validatedQuestions = questions.map((q, index) => {
      if (!q.question || !Array.isArray(q.options) || !q.answer || !q.explanation) {
        console.warn(`Question ${index} missing required fields:`, q);
        throw new Error(`Invalid question format at index ${index}`);
      }
      
      return {
        question: q.question,
        options: q.options.slice(0, 4), // Ensure exactly 4 options
        answer: q.answer.toUpperCase(),
        explanation: q.explanation,
        difficulty: q.difficulty || 'medium'
      };
    });

    return { data: validatedQuestions, error: null };
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return { 
      data: null, 
      error: error.message || 'Failed to generate questions. Please try again.' 
    };
  }
}

/**
 * Generate flashcards for a certification using AI
 */
export async function generateFlashcards(
  certificationName: string,
  count: number = 20,
  topic?: string
): Promise<{ data: AIFlashcard[] | null; error: string | null }> {
  try {
    const topicPrompt = topic ? ` focusing on ${topic}` : '';
    
    const prompt = `Generate ${count} educational flashcards for the ${certificationName} certification${topicPrompt}.

For each flashcard, provide:
1. A concise question or concept to learn
2. A clear, informative answer
3. An optional hint (if helpful)

Format your response as a valid JSON array with this exact structure:
[
  {
    "question": "Question or concept here?",
    "answer": "Clear answer here",
    "hint": "Optional hint here"
  }
]

Keep questions focused on key concepts, terminology, and important facts. Ensure the JSON is properly formatted and parseable. Only return the JSON array, no additional text.`;

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Always respond with valid JSON only, no markdown or additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      jsonContent = jsonMatch ? jsonMatch[1].trim() : jsonContent;
    }

    const flashcards = JSON.parse(jsonContent);

    if (!Array.isArray(flashcards)) {
      throw new Error('Response is not an array');
    }

    // Validate flashcard format
    const validatedFlashcards = flashcards.map((f, index) => {
      if (!f.question || !f.answer) {
        console.warn(`Flashcard ${index} missing required fields:`, f);
        throw new Error(`Invalid flashcard format at index ${index}`);
      }
      
      return {
        question: f.question,
        answer: f.answer,
        hint: f.hint || undefined
      };
    });

    return { data: validatedFlashcards, error: null };
  } catch (error: any) {
    console.error('Error generating flashcards:', error);
    return { 
      data: null, 
      error: error.message || 'Failed to generate flashcards. Please try again.' 
    };
  }
}

/**
 * Get AI study assistance (chat interface)
 */
export async function getStudyAssistance(
  userQuestion: string,
  context?: string,
  conversationHistory?: ChatMessage[]
): Promise<{ data: string | null; error: string | null }> {
  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert study assistant helping students prepare for certification exams. Provide clear, structured explanations suitable for certification-level understanding. ${context ? `Context: ${context}` : ''}`
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: userQuestion
      }
    ];

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Perplexity API error:', errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    return { data: content, error: null };
  } catch (error: any) {
    console.error('Error getting study assistance:', error);
    return { 
      data: null, 
      error: error.message || 'Failed to get study assistance. Please try again.' 
    };
  }
}

/**
 * Explain a concept or answer
 */
export async function explainConcept(
  concept: string,
  certificationContext?: string
): Promise<{ data: string | null; error: string | null }> {
  try {
    const contextPrompt = certificationContext 
      ? ` in the context of ${certificationContext}` 
      : '';
    
    const prompt = `Explain "${concept}"${contextPrompt} in a clear and concise way suitable for certification exam preparation. Include:
1. Definition
2. Key points
3. A practical example
4. Why it's important to know

Keep the explanation focused and exam-relevant.`;

    return await getStudyAssistance(prompt);
  } catch (error: any) {
    console.error('Error explaining concept:', error);
    return { 
      data: null, 
      error: error.message || 'Failed to explain concept. Please try again.' 
    };
  }
}

/**
 * Generate a study plan
 */
export async function generateStudyPlan(
  certificationName: string,
  availableTimePerDay: number,
  examDate?: string
): Promise<{ data: string | null; error: string | null }> {
  try {
    const datePrompt = examDate 
      ? ` with an exam date of ${examDate}` 
      : '';
    
    const prompt = `Create a personalized study plan for the ${certificationName} certification${datePrompt}. 
The student has ${availableTimePerDay} hours available per day for studying.

Provide:
1. A week-by-week breakdown of topics to cover
2. Daily study recommendations
3. Practice and review schedule
4. Tips for effective preparation

Format the response in a clear, structured way.`;

    return await getStudyAssistance(prompt);
  } catch (error: any) {
    console.error('Error generating study plan:', error);
    return { 
      data: null, 
      error: error.message || 'Failed to generate study plan. Please try again.' 
    };
  }
}

/**
 * Check if Perplexity API is configured
 */
export function isPerplexityConfigured(): boolean {
  return !!PERPLEXITY_API_KEY && PERPLEXITY_API_KEY !== 'your-api-key-here';
}

/**
 * Get error message when API is not configured
 */
export function getConfigurationError(): string {
  return 'Perplexity API key not configured. Please add VITE_PERPLEXITY_API_KEY to your environment variables.';
}
