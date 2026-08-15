import React, { useState, useEffect, useReducer, useRef, useMemo, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, Check, Timer, BarChart3, Grid3x3, Brain, ListChecks, 
  CheckCircle2, Circle, Plus, Trash2, Award, Zap, AlertCircle, 
  Flame, Calendar, Target, Clock, Activity, X, Volume2, VolumeX,
  Keyboard, ArrowRight, Sparkles, Bell, BellRing, RefreshCw, Shield, HelpCircle,
  TrendingUp, CheckSquare
} from 'lucide-react';

// ==========================================
// WEB AUDIO SYNTHESIZER (Cyberpunk FX)
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  play(type) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'xp') {
        const freqs = [587.33, 739.99, 880.00, 1174.66];
        freqs.forEach((f, i) => {
          const nOsc = this.ctx.createOscillator();
          const nGain = this.ctx.createGain();
          nOsc.connect(nGain);
          nGain.connect(this.ctx.destination);
          nOsc.type = 'triangle';
          nOsc.frequency.setValueAtTime(f, now + i * 0.05);
          nGain.gain.setValueAtTime(0.08, now + i * 0.05);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.12);
          nOsc.start(now + i * 0.05);
          nOsc.stop(now + i * 0.05 + 0.12);
        });
      } else if (type === 'alarm') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.linearRampToValueAtTime(350, now + 0.18);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (e) {
      console.warn("Audio error", e);
    }
  }
}

const soundEngine = new SoundEngine();

// ==========================================
// CONSTANTS & UTILITIES
// ==========================================
const TODAY_STR = "2026-08-15";

const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

const formatTime = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const SUBJECTS = ['Math', 'Physics', 'Chemistry', 'Biology', 'Arabic', 'English'];

const SUBJECT_THEMES = {
  Math: {
    color: 'emerald',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    ring: 'stroke-emerald-400',
    glow: 'shadow-[0_0_50px_rgba(16,185,129,0.35)]',
    pillActive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    bar: 'bg-emerald-500'
  },
  Physics: {
    color: 'cyan',
    text: 'text-cyan-400',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
    ring: 'stroke-cyan-400',
    glow: 'shadow-[0_0_50px_rgba(6,182,212,0.35)]',
    pillActive: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    bar: 'bg-cyan-500'
  },
  Chemistry: {
    color: 'violet',
    text: 'text-violet-400',
    border: 'border-violet-500/40',
    bg: 'bg-violet-500/10',
    ring: 'stroke-violet-400',
    glow: 'shadow-[0_0_50px_rgba(139,92,246,0.35)]',
    pillActive: 'bg-violet-500/20 text-violet-300 border-violet-500/60 shadow-[0_0_15px_rgba(139,92,246,0.2)]',
    bar: 'bg-violet-500'
  },
  Biology: {
    color: 'rose',
    text: 'text-rose-400',
    border: 'border-rose-500/40',
    bg: 'bg-rose-500/10',
    ring: 'stroke-rose-400',
    glow: 'shadow-[0_0_50px_rgba(244,63,94,0.35)]',
    pillActive: 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
    bar: 'bg-rose-500'
  },
  Arabic: {
    color: 'amber',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    ring: 'stroke-amber-400',
    glow: 'shadow-[0_0_50px_rgba(245,158,11,0.35)]',
    pillActive: 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    bar: 'bg-amber-500'
  },
  English: {
    color: 'blue',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    ring: 'stroke-blue-400',
    glow: 'shadow-[0_0_50px_rgba(59,130,246,0.35)]',
    pillActive: 'bg-blue-500/20 text-blue-300 border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    bar: 'bg-blue-500'
  }
};

// ==========================================
// 7 SPACED REPETITION MASTERY STAGES
// ==========================================
const SR_STAGES = [
  { level: 1, interval: 1, name: 'Fresh Encoding', desc: '+1 Day Recall' },
  { level: 2, interval: 3, name: 'Short-Term Consolidation', desc: '+3 Days Recall' },
  { level: 3, interval: 7, name: 'Synaptic Stabilization', desc: '+7 Days Recall' },
  { level: 4, interval: 14, name: 'Active Recall Drill', desc: '+14 Days Recall' },
  { level: 5, interval: 30, name: 'Long-Term Retention', desc: '+30 Days Recall' },
  { level: 6, interval: 60, name: 'Permanent Storage', desc: '+60 Days Recall' },
  { level: 7, interval: 90, name: 'Neural Permanent Mastery', desc: 'Fully Mastered' }
];

// ==========================================
// 8 EXPANDED GRINDSET RANKS
// ==========================================
const GRINDSET_RANKS = [
  { minXp: 0, maxXp: 100, name: 'Unranked Slacker', tier: 'Lvl 1', color: 'text-zinc-400', badge: 'bg-zinc-800/50 border-zinc-700/50', next: 'Dopamine Detoxer' },
  { minXp: 100, maxXp: 250, name: 'Dopamine Detoxer', tier: 'Lvl 2', color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30', next: 'Desk Grinder' },
  { minXp: 250, maxXp: 500, name: 'Desk Grinder', tier: 'Lvl 3', color: 'text-cyan-400', badge: 'bg-cyan-500/10 border-cyan-500/30', next: 'Deep Work Monk' },
  { minXp: 500, maxXp: 1000, name: 'Deep Work Monk', tier: 'Lvl 4', color: 'text-blue-400', badge: 'bg-blue-500/10 border-blue-500/30', next: 'Focus Overlord' },
  { minXp: 1000, maxXp: 2000, name: 'Focus Overlord', tier: 'Lvl 5', color: 'text-violet-400', badge: 'bg-violet-500/10 border-violet-500/30', next: 'Exam Executioner' },
  { minXp: 2000, maxXp: 3500, name: 'Exam Executioner', tier: 'Lvl 6', color: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30', next: 'Synapse Overclocker' },
  { minXp: 3500, maxXp: 5000, name: 'Synapse Overclocker', tier: 'Lvl 7', color: 'text-fuchsia-400', badge: 'bg-fuchsia-500/10 border-fuchsia-500/30', next: 'Sads 100 — God Mode' },
  { minXp: 5000, maxXp: 5000, name: 'Sads 100 — God Mode', tier: 'Lvl 8 MAX', color: 'text-rose-400', badge: 'bg-rose-500/10 border-rose-500/30 glow-rose', next: 'MAX TIER' }
];

const getRankInfo = (xp) => {
  for (let i = 0; i < GRINDSET_RANKS.length; i++) {
    const r = GRINDSET_RANKS[i];
    if (i === GRINDSET_RANKS.length - 1 || xp < r.maxXp) {
      const range = r.maxXp - r.minXp;
      const progress = range > 0 ? Math.min(100, Math.round(((xp - r.minXp) / range) * 100)) : 100;
      return {
        ...r,
        progress,
        current: r.name
      };
    }
  }
  return {
    ...GRINDSET_RANKS[0],
    progress: 0,
    current: GRINDSET_RANKS[0].name
  };
};

// ==========================================
// 100% CLEAN INITIAL ZERO STATE
// ==========================================
const getCleanState = () => ({
  activeTab: 'focus',
  emergencyMode: false,
  timerRunning: false,
  timerSeconds: 0,
  activeSubject: 'Math',
  customTopic: '',
  sessions: [],
  topics: [],
  tasks: [],
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  audioEnabled: false,
  notificationsEnabled: false
});

// ==========================================
// REDUCER
// ==========================================
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'TOGGLE_EMERGENCY':
      soundEngine.play('alarm');
      return { ...state, emergencyMode: !state.emergencyMode };
    case 'TOGGLE_AUDIO': {
      const next = !state.audioEnabled;
      soundEngine.enabled = next;
      if (next) soundEngine.play('click');
      return { ...state, audioEnabled: next };
    }
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notificationsEnabled: !state.notificationsEnabled };
    case 'RESET_ALL_DATA':
      return getCleanState();
    case 'SET_TIMER':
      return { ...state, timerSeconds: action.payload };
    case 'TOGGLE_TIMER':
      soundEngine.play('click');
      return { ...state, timerRunning: !state.timerRunning };
    case 'START_TIMER_FOR_TOPIC':
      soundEngine.play('click');
      return {
        ...state,
        activeTab: 'focus',
        activeSubject: action.payload.subject || state.activeSubject,
        customTopic: action.payload.topic || '',
        timerRunning: true
      };
    case 'RESET_TIMER':
      soundEngine.play('click');
      return { ...state, timerSeconds: 0, timerRunning: false };
    case 'SET_SUBJECT':
      soundEngine.play('click');
      return { ...state, activeSubject: action.payload };
    case 'SET_TOPIC':
      return { ...state, customTopic: action.payload };
    
    // Log Focus Session
    case 'LOG_SESSION': {
      const duration = state.timerSeconds;
      if (duration === 0) return state;

      soundEngine.play('xp');
      const newSession = {
        id: `sess-${Date.now()}`,
        subject: state.activeSubject,
        topic: state.customTopic.trim() || `${state.activeSubject} Deep Session`,
        duration,
        date: TODAY_STR,
        timestamp: Date.now()
      };

      let newStreak = state.streak;
      if (state.lastStudyDate !== TODAY_STR) {
        if (state.lastStudyDate === addDays(TODAY_STR, -1)) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      const earnedXp = Math.max(10, Math.floor(duration / 60) * 10);

      return {
        ...state,
        sessions: [newSession, ...state.sessions],
        timerSeconds: 0,
        timerRunning: false,
        streak: newStreak,
        lastStudyDate: TODAY_STR,
        xp: state.xp + earnedXp
      };
    }

    // Spaced Repetition Actions (7 Stages)
    case 'ADD_TOPIC': {
      soundEngine.play('click');
      const topic = {
        id: `top-${Date.now()}`,
        subject: action.payload.subject,
        name: action.payload.name,
        dateAdded: TODAY_STR,
        stage: 1, // Stage 1 of 7
        reviews: [TODAY_STR],
        nextReview: addDays(TODAY_STR, 1),
        status: 'upcoming'
      };
      return { 
        ...state, 
        topics: [topic, ...state.topics],
        xp: state.xp + 15 
      };
    }
    case 'REVIEW_TOPIC': {
      soundEngine.play('xp');
      const topics = state.topics.map(t => {
        if (t.id === action.payload) {
          const nextStageNum = Math.min(7, (t.stage || 1) + 1);
          const stageConfig = SR_STAGES[nextStageNum - 1] || SR_STAGES[6];
          const isMastered = nextStageNum >= 7;
          const nextReview = addDays(TODAY_STR, stageConfig.interval);

          return {
            ...t,
            stage: nextStageNum,
            reviews: [...t.reviews, TODAY_STR],
            nextReview: isMastered ? null : nextReview,
            status: isMastered ? 'mastered' : 'upcoming'
          };
        }
        return t;
      });
      return { 
        ...state, 
        topics,
        xp: state.xp + 50 
      };
    }
    case 'DELETE_TOPIC':
      return { ...state, topics: state.topics.filter(t => t.id !== action.payload) };

    // Hit-List Actions
    case 'ADD_TASK':
      soundEngine.play('click');
      return {
        ...state,
        tasks: [
          { 
            id: `tsk-${Date.now()}`, 
            text: action.payload.text, 
            priority: action.payload.priority || 'standard',
            completed: false, 
            date: TODAY_STR 
          },
          ...state.tasks
        ]
      };
    case 'TOGGLE_TASK': {
      const target = state.tasks.find(t => t.id === action.payload);
      const isCompleting = target && !target.completed;
      if (isCompleting) soundEngine.play('xp');
      else soundEngine.play('click');
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload ? { ...t, completed: !t.completed } : t),
        xp: isCompleting ? state.xp + 25 : Math.max(0, state.xp - 25)
      };
    }
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };

    default:
      return state;
  }
};

// ==========================================
// MODULE 1: LIVE FOCUS ENGINE (WIDESCREEN 2-COLUMN)
// ==========================================
const FocusEngine = ({ state, dispatch, onReward }) => {
  const currentTheme = SUBJECT_THEMES[state.activeSubject] || SUBJECT_THEMES.Math;

  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = ((state.timerSeconds % 3600) / 3600) * 100;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  const todaySessions = state.sessions.filter(s => s.date === TODAY_STR);
  const todaySeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const targetSeconds = 6 * 3600;
  const todayProgress = Math.min(100, (todaySeconds / targetSeconds) * 100);

  const pendingTasks = state.tasks.filter(t => !t.completed);

  const handleLogSession = () => {
    if (state.timerSeconds === 0) return;
    const earnedXp = Math.max(10, Math.floor(state.timerSeconds / 60) * 10);
    onReward(`+${earnedXp} XP`);
    dispatch({ type: 'LOG_SESSION' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: LIVE FOCUS DIAL & SUBJECT CONSOLE (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          
          {/* Radial Timer Dial */}
          <div className="relative flex items-center justify-center my-2">
            <div className={`relative flex items-center justify-center w-72 h-72 sm:w-84 sm:h-84 rounded-full transition-all duration-700 ${state.timerRunning ? currentTheme.glow : ''}`}>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 320 320">
                <circle 
                  cx="160" cy="160" r={radius} 
                  className="stroke-zinc-900" 
                  strokeWidth="10" 
                  fill="none" 
                />
                <circle 
                  cx="160" cy="160" r={radius} 
                  className={`transition-all duration-500 ease-out ${state.timerRunning ? currentTheme.ring : 'stroke-zinc-800'}`} 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>

              <div className="z-10 flex flex-col items-center select-none text-center px-4 max-w-[240px] sm:max-w-[270px]">
                <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  {formatTime(state.timerSeconds)}
                </span>

                <div className="mt-3 flex items-center justify-center">
                  <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${currentTheme.pillActive}`}>
                    {state.activeSubject}
                  </span>
                </div>

                {state.customTopic && (
                  <span className="text-xs text-zinc-400 mt-2 font-medium truncate max-w-[210px] block">
                    {state.customTopic}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-5 my-4">
            <button 
              onClick={() => dispatch({ type: 'RESET_TIMER' })}
              disabled={state.timerSeconds === 0}
              title="Reset Timer (R)"
              className="p-4 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all disabled:opacity-20 disabled:pointer-events-none touch-target"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button 
              onClick={() => dispatch({ type: 'TOGGLE_TIMER' })}
              title={state.timerRunning ? "Pause Timer (Space)" : "Start Timer (Space)"}
              className={`p-6 rounded-full transition-all transform hover:scale-105 active:scale-95 touch-target shadow-xl ${state.timerRunning ? 'bg-zinc-800 text-amber-400 border border-amber-500/40 glow-amber' : 'bg-emerald-500 text-zinc-950 glow-emerald font-bold'}`}
            >
              {state.timerRunning ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-0.5" />}
            </button>

            <button 
              onClick={handleLogSession}
              disabled={state.timerSeconds === 0}
              title="Log Focus Session"
              className="p-4 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-zinc-900 transition-all disabled:opacity-20 disabled:pointer-events-none touch-target"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>

          {/* Subject & Custom Topic Selector */}
          <div className="w-full max-w-lg bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3 mt-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <span>Target Subject</span>
              <span className="text-zinc-600 font-mono">Live Sync</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SUBJECTS.map(sub => {
                const isSelected = state.activeSubject === sub;
                const theme = SUBJECT_THEMES[sub];
                return (
                  <button
                    key={sub}
                    onClick={() => dispatch({ type: 'SET_SUBJECT', payload: sub })}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all touch-target border text-center ${isSelected ? theme.pillActive : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'}`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>

            <div>
              <input 
                type="text" 
                placeholder="Topic / Chapter (e.g. Past Paper Traps, Ch 4)" 
                value={state.customTopic}
                onChange={(e) => dispatch({ type: 'SET_TOPIC', payload: e.target.value })}
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all"
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TODAY'S LIVE GRIND (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Daily Goal & Metrics Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Today's Target Progress
              </h3>
              <span className="text-xs font-mono text-zinc-500">Goal: 6.0h</span>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Logged Today</span>
                <div className="text-2xl font-mono font-bold text-zinc-100">
                  {formatTime(todaySeconds).slice(0, 5)} <span className="text-xs text-zinc-500 font-sans">hrs</span>
                </div>
                <span className="text-xs text-emerald-400/90 font-medium block">
                  {Math.max(0, 6 - (todaySeconds / 3600)).toFixed(1)}h left to hit daily goal
                </span>
              </div>

              {/* Target Ring */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="stroke-zinc-800"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="stroke-emerald-400 transition-all duration-700"
                    strokeDasharray={`${todayProgress}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono text-xs font-bold text-zinc-100">
                  {Math.round(todayProgress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Today's Focus History */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Today's Session Logs ({todaySessions.length})
            </h3>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {todaySessions.map(s => {
                const theme = SUBJECT_THEMES[s.subject] || SUBJECT_THEMES.Math;
                return (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${theme.pillActive}`}>
                        {s.subject}
                      </span>
                      <span className="text-zinc-200 font-medium truncate max-w-[140px] sm:max-w-[200px]">
                        {s.topic}
                      </span>
                    </div>
                    <span className="font-mono text-zinc-300 font-bold">
                      {formatTime(s.duration)}
                    </span>
                  </div>
                );
              })}
              {todaySessions.length === 0 && (
                <div className="p-6 text-center text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-xl">
                  No sessions logged yet today. Press Start to grind!
                </div>
              )}
            </div>
          </div>

          {/* Quick Task Queue Preview */}
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-violet-400" />
                Quick Priority Hit-List ({pendingTasks.length})
              </h3>
              <button 
                onClick={() => dispatch({ type: 'SET_TAB', payload: 'hitlist' })}
                className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center"
              >
                View all <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pendingTasks.slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center justify-between p-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <button 
                      onClick={() => {
                        onReward('+25 XP');
                        dispatch({ type: 'TOGGLE_TASK', payload: t.id });
                      }}
                      className="text-zinc-500 hover:text-violet-400 p-0.5"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <span className="text-zinc-300 font-medium truncate">{t.text}</span>
                  </div>
                  <button 
                    onClick={() => dispatch({ type: 'START_TIMER_FOR_TOPIC', payload: { topic: t.text } })}
                    title="Focus on this task now"
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="p-4 text-center text-zinc-600 text-xs">
                  All priority tasks clear!
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

// ==========================================
// MODULE 2: ANALYTICS & STATS (8-TIER GRINDSET ENGINE)
// ==========================================
const Analytics = ({ state }) => {
  const todaySessions = state.sessions.filter(s => s.date === TODAY_STR);
  const todaySeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  
  const weekStart = addDays(TODAY_STR, -7);
  const weekSessions = state.sessions.filter(s => s.date >= weekStart);
  const weekSeconds = weekSessions.reduce((acc, s) => acc + s.duration, 0);

  const targetSeconds = 6 * 3600;
  const todayProgress = Math.min(100, (todaySeconds / targetSeconds) * 100);

  const subjectTimes = weekSessions.reduce((acc, s) => {
    acc[s.subject] = (acc[s.subject] || 0) + s.duration;
    return acc;
  }, {});

  const rankInfo = getRankInfo(state.xp);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pb-28">
      
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>Today</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-mono font-bold text-zinc-100">{formatTime(todaySeconds).slice(0, 5)}</span>
            <span className="text-xs text-zinc-500 ml-1">hrs</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-2 font-medium">
            {todaySessions.length} session{todaySessions.length === 1 ? '' : 's'} logged
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>7-Day Total</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-mono font-bold text-zinc-100">{(weekSeconds / 3600).toFixed(1)}</span>
            <span className="text-xs text-zinc-500 ml-1">hours</span>
          </div>
          <div className="text-[11px] text-cyan-400/80 mt-2 font-medium">
            {weekSessions.length} weekly sessions
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between glow-amber">
          <div className="flex items-center justify-between text-amber-500/80 text-xs font-bold uppercase tracking-wider">
            <span>Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-mono font-bold text-amber-400">{state.streak}</span>
            <span className="text-xs text-amber-500/80 ml-1">days on fire</span>
          </div>
          <div className="text-[11px] text-amber-400/70 mt-2 font-medium">
            Target: 6h / day
          </div>
        </div>

        {/* 8-Tier Rank Progress */}
        <div className={`bg-zinc-900/40 border rounded-2xl p-5 flex flex-col justify-between ${rankInfo.badge}`}>
          <div className="flex items-center justify-between text-zinc-500 text-xs font-bold uppercase tracking-wider">
            <span>{rankInfo.tier}</span>
            <Zap className={`w-4 h-4 ${rankInfo.color}`} />
          </div>
          <div className="mt-3">
            <span className={`text-xl font-mono font-bold ${rankInfo.color} truncate block`}>{rankInfo.current}</span>
            <div className="text-xs text-zinc-500 font-mono mt-0.5">{state.xp} XP earned</div>
          </div>
          <div className="mt-2">
            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${rankInfo.progress}%` }}></div>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              {rankInfo.progress}% to {rankInfo.next}
            </span>
          </div>
        </div>
      </div>

      {/* Target Ring & Weekly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center">
              <Target className="w-4 h-4 mr-2 text-emerald-400"/> Daily Target Progress
            </h3>
            <span className="text-xs font-mono text-zinc-500">6.0h Target</span>
          </div>

          <div className="relative w-44 h-44 my-4 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" className="stroke-zinc-800" strokeWidth="8" fill="none" />
              <circle 
                cx="50" cy="50" r="42" 
                className="stroke-emerald-500 transition-all duration-1000 ease-out" 
                strokeWidth="8" fill="none" 
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * todayProgress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-mono font-bold text-zinc-100">{Math.round(todayProgress)}%</span>
              <span className="text-[10px] text-zinc-500 uppercase mt-0.5">Completed</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 text-center text-xs text-zinc-400 bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800/80">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Logged</span>
              <span className="font-mono text-zinc-200 font-bold">{(todaySeconds / 3600).toFixed(1)} hrs</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase">Remaining</span>
              <span className="font-mono text-zinc-200 font-bold">{Math.max(0, 6 - (todaySeconds / 3600)).toFixed(1)} hrs</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 flex flex-col justify-between">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-cyan-400"/> Weekly Subject Breakdown
            </h3>
            <span className="text-xs font-mono text-zinc-500">{(weekSeconds / 3600).toFixed(1)}h Total</span>
          </div>

          <div className="space-y-4 my-auto">
            {SUBJECTS.map(sub => {
              const time = subjectTimes[sub] || 0;
              const perc = weekSeconds > 0 ? (time / weekSeconds) * 100 : 0;
              const theme = SUBJECT_THEMES[sub];
              
              return (
                <div key={sub} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${theme.bar}`}></span>
                      {sub}
                    </span>
                    <span className="text-zinc-400 font-mono">
                      {(time / 3600).toFixed(1)}h <span className="text-zinc-600">({Math.round(perc)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/50">
                    <div 
                      className={`h-full ${theme.bar} transition-all duration-700 rounded-full`} 
                      style={{ width: `${perc}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Sessions Log */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-zinc-300 mb-4 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-violet-400"/> Focus Sessions Log
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {state.sessions.map(sess => {
            const theme = SUBJECT_THEMES[sess.subject] || SUBJECT_THEMES.Math;
            return (
              <div key={sess.id} className="flex items-center justify-between p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${theme.pillActive}`}>
                    {sess.subject}
                  </span>
                  <div>
                    <div className="text-zinc-200 font-medium">{sess.topic}</div>
                    <div className="text-zinc-500 text-[10px] font-mono">{sess.date}</div>
                  </div>
                </div>
                <div className="font-mono text-zinc-300 font-bold">
                  {formatTime(sess.duration)}
                </div>
              </div>
            );
          })}
          {state.sessions.length === 0 && (
            <div className="p-8 text-center text-zinc-600 text-xs">
              No sessions recorded yet. Start studying to build your analytics history!
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

// ==========================================
// MODULE 3: SURVIVAL HEATMAP (ROLLING 40-WEEK MATRIX)
// ==========================================
const SurvivalHeatmap = ({ state }) => {
  const [selectedCell, setSelectedCell] = useState(null);
  const totalDays = 280; // 40 weeks
  
  const dateMap = useMemo(() => {
    const map = {};
    state.sessions.forEach(s => {
      if (!map[s.date]) map[s.date] = { hours: 0, subjects: {} };
      map[s.date].hours += s.duration / 3600;
      map[s.date].subjects[s.subject] = (map[s.date].subjects[s.subject] || 0) + s.duration;
    });
    return map;
  }, [state.sessions]);

  const grid = useMemo(() => {
    const cells = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const dStr = addDays(TODAY_STR, -i);
      const data = dateMap[dStr] || { hours: 0, subjects: {} };
      
      let topSubject = 'None';
      let maxTime = 0;
      Object.entries(data.subjects).forEach(([sub, time]) => {
        if (time > maxTime) { maxTime = time; topSubject = sub; }
      });

      let bgClass = 'bg-zinc-900/90 border-zinc-800/40';
      if (data.hours > 0 && data.hours < 1) bgClass = 'bg-emerald-950/90 border-emerald-900/60';
      else if (data.hours >= 1 && data.hours < 2.5) bgClass = 'bg-emerald-900 border-emerald-700/60';
      else if (data.hours >= 2.5 && data.hours < 4.5) bgClass = 'bg-emerald-700 border-emerald-500/60';
      else if (data.hours >= 4.5 && data.hours < 6) bgClass = 'bg-emerald-500 border-emerald-400/80';
      else if (data.hours >= 6) bgClass = 'bg-emerald-400 border-emerald-300 glow-emerald';

      cells.push({
        date: dStr,
        hours: data.hours,
        topSubject,
        bgClass
      });
    }
    return cells;
  }, [dateMap]);

  const cols = 40;
  const rows = 7;
  const gridTransposed = useMemo(() => {
    const transposed = Array.from({ length: rows }, () => Array(cols).fill(null));
    grid.forEach((day, index) => {
      const col = Math.floor(index / rows);
      const row = index % rows;
      if (col < cols) {
        transposed[row][col] = day;
      }
    });
    return transposed;
  }, [grid]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pb-28">
      
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center">
              <Grid3x3 className="w-5 h-5 mr-2 text-emerald-400"/> Survival Contribution Heatmap
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Rolling 40-Week (280-Day) Academic Consistency Matrix.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>0h</span>
            <div className="w-3.5 h-3.5 rounded bg-zinc-900 border border-zinc-800"></div>
            <div className="w-3.5 h-3.5 rounded bg-emerald-950 border border-emerald-900"></div>
            <div className="w-3.5 h-3.5 rounded bg-emerald-900 border border-emerald-700"></div>
            <div className="w-3.5 h-3.5 rounded bg-emerald-700 border border-emerald-500"></div>
            <div className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-400"></div>
            <div className="w-3.5 h-3.5 rounded bg-emerald-400 border border-emerald-300"></div>
            <span>6h+</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[860px]">
            
            <div className="flex justify-between text-[11px] font-mono text-zinc-500 mb-3 pl-8 pr-2">
              <span>9 Months Ago</span>
              <span>6 Months Ago</span>
              <span>3 Months Ago</span>
              <span>1 Month Ago</span>
              <span className="text-emerald-400 font-bold">Today</span>
            </div>

            <div className="flex">
              <div className="flex flex-col justify-between mr-2 text-[10px] font-mono text-zinc-500 py-1">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
                <span>Sun</span>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                {gridTransposed.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1.5">
                    {row.map((cell, cIdx) => cell ? (
                      <div 
                        key={cIdx} 
                        onClick={() => setSelectedCell(cell)}
                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-[3px] border ${cell.bgClass} relative group cursor-pointer transition-transform hover:scale-135 hover:z-20`}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 bg-zinc-950 text-zinc-200 text-xs p-2.5 rounded-xl shadow-2xl whitespace-nowrap border border-zinc-700 pointer-events-none">
                          <div className="font-bold text-zinc-100">{cell.date}</div>
                          <div className="text-emerald-400 font-mono font-semibold">{cell.hours.toFixed(1)} hours studied</div>
                          <div className="text-zinc-400 text-[10px]">Top focus: {cell.topSubject}</div>
                        </div>
                      </div>
                    ) : <div key={cIdx} className="w-4 h-4"></div>)}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {selectedCell && (
        <div className="bg-zinc-900/90 border border-emerald-500/40 rounded-2xl p-5 flex items-center justify-between shadow-2xl animate-scale-in">
          <div>
            <div className="text-xs text-zinc-500 uppercase font-mono">Day Detail Inspect</div>
            <h3 className="text-lg font-bold text-zinc-100 mt-0.5">{selectedCell.date}</h3>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="font-mono text-emerald-400 font-bold">{selectedCell.hours.toFixed(1)} Hours Studied</span>
              <span className="text-zinc-400">• Top: <strong className="text-zinc-200">{selectedCell.topSubject}</strong></span>
            </div>
          </div>
          <button 
            onClick={() => setSelectedCell(null)}
            className="p-2 text-zinc-500 hover:text-zinc-300 bg-zinc-800/80 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

    </div>
  );
};

// ==========================================
// MODULE 4: SPACED REPETITION (7 STAGES + NOTIFICATIONS)
// ==========================================
const SpacedRepetition = ({ state, dispatch, onReward }) => {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topicName, setTopicName] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('due'); // 'due' | 'pipeline' | 'mastered'

  const handleAdd = (e) => {
    e.preventDefault();
    if (!topicName.trim()) return;
    dispatch({ type: 'ADD_TOPIC', payload: { subject, name: topicName.trim() } });
    onReward('+15 XP');
    setTopicName('');
  };

  const processedTopics = useMemo(() => {
    return state.topics.map(t => {
      let status = t.status;
      if (status !== 'mastered') {
        if (t.nextReview && t.nextReview <= TODAY_STR) status = 'due';
        else status = 'upcoming';
      }
      return { ...t, currentStatus: status };
    });
  }, [state.topics]);

  const dueTopics = processedTopics.filter(t => t.currentStatus === 'due');
  const upcomingTopics = processedTopics.filter(t => t.currentStatus === 'upcoming');
  const masteredTopics = processedTopics.filter(t => t.currentStatus === 'mastered');

  const requestBrowserNotification = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          dispatch({ type: 'TOGGLE_NOTIFICATIONS' });
          new Notification("Sads Grindset", {
            body: "Spaced repetition notifications activated! We'll alert you when reviews are due.",
            icon: "/favicon.svg"
          });
        }
      });
    }
  };

  const TopicCard = ({ topic }) => {
    const theme = SUBJECT_THEMES[topic.subject] || SUBJECT_THEMES.Math;
    const isDue = topic.currentStatus === 'due';
    const isMastered = topic.currentStatus === 'mastered';
    const stageNum = topic.stage || 1;
    const currentStageInfo = SR_STAGES[stageNum - 1] || SR_STAGES[0];

    return (
      <div className={`p-4 sm:p-5 rounded-2xl transition-all border ${isDue ? 'bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] glow-cyan' : isMastered ? 'bg-zinc-900/30 border-zinc-800/40 opacity-75' : 'bg-zinc-900/60 border-zinc-800/80'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${theme.pillActive}`}>
                {topic.subject}
              </span>
              <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                Stage {stageNum}/7: {currentStageInfo.name}
              </span>
              {isDue && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  Due Today
                </span>
              )}
            </div>

            <h4 className="text-zinc-100 font-bold text-base sm:text-lg">{topic.name}</h4>

            {/* Stage Progress Bar */}
            <div className="flex items-center gap-2 max-w-md pt-1">
              <div className="flex-1 h-1.5 bg-zinc-950 rounded-full overflow-hidden flex gap-0.5">
                {[1, 2, 3, 4, 5, 6, 7].map(stg => (
                  <div 
                    key={stg} 
                    className={`flex-1 h-full rounded-full transition-all ${stg <= stageNum ? (isMastered ? 'bg-emerald-400' : 'bg-cyan-400') : 'bg-zinc-800'}`}
                  ></div>
                ))}
              </div>
              <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                {isMastered ? 'Mastered' : `Next: ${topic.nextReview || 'N/A'}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* Inline Quick Focus Play Button */}
            <button 
              onClick={() => dispatch({ 
                type: 'START_TIMER_FOR_TOPIC', 
                payload: { subject: topic.subject, topic: `Spaced Recall: ${topic.name}` } 
              })}
              title="Focus on this topic now"
              className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all touch-target"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>

            {isDue && (
              <button 
                onClick={() => {
                  onReward('+50 XP');
                  dispatch({ type: 'REVIEW_TOPIC', payload: topic.id });
                }}
                className="px-5 py-3 bg-cyan-500 text-zinc-950 font-extrabold text-xs rounded-xl hover:bg-cyan-400 transition-all touch-target shadow-lg flex items-center"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Reviewed & Cleared
              </button>
            )}

            <button 
              onClick={() => dispatch({ type: 'DELETE_TOPIC', payload: topic.id })}
              className="p-2.5 text-zinc-600 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in pb-28">
      
      {/* Top Header Notification Alert */}
      {dueTopics.length > 0 && (
        <div className="bg-cyan-950/30 border border-cyan-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="font-bold text-sm text-cyan-300">
                {dueTopics.length} Review{dueTopics.length === 1 ? '' : 's'} Due Today!
              </div>
              <div className="text-xs text-cyan-400/70">
                Active recall window is open. Review now to lock into permanent storage.
              </div>
            </div>
          </div>

          <button 
            onClick={requestBrowserNotification}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors shrink-0"
          >
            {state.notificationsEnabled ? '✓ Alerts Active' : 'Enable Device Alerts'}
          </button>
        </div>
      )}

      {/* Add Topic Form */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
          <span className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            Schedule Topic in 7-Stage Forgetting Curve Engine
          </span>
          <span className="text-zinc-600 font-mono hidden sm:inline">Automatic +1d, +3d, +7d, +14d, +30d, +60d, +90d</span>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <select 
            value={subject} 
            onChange={e => setSubject(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/60 sm:w-44"
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Enter chapter / concept name (e.g. Organic Reaction Conditions)..." 
            value={topicName}
            onChange={e => setTopicName(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/60 flex-1"
          />
          <button 
            type="submit" 
            className="bg-cyan-500 text-zinc-950 px-6 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-colors touch-target flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Topic</span>
          </button>
        </form>

        {/* 7 Mastery Stages Pill Preview */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          {SR_STAGES.map((stg) => (
            <div 
              key={stg.level} 
              className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-500 whitespace-nowrap"
            >
              <strong className="text-cyan-400">L{stg.level}:</strong> {stg.name} ({stg.desc})
            </div>
          ))}
        </div>
      </div>

      {/* Section Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
        <button 
          onClick={() => setActiveTabFilter('due')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTabFilter === 'due' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Due Today ({dueTopics.length})</span>
        </button>
        <button 
          onClick={() => setActiveTabFilter('pipeline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTabFilter === 'pipeline' ? 'bg-zinc-800 text-zinc-100 border border-zinc-700' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          <Calendar className="w-4 h-4 text-zinc-400" />
          <span>Active Pipeline ({upcomingTopics.length})</span>
        </button>
        <button 
          onClick={() => setActiveTabFilter('mastered')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTabFilter === 'mastered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Mastered ({masteredTopics.length})</span>
        </button>
      </div>

      {/* Main List */}
      <div className="space-y-3">
        {activeTabFilter === 'due' && (
          <>
            {dueTopics.map(t => <TopicCard key={t.id} topic={t} />)}
            {dueTopics.length === 0 && (
              <div className="p-12 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl text-zinc-500 text-sm">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/60 mb-3" />
                <div className="font-bold text-zinc-300">All Spaced Reviews Cleared!</div>
                <div className="text-xs text-zinc-500 mt-1">No items currently due for recall today.</div>
              </div>
            )}
          </>
        )}

        {activeTabFilter === 'pipeline' && (
          <>
            {upcomingTopics.map(t => <TopicCard key={t.id} topic={t} />)}
            {upcomingTopics.length === 0 && (
              <div className="p-12 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl text-zinc-500 text-sm">
                No upcoming reviews in the pipeline. Add topics above to begin!
              </div>
            )}
          </>
        )}

        {activeTabFilter === 'mastered' && (
          <>
            {masteredTopics.map(t => <TopicCard key={t.id} topic={t} />)}
            {masteredTopics.length === 0 && (
              <div className="p-12 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl text-zinc-500 text-sm">
                No mastered topics yet. Advance through all 7 stages to achieve permanent mastery!
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

// ==========================================
// MODULE 5: EMERGENCY BUFFER MODE
// ==========================================
const EmergencyBuffer = ({ state, dispatch, onReward }) => {
  const dueTopics = state.topics.filter(t => t.nextReview && t.nextReview <= TODAY_STR && t.status !== 'mastered');
  const pendingTasks = state.tasks.filter(t => !t.completed);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 pb-28 animate-scale-in">
      
      <div className="text-center p-8 bg-rose-950/30 border border-rose-500/60 rounded-3xl glow-rose shadow-2xl">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-3 animate-pulse" />
        <h1 className="text-3xl font-extrabold text-rose-400 uppercase tracking-widest">
          Emergency Buffer Mode
        </h1>
        <p className="text-sm text-rose-300/80 mt-1 max-w-md mx-auto">
          Distraction-free triage mode. Rapid-fire backlog destroyer active.
        </p>
        <div className="flex justify-center gap-4 mt-4 font-mono text-xs font-bold text-rose-400">
          <span>{dueTopics.length} Overdue Reviews</span>
          <span>•</span>
          <span>{pendingTasks.length} Pending Tasks</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Overdue Spaced Repetition Reviews */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2 border-b border-rose-500/30 pb-2">
            <Brain className="w-4 h-4 text-rose-400" />
            Overdue Reviews ({dueTopics.length})
          </h2>

          <div className="space-y-3">
            {dueTopics.map(topic => {
              const theme = SUBJECT_THEMES[topic.subject] || SUBJECT_THEMES.Math;
              return (
                <div key={topic.id} className="bg-rose-950/20 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.pillActive}`}>
                      {topic.subject}
                    </span>
                    <h4 className="text-rose-100 font-semibold mt-1 text-sm">{topic.name}</h4>
                  </div>
                  <button 
                    onClick={() => {
                      onReward('+50 XP');
                      dispatch({ type: 'REVIEW_TOPIC', payload: topic.id });
                    }}
                    className="px-4 py-2 bg-rose-500 text-white font-bold text-xs rounded-xl hover:bg-rose-600 transition-all touch-target shadow-lg"
                  >
                    Clear
                  </button>
                </div>
              );
            })}
            {dueTopics.length === 0 && (
              <div className="p-4 text-center bg-zinc-900/30 rounded-xl text-zinc-500 text-xs">
                No overdue spaced repetition reviews!
              </div>
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2 border-b border-rose-500/30 pb-2">
            <ListChecks className="w-4 h-4 text-rose-400" />
            Pending Tasks ({pendingTasks.length})
          </h2>

          <div className="space-y-3">
            {pendingTasks.map(t => (
              <div key={t.id} className="bg-rose-950/20 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <button 
                    onClick={() => {
                      onReward('+25 XP');
                      dispatch({ type: 'TOGGLE_TASK', payload: t.id });
                    }}
                    className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                  >
                    <Circle className="w-5 h-5" />
                  </button>
                  <span className="text-rose-100 font-medium text-xs sm:text-sm truncate">{t.text}</span>
                </div>
                <button 
                  onClick={() => {
                    onReward('+25 XP');
                    dispatch({ type: 'TOGGLE_TASK', payload: t.id });
                  }}
                  className="px-3.5 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold rounded-lg hover:bg-rose-500 hover:text-white transition-all shrink-0 ml-2"
                >
                  Done
                </button>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <div className="p-4 text-center bg-zinc-900/30 rounded-xl text-zinc-500 text-xs">
                All tasks completed! Buffer is clear.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

// ==========================================
// MODULE 6: HIT-LIST (CLEAN DEDICATED TASK ENGINE)
// ==========================================
const HitList = ({ state, dispatch, onReward, taskInputRef }) => {
  const [taskInput, setTaskInput] = useState('');
  const [priority, setPriority] = useState('standard');
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    dispatch({ type: 'ADD_TASK', payload: { text: taskInput.trim(), priority } });
    setTaskInput('');
  };

  const filteredTasks = useMemo(() => {
    if (filter === 'pending') return state.tasks.filter(t => !t.completed);
    if (filter === 'completed') return state.tasks.filter(t => t.completed);
    return state.tasks;
  }, [state.tasks, filter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in pb-28">
      
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-violet-400" />
            Today's Priority Hit-List
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Execute daily targets with zero excuses. Strike through to earn XP.</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            {state.tasks.filter(t => !t.completed).length} Pending
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            {state.tasks.filter(t => t.completed).length} Completed
          </span>
        </div>
      </div>

      {/* Add Task Card */}
      <form onSubmit={handleAddTask} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            ref={taskInputRef}
            type="text" 
            placeholder="Add priority task (Press 'N' to quick focus)..." 
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-all"
          />

          <div className="flex items-center gap-2">
            <select 
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="urgent">Urgent 🔥</option>
              <option value="high">High ⚡</option>
              <option value="standard">Standard 🎯</option>
            </select>

            <button 
              type="submit" 
              className="bg-violet-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-violet-600 transition-colors touch-target shadow-lg flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-2xl border border-zinc-800/80 text-xs">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all ${filter === 'all' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            All ({state.tasks.length})
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all ${filter === 'pending' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Pending ({state.tasks.filter(t => !t.completed).length})
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all ${filter === 'completed' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Completed ({state.tasks.filter(t => t.completed).length})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.map(t => {
          let priorityBadge = 'bg-zinc-800 text-zinc-400 border-zinc-700';
          if (t.priority === 'urgent') priorityBadge = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
          else if (t.priority === 'high') priorityBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

          return (
            <div 
              key={t.id} 
              className={`flex items-center justify-between gap-3 p-4 bg-zinc-900/40 border rounded-2xl transition-all ${t.completed ? 'border-zinc-800/40 bg-zinc-950/50' : 'border-zinc-800/80 hover:border-zinc-700'}`}
            >
              <div className="flex items-center gap-3.5 flex-1 truncate">
                <button 
                  onClick={() => {
                    if (!t.completed) onReward('+25 XP');
                    dispatch({ type: 'TOGGLE_TASK', payload: t.id });
                  }} 
                  className="text-zinc-500 hover:text-violet-400 transition-colors touch-target p-1 shrink-0"
                >
                  {t.completed ? <CheckCircle2 className="w-5 h-5 text-violet-400" /> : <Circle className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-2.5 truncate">
                  {t.priority && t.priority !== 'standard' && (
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border font-mono ${priorityBadge}`}>
                      {t.priority}
                    </span>
                  )}
                  {/* High contrast readable text */}
                  <span className={`text-sm font-medium transition-all truncate ${t.completed ? 'line-through text-zinc-400' : 'text-zinc-100'}`}>
                    {t.text}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!t.completed && (
                  <button 
                    onClick={() => dispatch({ type: 'START_TIMER_FOR_TOPIC', payload: { topic: t.text } })}
                    title="Focus on this task now"
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 border border-zinc-800/80 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}
                <button 
                  onClick={() => dispatch({ type: 'DELETE_TASK', payload: t.id })} 
                  className="text-zinc-600 hover:text-rose-400 p-2 touch-target transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        {filteredTasks.length === 0 && (
          <div className="p-12 text-center text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-3xl">
            No tasks in this view. Add a task above to keep grinding!
          </div>
        )}
      </div>

    </div>
  );
};

// ==========================================
// SHORTCUTS & RESET MODAL
// ==========================================
const ShortcutsModal = ({ isOpen, onClose, onResetAll }) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm">
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <span>Keyboard Shortcuts & System Control</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <span className="text-zinc-300">Start / Pause Live Timer</span>
            <kbd className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded font-mono text-emerald-400 font-bold">Space</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <span className="text-zinc-300">Reset Timer</span>
            <kbd className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded font-mono text-zinc-200 font-bold">R</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <span className="text-zinc-300">Focus "Add Priority Task" Input</span>
            <kbd className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded font-mono text-violet-400 font-bold">N</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <span className="text-zinc-300">Toggle Emergency Buffer Mode</span>
            <kbd className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded font-mono text-rose-400 font-bold">E</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <span className="text-zinc-300">Toggle Shortcuts HUD</span>
            <kbd className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded font-mono text-zinc-200 font-bold">?</kbd>
          </div>
        </div>

        {/* HARD RESET EVERYTHING TO ZERO */}
        <div className="pt-3 border-t border-zinc-800 space-y-2">
          {!confirmReset ? (
            <button 
              onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Data & Progress to Zero</span>
            </button>
          ) : (
            <div className="space-y-2 p-3 bg-rose-950/30 border border-rose-500/50 rounded-xl text-center">
              <span className="text-xs text-rose-200 font-bold block">Are you sure? All XP, streak & logs will wipe to 0.</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    onResetAll();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="flex-1 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600"
                >
                  Yes, Wipe to Zero
                </button>
                <button 
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const STORAGE_KEY = 'sads-grindset-v3';

  const [state, dispatch] = useReducer(reducer, null, () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...getCleanState(), ...parsed };
        } catch (e) {
          console.error("Failed to parse local storage", e);
        }
      }
    }
    return getCleanState();
  });

  const [rewardTicker, setRewardTicker] = useState(null);
  const [hudOpen, setHudOpen] = useState(false);
  const taskInputRef = useRef(null);

  const showReward = useCallback((label) => {
    setRewardTicker({ label, id: Date.now() });
    setTimeout(() => {
      setRewardTicker(prev => prev?.id === rewardTicker?.id ? null : prev);
    }, 2200);
  }, []);

  // Save state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("LocalStorage write error", e);
    }
  }, [state]);

  // Live Timer Count
  const timerRef = useRef(null);
  useEffect(() => {
    if (state.timerRunning) {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'SET_TIMER', payload: state.timerSeconds + 1 });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.timerRunning, state.timerSeconds]);

  // Global Keyboard Shortcuts (Space, R, N, E, ?)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT';
      
      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_TIMER' });
      }
      if ((e.key === 'r' || e.key === 'R') && !isInput && state.activeTab === 'focus') {
        e.preventDefault();
        dispatch({ type: 'RESET_TIMER' });
      }
      if ((e.key === 'n' || e.key === 'N') && !isInput) {
        e.preventDefault();
        dispatch({ type: 'SET_TAB', payload: 'hitlist' });
        setTimeout(() => taskInputRef.current?.focus(), 50);
      }
      if ((e.key === 'e' || e.key === 'E') && !isInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_EMERGENCY' });
      }
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setHudOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setHudOpen(false);
        document.activeElement?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activeTab]);

  const dueCount = state.topics.filter(t => t.nextReview && t.nextReview <= TODAY_STR && t.status !== 'mastered').length;

  const tabs = [
    { id: 'focus', icon: Timer, label: 'Focus Engine' },
    { id: 'stats', icon: BarChart3, label: 'Analytics' },
    { id: 'heatmap', icon: Grid3x3, label: 'Heatmap' },
    { id: 'spaced', icon: Brain, label: 'Spaced Rep', badge: dueCount > 0 ? dueCount : null },
    { id: 'hitlist', icon: ListChecks, label: 'Hit-List' }
  ];

  const isEmergency = state.emergencyMode;
  const rankInfo = getRankInfo(state.xp);

  return (
    <div className={`min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/30 flex flex-col md:flex-row transition-all duration-500 ${isEmergency ? 'shadow-[inset_0_0_120px_rgba(244,63,94,0.25)] ring-4 ring-rose-500/70' : ''}`}>
      
      {/* Floating XP Ticker Animation */}
      {rewardTicker && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-float-up">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 border border-emerald-400/80 text-emerald-300 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] text-sm font-black font-mono backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>{rewardTicker.label}</span>
          </div>
        </div>
      )}

      {/* Shortcuts & Reset Modal */}
      <ShortcutsModal 
        isOpen={hudOpen} 
        onClose={() => setHudOpen(false)} 
        onResetAll={() => {
          localStorage.removeItem(STORAGE_KEY);
          dispatch({ type: 'RESET_ALL_DATA' });
        }}
      />

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/60 bg-[#0a0a0f] p-5 pt-6 justify-between shrink-0 h-screen sticky top-0">
        <div>
          {/* Brand */}
          <div className="font-extrabold tracking-widest text-base mb-8 flex items-center text-zinc-100">
            <Zap className="w-5 h-5 mr-2.5 text-emerald-400 glow-emerald" />
            <span>SADS GRINDSET</span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = state.activeTab === tab.id && !isEmergency;
              return (
                <button
                  key={tab.id}
                  disabled={isEmergency}
                  onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all font-semibold text-xs tracking-wide ${isActive ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-bold' : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'} disabled:opacity-20 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-zinc-950 font-mono font-black text-[10px] shadow-sm animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Streak + XP + Rank Progression */}
        <div className="pt-4 border-t border-zinc-800/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-mono">Daily Streak</span>
            <span className="flex items-center text-amber-400 font-bold font-mono">
              <Flame className="w-3.5 h-3.5 mr-1 text-amber-500 fill-current" />
              {state.streak} Days
            </span>
          </div>

          {/* Rank Progression Bar */}
          <div className="space-y-1.5 bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800/80">
            <div className="flex items-center justify-between text-[11px]">
              <span className={`font-bold ${rankInfo.color} truncate max-w-[120px]`}>{rankInfo.current}</span>
              <span className="font-mono text-zinc-400 font-semibold">{state.xp} XP</span>
            </div>
            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-500" 
                style={{ width: `${rankInfo.progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>{rankInfo.tier}</span>
              <span>{rankInfo.progress}% to {rankInfo.next.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Top Header Bar */}
        <header className="w-full border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 font-bold tracking-wider text-xs sm:text-sm text-zinc-100">
            <span className="md:hidden flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              SADS GRINDSET
            </span>
            <span className="hidden md:inline text-zinc-400 font-mono text-xs uppercase">
              {isEmergency ? 'EMERGENCY TRIAGE' : tabs.find(t => t.id === state.activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Hard Reset Button */}
            <button 
              onClick={() => setHudOpen(true)}
              title="Reset Data & Shortcuts (?)"
              className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors touch-target flex items-center justify-center"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Audio Toggle */}
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_AUDIO' })}
              title={state.audioEnabled ? "Mute SFX" : "Enable SFX"}
              className={`p-2 rounded-full border transition-all touch-target ${state.audioEnabled ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
            >
              {state.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Emergency Mode Toggle */}
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_EMERGENCY' })}
              className={`flex items-center px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all touch-target border ${isEmergency ? 'bg-rose-500 text-white border-rose-400 glow-rose animate-pulse shadow-lg' : 'bg-zinc-900 text-rose-400/80 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300'}`}
            >
              <AlertCircle className="w-4 h-4 mr-1.5" />
              {isEmergency ? 'Exit Buffer' : 'Emergency Mode'}
            </button>
          </div>
        </header>

        {/* Viewport Area */}
        <main className="flex-1 flex flex-col">
          {isEmergency ? (
            <EmergencyBuffer state={state} dispatch={dispatch} onReward={showReward} />
          ) : (
            <>
              {state.activeTab === 'focus' && <FocusEngine state={state} dispatch={dispatch} onReward={showReward} />}
              {state.activeTab === 'stats' && <Analytics state={state} />}
              {state.activeTab === 'heatmap' && <SurvivalHeatmap state={state} />}
              {state.activeTab === 'spaced' && <SpacedRepetition state={state} dispatch={dispatch} onReward={showReward} />}
              {state.activeTab === 'hitlist' && <HitList state={state} dispatch={dispatch} onReward={showReward} taskInputRef={taskInputRef} />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-[#09090b]/95 backdrop-blur-xl border-t border-zinc-800/80 safe-bottom z-40 transition-transform duration-300 ${isEmergency ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="flex justify-around items-center h-16 px-1 max-w-lg mx-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = state.activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-all touch-target ${isActive ? 'text-emerald-400 font-bold' : 'text-zinc-500'}`}
              >
                <div className={`relative p-1.5 rounded-full ${isActive ? 'bg-emerald-500/10 glow-emerald' : ''}`}>
                  <Icon className="w-5 h-5" />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-cyan-400 text-zinc-950 font-black text-[9px] rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
