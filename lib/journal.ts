import AsyncStorage from "@react-native-async-storage/async-storage";

export type JournalEntry = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  body: string;
  mood?: string | null;
  tags?: string[];
  promptId?: string | null;
};

const KEY = "journal:entries:v1";

export async function listEntries(): Promise<JournalEntry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  const entries = raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  return entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getEntry(id: string): Promise<JournalEntry | null> {
  const raw = await AsyncStorage.getItem(KEY);
  const entries = raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  return entries.find((e) => e.id === id) ?? null;
}

export async function upsertEntry(entry: JournalEntry): Promise<void> {
  const raw = await AsyncStorage.getItem(KEY);
  const all = raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  const idx = all.findIndex((e) => e.id === entry.id);
  if (idx >= 0) all[idx] = entry;
  else all.push(entry);
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

export async function deleteEntry(id: string): Promise<void> {
  const raw = await AsyncStorage.getItem(KEY);
  const all = raw ? (JSON.parse(raw) as JournalEntry[]) : [];
  await AsyncStorage.setItem(KEY, JSON.stringify(all.filter((e) => e.id !== id)));
}
