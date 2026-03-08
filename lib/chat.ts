import { apiFetch } from './api';

export async function sendChatToAI(
  issueTitle: string,
  issueTags: string[],
  messages: { role: string; content: string }[],
): Promise<string> {
  const data = await apiFetch<{ text: string }>(`/chat`, {
    method: 'POST',
    body: JSON.stringify({ issueTitle, issueTags, messages }),
  });
  return data.text;
}
