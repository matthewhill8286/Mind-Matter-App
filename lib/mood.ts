import AsyncStorage from "@react-native-async-storage/async-storage";

export type MoodCheckIn = {
  id: string;
  createdAt: string; // ISO
  mood: "Great" | "Good" | "Okay" | "Low" | "Bad";
  energy: 1 | 2 | 3 | 4 | 5;
  stress: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  note?: string;
  tags?: string[];
};

const KEY = "mood:checkins:v1";

export async function listMoodCheckIns(): Promise<MoodCheckIn[]> {
  const raw = await AsyncStorage.getItem(KEY);
  const items = raw ? (JSON.parse(raw) as MoodCheckIn[]) : [];
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addMoodCheckIn(item: MoodCheckIn): Promise<void> {
  const raw = await AsyncStorage.getItem(KEY);
  const items = raw ? (JSON.parse(raw) as MoodCheckIn[]) : [];
  items.push(item);
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function deleteMoodCheckIn(id: string): Promise<void> {
  const raw = await AsyncStorage.getItem(KEY);
  const items = raw ? (JSON.parse(raw) as MoodCheckIn[]) : [];
  await AsyncStorage.setItem(KEY, JSON.stringify(items.filter((x) => x.id !== id)));
}

export async function clearMoodCheckIns(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
