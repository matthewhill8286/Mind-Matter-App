import { Tables, TablesInsert, TablesUpdate } from '@/types/database.types';

export type MoodCheckIn = Tables<'moods'>;
export type MoodCheckInInsert = TablesInsert<'moods'>;
export type MoodCheckInUpdate = TablesUpdate<'moods'>;

export type JournalEntry = Tables<'journals'>;
export type JournalEntryInsert = TablesInsert<'journals'>;
export type JournalEntryUpdate = TablesUpdate<'journals'>;

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
  quickPhrase: 'This feeling will pass. I can take one small step.',
  triggers: ['Work pressure', 'Conflict', 'Uncertainty'],
  helpfulActions: ['4-7-8 breathing', 'Short walk', 'Cold water on wrists'],
  people: ['A friend', 'A family member'],
  notes: '',
  level: 5,
};
