import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';

export type MoodCheckIn = Tables<'mood_logs'>;
export type MoodCheckInInsert = TablesInsert<'mood_logs'>;
export type MoodCheckInUpdate = TablesUpdate<'mood_logs'>;

export type JournalEntry = Tables<'journal_entries'>;
export type JournalEntryInsert = TablesInsert<'journal_entries'>;
export type JournalEntryUpdate = TablesUpdate<'journal_entries'>;

export type JournalPrompt = Tables<'journal_prompts'>;
export type Sport = Tables<'sports'>;

export type StressKit = Tables<'stress_kits'>;
export type StressKitInsert = TablesInsert<'stress_kits'>;
export type StressKitUpdate = TablesUpdate<'stress_kits'>;

export type StressCompletion = Tables<'stress_histories'>;
export type StressCompletionInsert = TablesInsert<'stress_histories'>;
export type StressCompletionUpdate = TablesUpdate<'stress_histories'>;

export type MindfulEntry = Tables<'mindfulness'>;
export type MindfulEntryInsert = TablesInsert<'mindfulness'>;
export type MindfulEntryUpdate = TablesUpdate<'mindfulness'>;

export type SleepEntry = Tables<'sleep'>;
export type SleepEntryInsert = TablesInsert<'sleep'>;
export type SleepEntryUpdate = TablesUpdate<'sleep'>;

export type UserProfile = Tables<'profiles'>;
export type UserProfileInsert = TablesInsert<'profiles'>;
export type UserProfileUpdate = TablesUpdate<'profiles'>;

export type Assessment = Tables<'assessments'>;
export type AssessmentInsert = TablesInsert<'assessments'>;
export type AssessmentUpdate = TablesUpdate<'assessments'>;

export type ChatHistory = Tables<'chat_histories'>;
export type ChatHistoryInsert = TablesInsert<'chat_histories'>;
export type ChatHistoryUpdate = TablesUpdate<'chat_histories'>;

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  text?: string;
  created_at: string;
};

export const DEFAULT_KIT: Partial<StressKit> = {
  quick_phrase: 'This feeling will pass. I can take one small step.',
  triggers: ['Work pressure', 'Conflict', 'Uncertainty'],
  helpful_actions: ['4-7-8 breathing', 'Short walk', 'Cold water on wrists'],
  people: ['A friend', 'A family member'],
  notes: '',
  level: 5,
};
