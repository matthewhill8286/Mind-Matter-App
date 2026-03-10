// ── Convenience aliases ──────────────────────────────────────
// These provide friendly names for the generated row / insert / update types
// so the rest of the codebase can import e.g. `Sport` instead of `Tables<'sports'>`.

// Users
import { Tables, TablesInsert, TablesUpdate }  from "./database.types";

// Experience level (not a DB enum, but used throughout the app)
export type ExperienceLevel = 'recreational' | 'competitive' | 'elite'

// Journal prompts
export type JournalPrompt = Tables<'journal_prompts'>

export type UserProfile = Tables<'users'>
export type UserProfileInsert = TablesInsert<'users'>
export type UserProfileUpdate = TablesUpdate<'users'>

// Sports
export type Sport = Tables<'sports'>

// Mood logs
export type MoodLog = Tables<'mood_logs'>
export type MoodLogInsert = TablesInsert<'mood_logs'>

// Journal entries
export type JournalEntry = Tables<'journal_entries'>
export type JournalEntryInsert = TablesInsert<'journal_entries'>

// Journal prompts
export type JournalPrompt = Tables<'journal_prompts'>

// Experience level (not a DB enum, but used throughout the app)
export type ExperienceLevel = 'recreational' | 'competitive' | 'elite'
