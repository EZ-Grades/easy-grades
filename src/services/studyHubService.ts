import { supabase } from '../lib/supabase';

export interface Certification {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  total_questions: number;
  icon?: string;
  color?: string;
  is_active: boolean;
}

export interface ExamQuestion {
  id: string;
  certification_id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  question_number?: number;
}

export interface FlashcardDeck {
  id: string;
  certification_id: string;
  title: string;
  description: string;
  card_count: number;
  category: string;
  is_public: boolean;
  created_by?: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  order_index: number;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  certification_id: string;
  questions_attempted: number;
  questions_correct: number;
  score_percentage: number;
  time_spent_seconds: number;
  started_at: string;
  completed_at?: string;
  session_data?: any;
}

export interface UserFlashcardProgress {
  id: string;
  user_id: string;
  deck_id: string;
  cards_reviewed: number;
  cards_mastered: number;
  last_reviewed_at?: string;
}

// ============================================
// CERTIFICATION OPERATIONS
// ============================================

export async function getCertifications(category?: string) {
  try {
    let query = supabase
      .from('certifications')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching certifications:', error);
    return { data: null, error: error.message };
  }
}

export async function getCertificationById(id: string) {
  try {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching certification:', error);
    return { data: null, error: error.message };
  }
}

// ============================================
// EXAM QUESTIONS OPERATIONS
// ============================================

export async function getQuestionsByCertification(
  certificationId: string,
  limit?: number,
  difficulty?: 'easy' | 'medium' | 'hard'
) {
  try {
    let query = supabase
      .from('exam_questions')
      .select('*')
      .eq('certification_id', certificationId)
      .order('question_number');

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return { data: null, error: error.message };
  }
}

export async function getRandomQuestions(
  certificationId: string,
  count: number = 5
) {
  try {
    // Get total count first
    const { count: totalCount } = await supabase
      .from('exam_questions')
      .select('*', { count: 'exact', head: true })
      .eq('certification_id', certificationId);

    if (!totalCount || totalCount === 0) {
      return { data: [], error: null };
    }

    // Generate random offsets
    const randomOffsets = new Set<number>();
    while (randomOffsets.size < Math.min(count, totalCount)) {
      randomOffsets.add(Math.floor(Math.random() * totalCount));
    }

    // Fetch questions at random positions
    const questions = [];
    for (const offset of randomOffsets) {
      const { data } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('certification_id', certificationId)
        .range(offset, offset)
        .single();
      
      if (data) questions.push(data);
    }

    return { data: questions, error: null };
  } catch (error: any) {
    console.error('Error fetching random questions:', error);
    return { data: null, error: error.message };
  }
}

// ============================================
// FLASHCARD OPERATIONS
// ============================================

export async function getFlashcardDecksByCertification(certificationId: string) {
  try {
    const { data, error } = await supabase
      .from('flashcard_decks')
      .select('*')
      .eq('certification_id', certificationId)
      .eq('is_public', true)
      .order('title');

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching flashcard decks:', error);
    return { data: null, error: error.message };
  }
}

export async function getAllFlashcardDecks(category?: string) {
  try {
    let query = supabase
      .from('flashcard_decks')
      .select('*')
      .eq('is_public', true)
      .order('title');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching flashcard decks:', error);
    return { data: null, error: error.message };
  }
}

export async function getFlashcardsByDeck(deckId: string) {
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deckId)
      .order('order_index');

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching flashcards:', error);
    return { data: null, error: error.message };
  }
}

// ============================================
// PRACTICE SESSION OPERATIONS
// ============================================

export async function createPracticeSession(
  userId: string,
  certificationId: string
) {
  try {
    const { data, error } = await supabase
      .from('user_practice_sessions')
      .insert({
        user_id: userId,
        certification_id: certificationId,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating practice session:', error);
    return { data: null, error: error.message };
  }
}

export async function updatePracticeSession(
  sessionId: string,
  updates: {
    questions_attempted?: number;
    questions_correct?: number;
    score_percentage?: number;
    time_spent_seconds?: number;
    completed_at?: string;
    session_data?: any;
  }
) {
  try {
    const { data, error } = await supabase
      .from('user_practice_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating practice session:', error);
    return { data: null, error: error.message };
  }
}

export async function recordQuestionAttempt(
  userId: string,
  questionId: string,
  sessionId: string,
  selectedAnswer: string,
  correctAnswer: string,
  timeSpent: number
) {
  try {
    const { data, error } = await supabase
      .from('user_question_attempts')
      .insert({
        user_id: userId,
        question_id: questionId,
        session_id: sessionId,
        selected_answer: selectedAnswer,
        is_correct: selectedAnswer === correctAnswer,
        time_spent_seconds: timeSpent,
        attempted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error recording question attempt:', error);
    return { data: null, error: error.message };
  }
}

export async function getUserPracticeSessions(
  userId: string,
  certificationId?: string
) {
  try {
    let query = supabase
      .from('user_practice_sessions')
      .select(`
        *,
        certifications(name, provider)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (certificationId) {
      query = query.eq('certification_id', certificationId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching practice sessions:', error);
    return { data: null, error: error.message };
  }
}

// ============================================
// FLASHCARD PROGRESS OPERATIONS
// ============================================

export async function getUserFlashcardProgress(
  userId: string,
  deckId: string
) {
  try {
    const { data, error } = await supabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('deck_id', deckId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching flashcard progress:', error);
    return { data: null, error: error.message };
  }
}

export async function updateFlashcardProgress(
  userId: string,
  deckId: string,
  updates: {
    cards_reviewed?: number;
    cards_mastered?: number;
  }
) {
  try {
    const { data, error } = await supabase
      .from('user_flashcard_progress')
      .upsert({
        user_id: userId,
        deck_id: deckId,
        ...updates,
        last_reviewed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating flashcard progress:', error);
    return { data: null, error: error.message };
  }
}

export async function createFlashcardReviewSession(
  userId: string,
  deckId: string
) {
  try {
    const { data, error } = await supabase
      .from('flashcard_review_sessions')
      .insert({
        user_id: userId,
        deck_id: deckId,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating flashcard review session:', error);
    return { data: null, error: error.message };
  }
}

export async function updateFlashcardReviewSession(
  sessionId: string,
  updates: {
    cards_reviewed?: number;
    cards_correct?: number;
    time_spent_seconds?: number;
    completed_at?: string;
  }
) {
  try {
    const { data, error } = await supabase
      .from('flashcard_review_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating flashcard review session:', error);
    return { data: null, error: error.message };
  }
}

// ============================================
// AI-GENERATED CONTENT OPERATIONS
// ============================================

export async function saveAIGeneratedQuestions(
  certificationId: string,
  questions: Array<{
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    explanation: string;
    difficulty: string;
  }>
) {
  try {
    const questionsWithCertId = questions.map((q, index) => ({
      ...q,
      certification_id: certificationId,
      question_number: index + 1
    }));

    const { data, error } = await supabase
      .from('exam_questions')
      .insert(questionsWithCertId)
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error saving AI questions:', error);
    return { data: null, error: error.message };
  }
}

export async function saveAIGeneratedFlashcardDeck(
  certificationId: string,
  title: string,
  description: string,
  category: string,
  flashcards: Array<{
    question: string;
    answer: string;
    hint?: string;
    difficulty?: string;
  }>,
  userId?: string
) {
  try {
    // Create the deck
    const { data: deck, error: deckError } = await supabase
      .from('flashcard_decks')
      .insert({
        certification_id: certificationId,
        title,
        description,
        card_count: flashcards.length,
        category,
        is_public: true,
        created_by: userId || null
      })
      .select()
      .single();

    if (deckError) throw deckError;

    // Add flashcards to the deck
    const flashcardsWithDeckId = flashcards.map((card, index) => ({
      ...card,
      deck_id: deck.id,
      order_index: index
    }));

    const { data: cards, error: cardsError } = await supabase
      .from('flashcards')
      .insert(flashcardsWithDeckId)
      .select();

    if (cardsError) throw cardsError;

    return { data: { deck, cards }, error: null };
  } catch (error: any) {
    console.error('Error saving AI flashcards:', error);
    return { data: null, error: error.message };
  }
}

// ============================================
// STATISTICS AND ANALYTICS
// ============================================

export async function getUserStats(userId: string, certificationId?: string) {
  try {
    let query = supabase
      .from('user_practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    if (certificationId) {
      query = query.eq('certification_id', certificationId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate statistics
    const stats = {
      total_sessions: data.length,
      total_questions: data.reduce((sum, s) => sum + s.questions_attempted, 0),
      total_correct: data.reduce((sum, s) => sum + s.questions_correct, 0),
      average_score: data.length > 0 
        ? data.reduce((sum, s) => sum + s.score_percentage, 0) / data.length 
        : 0,
      total_time_minutes: Math.round(
        data.reduce((sum, s) => sum + s.time_spent_seconds, 0) / 60
      )
    };

    return { data: stats, error: null };
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return { data: null, error: error.message };
  }
}
