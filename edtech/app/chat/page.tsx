"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  Volume2,
  Pause,
  LoaderCircle,
} from "lucide-react";
import { useUser } from "@/context/user-context";
import Link from "next/link";
import { generateSpeech, sendStudyMessage } from "@/lib/ai/chat";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  formula?: string;
  steps?: string[];
  timestamp: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    selectedIndex?: number;
  };
}

const CHAT_HISTORY = [
  "Quadratic Equations",
  "Photosynthesis Process",
  "Data Structures in JS",
  "Essay: The Environment",
  "Chemical Bonding",
];

const SUBJECTS = [
  "Mathematics",
  "Biology",
  "Computer Science",
  "Chemistry",
  "Economics",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg_user_1",
    sender: "user",
    text: "Explain the quadratic formula and how to use it in solving equations.",
    timestamp: "10:14 AM",
  },
  {
    id: "msg_ai_1",
    sender: "assistant",
    text: "The quadratic formula is used to solve equations of the form ax² + bx + c = 0. It is given by:",
    formula: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
    steps: [
      "Identify a, b, and c coefficients from your equation.",
      "Substitute values into the quadratic formula.",
      "Simplify under the radical to determine real or complex roots.",
    ],
    timestamp: "10:15 AM",
  },
];

function pcmToWav(base64: string, mimeType: string) {
  const binary = atob(base64);
  const pcm = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    pcm[index] = binary.charCodeAt(index);
  }

  const sampleRate = Number(mimeType.match(/rate=(\d+)/)?.[1] || 24000);
  const wav = new ArrayBuffer(44 + pcm.length);
  const view = new DataView(wav);
  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, pcm.length, true);
  new Uint8Array(wav, 44).set(pcm);

  return new Blob([wav], { type: "audio/wav" });
}

export default function ChatPage() {
  const { user, resetAiMessages } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [chatId, setChatId] = useState("");
  const [speechUrls, setSpeechUrls] = useState<Record<string, string>>({});
  const [speechLoadingId, setSpeechLoadingId] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUrlsRef = useRef<Record<string, string>>({});
  const chatSessionRef = useRef(0);

  useEffect(() => {
    const savedSubject = localStorage.getItem("eduhub_selected_subject");
    if (savedSubject && SUBJECTS.includes(savedSubject)) {
      setSelectedSubject(savedSubject);
    }
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    speechUrlsRef.current = speechUrls;
  }, [speechUrls]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      Object.values(speechUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

<<<<<<< HEAD
  const startNewChat = () => {
    chatSessionRef.current += 1;
    audioRef.current?.pause();
    Object.values(speechUrlsRef.current).forEach((url) => URL.revokeObjectURL(url));
    setMessages([]);
    setInput("");
    setChatId("");
    setIsTyping(false);
    setSpeechUrls({});
    setSpeechLoadingId(null);
    setPlayingMessageId(null);
    setSpeechError(null);
  };

  const maxMessages = user.subscriptionTier === "free" ? 5 : user.subscriptionTier === "plus" ? 50 : 999999;
  const isLimitReached = aiMessagesCount >= maxMessages && user.subscriptionTier === "free";
=======
>>>>>>> 96ebfd2 (payment)

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text || isTyping) return;

<<<<<<< HEAD
    const chatSession = chatSessionRef.current;

    if (isLimitReached) {
      alert("You have reached your daily Free tier limit (5 queries). Upgrade to Plus or Pro for more!");
      return;
    }

=======
>>>>>>> 96ebfd2 (payment)
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    const history = messages.map((item) => ({
      role: item.sender,
      content: item.text,
    }));

    let result;
    try {
      result = await sendStudyMessage(chatId, text, history, selectedSubject);
    } catch (error) {
      result = {
        chatId,
        reply: "",
        error: error instanceof Error ? error.message : "Unable to contact the AI service.",
      };
    }

    if (chatSession !== chatSessionRef.current) return;

    const botMsg: ChatMessage = {
      id: `ai_${Date.now()}`,
      sender: "assistant",
      text: result.error
        ? `I couldn't generate a response right now. ${result.error}`
        : result.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatId(result.chatId);
    setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
  };

  const handleQuizSelect = (messageId: string, optionIndex: number) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.quiz) {
          return {
            ...msg,
            quiz: { ...msg.quiz, selectedIndex: optionIndex },
          };
        }
        return msg;
      })
    );
  };

  const handleListen = async (message: ChatMessage) => {
    setSpeechError(null);

    if (playingMessageId === message.id) {
      audioRef.current?.pause();
      setPlayingMessageId(null);
      return;
    }

    audioRef.current?.pause();
    let audioUrl = speechUrls[message.id];

    try {
      if (!audioUrl) {
        setSpeechLoadingId(message.id);
        const result = await generateSpeech(message.text);
        audioUrl = URL.createObjectURL(pcmToWav(result.audioBase64, result.mimeType));
        setSpeechUrls((previous) => ({ ...previous, [message.id]: audioUrl }));
      }

      const audio = new Audio(audioUrl);
      audio.onended = () => setPlayingMessageId(null);
      audio.onerror = () => {
        setPlayingMessageId(null);
        setSpeechError("This answer could not be played.");
      };
      audioRef.current = audio;
      await audio.play();
      setPlayingMessageId(message.id);
    } catch (error) {
      setSpeechError(error instanceof Error ? error.message : "Unable to generate audio.");
    } finally {
      setSpeechLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-7.5rem)] flex gap-5">
      {/* ── Left Chat History Sidebar matching Visual Plan #2 ───────────────── */}
      <div className="hidden md:flex w-64 learn-card p-4 flex-col justify-between shrink-0 bg-white">
        <div className="space-y-4">
          <button
            onClick={() => {
              startNewChat();
              resetAiMessages();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> New Chat
          </button>

          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Chat History
            </span>
            <div className="space-y-1">
              {CHAT_HISTORY.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(`Review ${item}`)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium truncate transition-all cursor-pointer ${
                    idx === 0
                      ? "bg-[#EEF2FF] text-[#4F46E5] font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-center">
          <span className="text-[11px] text-[#4F46E5] font-bold hover:underline cursor-pointer">
            View all history
          </span>
        </div>
      </div>

      {/* ── Main Chat Area matching Visual Plan #2 ─────────────────────────── */}
      <div className="flex-1 learn-card flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">AI Study Assistant</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-slate-400">Subject:</span>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    const nextSubject = e.target.value;
                    localStorage.setItem("eduhub_selected_subject", nextSubject);
                    setSelectedSubject(nextSubject);
                    startNewChat();
                  }}
                  className="text-xs font-semibold text-[#4F46E5] bg-transparent border-none focus:outline-none cursor-pointer"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">
              {user.subscriptionTier === "pro" ? (
                <span className="text-[#4F46E5] font-bold">✨ Unlimited Pro AI</span>
              ) : (
                <span>
                  Unlimited AI access
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "assistant" && (
                <div className="h-7 w-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                  msg.sender === "user"
                    ? "bg-[#4F46E5] text-white font-medium rounded-tr-xs"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.sender === "assistant" && (
                  <button
                    type="button"
                    onClick={() => handleListen(msg)}
                    disabled={speechLoadingId === msg.id}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-1.5 text-[11px] font-semibold text-[#4F46E5] transition-colors hover:bg-[#E0E7FF] disabled:cursor-wait disabled:opacity-60"
                    title={playingMessageId === msg.id ? "Pause audio" : "Read this answer aloud"}
                  >
                    {speechLoadingId === msg.id ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : playingMessageId === msg.id ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                    {speechLoadingId === msg.id ? "Preparing audio..." : playingMessageId === msg.id ? "Pause" : "Listen"}
                  </button>
                )}

                {/* Mathematical Formula Card matching Visual Plan #2 */}
                {msg.formula && (
                  <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-serif text-sm font-bold text-slate-900">
                    <span className="tracking-wide">{msg.formula}</span>
                  </div>
                )}

                {/* Steps Breakdown matching Visual Plan #2 */}
                {msg.steps && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 block">Steps:</span>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      {msg.steps.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Quiz card if present */}
                {msg.quiz && (
                  <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl">
                    <p className="font-bold text-slate-900 mb-2">{msg.quiz.question}</p>
                    <div className="space-y-1.5">
                      {msg.quiz.options.map((opt, i) => {
                        const isSelected = msg.quiz?.selectedIndex === i;
                        const isCorrect = i === msg.quiz?.correctIndex;
                        const hasAnswered = msg.quiz?.selectedIndex !== undefined;

                        let btnStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-100";
                        if (hasAnswered) {
                          if (isCorrect) btnStyle = "bg-emerald-50 border-emerald-300 text-emerald-800";
                          else if (isSelected) btnStyle = "bg-rose-50 border-rose-300 text-rose-800";
                        }

                        return (
                          <button
                            key={opt}
                            disabled={hasAnswered}
                            onClick={() => handleQuizSelect(msg.id, i)}
                            className={`w-full text-left p-2 rounded-lg text-xs border font-medium flex items-center justify-between transition-colors ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {hasAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                            {hasAnswered && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-rose-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <span className="text-[9px] opacity-40 mt-1 block text-right">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {speechError && <p className="text-center text-[11px] text-rose-600">{speechError}</p>}

          {isTyping && (
            <div className="flex gap-2.5 items-center text-xs text-slate-400">
              <Bot className="h-4 w-4 text-[#4F46E5] animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips matching Visual Plan #2: Explain Concept, Quiz Me, Homework Help */}
        <div className="px-6 py-2.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          {[
            { label: "Explain Concept", prompt: "Explain the quadratic formula step-by-step" },
            { label: "Quiz Me", prompt: "Quiz me on quadratic equations" },
            { label: "Homework Help", prompt: "Give me a hint for solving ax² + bx + c = 0" },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleSend(chip.prompt)}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] border border-[#C7D2FE] transition-colors whitespace-nowrap cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              disabled={isTyping}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-slate-100/80 border border-slate-200 rounded-full px-5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="h-10 w-10 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-40 text-white flex items-center justify-center shadow-sm shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
