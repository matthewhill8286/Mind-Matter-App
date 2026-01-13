export type ChatMessage = { role: "user" | "assistant"; content: string };

const SERVER_URL = "http://localhost:8787"; // change to LAN IP for real device

export async function sendChat(params: {
    issueKey: string;
    issueTitle?: string;
    issueTags?: string[];
    messages: ChatMessage[];
}) {
    const r = await fetch(`${SERVER_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });

    if (!r.ok) throw new Error(await r.text());
    return (await r.json()) as { text: string };
}
