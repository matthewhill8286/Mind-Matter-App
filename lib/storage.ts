import AsyncStorage from '@react-native-async-storage/async-storage';

export type SessionV1 = {
  email: string;
  token: string;
  created_at: string;
  userId?: string; // may be missing for legacy sessions
};

export type Session = Required<Omit<SessionV1, 'userId'>> & { userId: string };

export const SESSION_KEY = 'auth:session:v1';

function generateUserId() {
  // Lightweight unique ID generator without external deps
  const rand = Math.random().toString(36).slice(2);
  const time = Date.now().toString(36);
  return `usr_${time}${rand}`;
}

export async function readSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  let parsed: SessionV1;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed) return null;
  if (!parsed.token) return null;
  if (!parsed.userId) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
  }
  const { email, token, created_at, userId } = parsed as Session;
  return { email, token, created_at, userId };
}

export async function writeSession(
  input: Partial<Pick<Session, 'userId'>> &
    Omit<Session, 'created_at' | 'userId'> & { created_at?: string },
) {
  const created_at = input.created_at || new Date().toISOString();
  const userId = input.userId || generateUserId();
  const session: Session = { ...(input as any), userId, created_at } as Session;
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export const userScopedKey = (baseKey: string, userId?: string | null) => {
  return userId ? `${baseKey}:${userId}` : baseKey;
};
