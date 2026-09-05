/**
 * lib/ai/chat.ts
 * Server Action: AI Study Assistant prompt handler.
 *
 * Uses the Gemini REST API so the API key remains server-side.
 */

"use server";

import { GoogleGenAI } from "@google/genai";
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

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
}

function getGeminiClient() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  return new GoogleGenAI({ apiKey });
}

async function generateGeminiResponse(
  message: string,
  subject: string,
  history: ChatMessage[]
) {
  const ai = getGeminiClient();

  const contents = [
    ...history.slice(-12).map((item) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: {
      systemInstruction: `You are a patient, accurate academic tutor. The student's selected subject is ${subject}. Answer the student's actual question directly and explain your reasoning at an appropriate student level. Only answer questions that are meaningfully related to ${subject}. If the question is outside ${subject}, politely say that you can only help with ${subject} and invite the student to ask a ${subject} question. Do not pretend an unrelated question is part of ${subject}. Use plain text and readable sections; use LaTeX only when it genuinely helps with mathematics or science.`,
      temperature: 0.35,
      maxOutputTokens: 800,
    },
  });

  const reply =
    response.text?.trim() ||
    response.candidates
      ?.map((candidate) => candidate.content?.parts?.map((part) => part.text || "").join("") || "")
      .join("")
      .trim();

  if (!reply) throw new Error("Gemini returned an empty response.");
  return reply;
}

export interface GenerateSpeechResult {
  audioBase64: string;
  mimeType: string;
}

export async function generateSpeech(text: string): Promise<GenerateSpeechResult> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: GEMINI_TTS_MODEL,
    contents: [{ role: "user", parts: [{ text }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Kore" },
        },
      },
    },
  });

  const audioPart = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
  if (!audioPart?.inlineData?.data) throw new Error("Gemini returned no audio.");

  return {
    audioBase64: audioPart.inlineData.data,
    mimeType: audioPart.inlineData.mimeType || "audio/L16;rate=24000",
  };
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
  history: ChatMessage[] = [],
  subject = "General Studies"
): Promise<SendMessageResult> {
  let activeChatId = chatId;
  // Persistence is optional for the local demo; AI responses should still work without a signed-in user.
  try {
    const supabase = (await createClient()) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      if (!activeChatId) {
        const { data: newChat } = await supabase
          .from("ai_chats")
          .insert({ student_id: user.id, title: message.slice(0, 60) || "New Chat" })
          .select("id")
          .single();
        activeChatId = newChat?.id || "";
      }

      if (activeChatId) {
        await supabase.from("ai_messages").insert({
          chat_id: activeChatId,
          sender: "user",
          content: message,
        });
      }
    }
  } catch (err) {
    console.warn("[sendStudyMessage] Chat persistence skipped:", err);
  }

  try {
    const reply = await generateGeminiResponse(message, subject, history);

    if (activeChatId) {
      try {
        const supabase = (await createClient()) as any;
        await supabase.from("ai_messages").insert({
          chat_id: activeChatId,
          sender: "assistant",
          content: reply,
        });
      } catch (err) {
        console.warn("[sendStudyMessage] Assistant message persistence skipped:", err);
      }
    }

    return { reply, chatId: activeChatId };
  } catch (err) {
    console.error("[sendStudyMessage] Gemini error:", err);
    return {
      reply: "",
      chatId: activeChatId,
      error: err instanceof Error ? err.message : "Unable to generate a response.",
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

