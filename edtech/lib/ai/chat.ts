/**
 * lib/ai/chat.ts
 * Server Action: AI Study Assistant prompt handler.
 *
 * Phase 1 — placeholder implementation that returns a mock response.
 * Phase 2 — swap `generateMockResponse` with a real LLM call:
 *
 *   import OpenAI from "openai";
 *   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *   const completion = await openai.chat.completions.create({ ... });
 *
 * or via Google Gemini:
 *   import { GoogleGenerativeAI } from "@google/generative-ai";
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import type { MessageSender } from "@/lib/supabase/types";

export interface ChatMessage {
  role: MessageSender;
  content: string;
}

export interface SendMessageResult {
  reply: string;
  chatId: string;
  error?: string;
}

/**
 * Sends a user message to the AI study assistant and persists both
 * the user message and the AI reply to `ai_messages`.
 *
 * @param chatId  - Existing chat session ID (or "" to create a new one)
 * @param message - The user's prompt text
 * @param history - Recent message history for context window
 */
export async function sendStudyMessage(
  chatId: string,
  message: string,
  history: ChatMessage[] = []
): Promise<SendMessageResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

  // ── Auth guard ────────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { reply: "", chatId, error: "Not authenticated" };
  }

  try {
    // ── Create chat session if needed ────────────────────────────────────────
    let activeChatId = chatId;

    if (!activeChatId) {
      const { data: newChat, error: chatErr } = await supabase
        .from("ai_chats")
        .insert({ student_id: user.id, title: message.slice(0, 60) || "New Chat" })
        .select("id")
        .single();

      if (chatErr || !newChat) throw chatErr ?? new Error("Failed to create chat");
      activeChatId = (newChat as { id: string }).id;
    }

    // ── Persist user message ─────────────────────────────────────────────────
    await supabase
      .from("ai_messages")
      .insert({ chat_id: activeChatId, sender: "user", content: message });

    // ── Generate AI reply ─────────────────────────────────────────────────────
    // TODO (Phase 2): replace with real LLM call using `history` + `message`
    const reply = generateMockResponse(message, history);

    // ── Persist AI reply ──────────────────────────────────────────────────────
    await supabase
      .from("ai_messages")
      .insert({ chat_id: activeChatId, sender: "assistant", content: reply });

    return { reply, chatId: activeChatId };
  } catch (err) {
    console.error("[sendStudyMessage]", err);
    return {
      reply: "",
      chatId,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Fetches the full message history for a given chat session.
 */
export async function getChatHistory(chatId: string): Promise<ChatMessage[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;

  const { data, error } = await supabase
    .from("ai_messages")
    .select("sender, content")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as Array<{ sender: string; content: string }>).map((m) => ({
    role: m.sender as MessageSender,
    content: m.content,
  }));
}

// ─── Mock response (Phase 1 only) ────────────────────────────────────────────
const MOCK_RESPONSES = [
  "Great question! Let me break this down step by step…",
  "This is a fundamental concept. Here's how I'd explain it:",
  "That's an interesting topic. The key points to remember are:",
  "Let's work through this together. First, consider the core principle:",
  "Based on your question, the most important thing to understand is:",
];

function generateMockResponse(message: string, _history: ChatMessage[]): string {
  const opener = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  const wordCount = message.split(" ").length;
  return (
    `${opener}\n\n` +
    `*(This is a placeholder response for Phase 1. Connect an LLM in \`lib/ai/chat.ts\` to enable real AI responses.)*\n\n` +
    `Your question had ${wordCount} word${wordCount !== 1 ? "s" : ""}. The AI will analyse your full chat history and subject context once integrated.`
  );
}
