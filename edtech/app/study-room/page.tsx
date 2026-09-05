"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Headphones,
  FileText,
  Users,
  CheckCircle2,
  Coffee,
  CloudRain,
  Waves,
  Moon,
} from "lucide-react";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface AmbientSound {
  id: string;
  name: string;
  icon: typeof CloudRain;
  color: string;
}

const AMBIENTS: AmbientSound[] = [
  { id: "rain", name: "Rainy Window", icon: CloudRain, color: "text-blue-500" },
  { id: "cafe", name: "Campus Cafe", icon: Coffee, color: "text-amber-500" },
  { id: "waves", name: "Ocean Waves", icon: Waves, color: "text-cyan-500" },
  { id: "deep", name: "Deep Focus", icon: Moon, color: "text-purple-500" },
];

export default function StudyRoomPage() {
  const [timerMode, setTimerMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(2);

  const [activeAmbient, setActiveAmbient] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.4);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);

  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("All notes saved");

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (timerMode === "pomodoro") {
        setSessionsCompleted((prev) => prev + 1);
        setTimerMode("shortBreak");
        setTimeLeft(5 * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, timerMode]);

  useEffect(() => {
    const saved = localStorage.getItem("eduhub_study_notes");
    if (saved) setNotes(saved);
  }, []);

  const handleNotesChange = (text: string) => {
    setNotes(text);
    setSaveStatus("Saving...");
    localStorage.setItem("eduhub_study_notes", text);
    setTimeout(() => setSaveStatus("All notes saved"), 500);
  };

  const switchMode = (mode: TimerMode) => {
    setTimerMode(mode);
    setIsRunning(false);
    if (mode === "pomodoro") setTimeLeft(25 * 60);
    else if (mode === "shortBreak") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerMode === "pomodoro") setTimeLeft(25 * 60);
    else if (timerMode === "shortBreak") setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const toggleAmbientSound = (soundId: string) => {
    if (activeAmbient === soundId) {
      stopAmbient();
      setActiveAmbient(null);
      return;
    }

    stopAmbient();
    setActiveAmbient(soundId);
    playSynthesizedNoise(soundId);
  };

  const stopAmbient = () => {
    try {
      if (noiseSourceRef.current) {
        noiseSourceRef.current.disconnect();
        noiseSourceRef.current = null;
      }
    } catch {
      // ignore
    }
  };

  const playSynthesizedNoise = (soundId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      if (soundId === "rain") {
        filter.type = "lowpass";
        filter.frequency.value = 800;
      } else if (soundId === "waves") {
        filter.type = "bandpass";
        filter.frequency.value = 400;
      } else if (soundId === "cafe") {
        filter.type = "lowpass";
        filter.frequency.value = 500;
      } else {
        filter.type = "lowpass";
        filter.frequency.value = 250;
      }

      const gain = ctx.createGain();
      gain.gain.value = volume;
      gainNodeRef.current = gain;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseSourceRef.current = whiteNoise;
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Headphones className="h-7 w-7 text-[#4F46E5]" /> Virtual Focus Study Room
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pomodoro focus timer, binaural soundscapes, and synchronized course scratchpad
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full text-emerald-800 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Users className="h-3.5 w-3.5" />
          <span>48 Students Studying Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pomodoro Timer & Ambience (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pomodoro Timer Card */}
          <div className="learn-card p-8 flex flex-col items-center justify-between shadow-sm">
            {/* Mode Selectors */}
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 gap-1 text-xs font-semibold">
              {[
                { id: "pomodoro" as TimerMode, label: "Pomodoro (25m)" },
                { id: "shortBreak" as TimerMode, label: "Short Break (5m)" },
                { id: "longBreak" as TimerMode, label: "Long Break (15m)" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => switchMode(m.id)}
                  className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                    timerMode === m.id
                      ? "bg-[#4F46E5] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="my-10 text-center">
              <span className="text-7xl sm:text-8xl font-black text-slate-900 font-mono tracking-tighter">
                {formatTime(timeLeft)}
              </span>
              <p className="text-xs text-slate-500 mt-3 flex items-center justify-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{sessionsCompleted} focus intervals completed today</span>
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-8 py-3 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                  isRunning
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" /> Start Focus
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                title="Reset Interval"
                className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Ambient Soundscapes Card */}
          <div className="learn-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Headphones className="h-4 w-4 text-[#4F46E5]" /> Ambient Sound Generator
              </h3>
              {activeAmbient && (
                <span className="text-[10px] bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5] animate-ping" /> Playing Audio
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AMBIENTS.map((a) => {
                const Icon = a.icon;
                const isActive = activeAmbient === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAmbientSound(a.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]"
                        : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-[#4F46E5]" : a.color}`} />
                    <span className="text-xs font-bold">{a.name}</span>
                    <span className="text-[10px] text-slate-400">{isActive ? "Tap to Stop" : "Offline Audio"}</span>
                  </button>
                );
              })}
            </div>

            {activeAmbient && (
              <div className="pt-2 flex items-center gap-3">
                <VolumeX className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => {
                    const newVol = parseFloat(e.target.value);
                    setVolume(newVol);
                    if (gainNodeRef.current) gainNodeRef.current.gain.value = newVol;
                  }}
                  className="flex-1 accent-[#4F46E5] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
                <Volume2 className="h-4 w-4 text-[#4F46E5] shrink-0" />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scratchpad & Live Campus Notes (5 cols) */}
        <div className="lg:col-span-5 learn-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#4F46E5]" />
              <h3 className="text-xs font-bold text-slate-900">Study Scratchpad</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{saveStatus}</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Jot down formulas and notes during your study session. Auto-saves to your session storage.
          </p>

          <textarea
            rows={12}
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Type your study notes, exam equations, or questions for your tutor here...

Example:
- MATH 201: Recall that gradient points in direction of steepest ascent.
- BIO 101: Cellular respiration formula = C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O
- CHEM 220: SN2 reaction rate = k[Substrate][Nucleophile]"
            className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 font-mono leading-relaxed placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] resize-none"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                handleNotesChange(
                  notes +
                    "\n\n### AI Quick Summary:\n- Focus block completed at " +
                    new Date().toLocaleTimeString() +
                    "\n- Key formulas retained."
                );
              }}
              className="text-xs text-[#4F46E5] hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" /> Append AI Study Stamp
            </button>

            <button
              onClick={() => handleNotesChange("")}
              className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
            >
              Clear Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
