'use client';

import React, { useState } from 'react';
import { MeetingData, ChatMessage } from '../types';
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  ScreenShareIcon,
  SparklesIcon,
  SendIcon,
  ShieldCheckIcon,
  PhoneOffIcon,
  MaximizeIcon,
} from '../InlineIcons';

interface ConceptProps {
  data: MeetingData;
  chatMessages: ChatMessage[];
  chatInput: string;
  isTyping: boolean;
  onChatInputChange: (val: string) => void;
  onSendMessage: (text?: string) => void;
  quickPrompts: string[];
}

export function FocusRoom({
  data,
  chatMessages,
  chatInput,
  isTyping,
  onChatInputChange,
  onSendMessage,
  quickPrompts,
}: ConceptProps) {
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [hudTab, setHudTab] = useState<'copilot' | 'transcript' | 'decisions'>('copilot');

  return (
    <div
      style={{
        backgroundColor: '#0A0E17',
        color: '#E2E8F0',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      }}
      className="w-full rounded-2xl border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col min-h-[820px]"
    >
      {/* Cinematic HUD Top Bar */}
      <header className="px-6 py-3.5 bg-[#0F172A]/90 backdrop-blur-md border-b border-[#1E293B] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F5A0] shadow-[0_0_8px_#00F5A0] animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest text-[#00F5A0] uppercase font-bold">
              FOCUS ROOM · STAGE HUD
            </span>
          </div>
          <span className="text-[#334155]">|</span>
          <h1 className="text-base sm:text-lg font-sans font-bold text-white tracking-tight m-0">
            {data.title}
          </h1>
          <span className="text-[11px] font-sans px-2 py-0.5 rounded bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/30 font-medium">
            {data.topic}
          </span>
        </div>

        {/* HUD Telemetry Badges */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#1E293B]/70 border border-[#334155] text-slate-300">
            <span className="text-[#00F5A0]">REC</span>
            <span className="font-bold text-white">{data.timeElapsed}</span>
            <span className="text-slate-500">/ {data.totalDuration}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1E293B]/50 text-slate-400 border border-slate-800">
            <span>BITRATE:</span>
            <span className="text-white font-bold">4.2 Mbps</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/20 font-bold">
            <span>AI: ACTIVE</span>
          </div>
        </div>
      </header>

      {/* Main Theater Stage & Translucent Side Rail */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Dominant Presenter Stage (8 cols on lg) */}
        <main className="lg:col-span-8 bg-[#0B0F17] p-4 sm:p-6 flex flex-col justify-between gap-4 overflow-y-auto">
          {/* Maya Chen Dominant Stage Window */}
          <div className="relative rounded-2xl bg-[#111827] border border-[#1F2937] overflow-hidden flex-1 flex flex-col shadow-inner min-h-[420px]">
            {/* Top Stage Overlay Badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-[#00F5A0] text-black shadow-[0_0_12px_rgba(0,245,160,0.5)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                  PRESENTING · MAYA CHEN
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-black/60 backdrop-blur-md text-[#38BDF8] border border-cyan-500/30">
                  TOPIC: NOVEMBER LAUNCH PLAN
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-black/60 text-slate-400 text-[10px] font-mono">
                  1080P60
                </span>
                <span className="w-7 h-7 rounded bg-black/60 border border-slate-700 text-slate-300 flex items-center justify-center">
                  <MaximizeIcon size={13} />
                </span>
              </div>
            </div>

            {/* Stage Center Presentation Display */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 bg-radial from-[#1E293B]/60 via-[#111827] to-[#0A0E17] text-center">
              <div className="max-w-xl w-full text-left space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800 pb-2">
                  <span>CANARY ROLLOUT ARCHITECTURE // PRODUCTION</span>
                  <span className="text-[#00F5A0]">REGION: US-EAST-1 &amp; EU-WEST</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-sans font-extrabold text-white tracking-tight">
                  Canary Phase 1 Gate &amp; Automated Circuit Breaker
                </h2>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-black/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">TRAFFIC ALLOCATION</div>
                    <div className="text-lg font-bold text-[#00F5A0]">5% Strict Cap</div>
                    <div className="text-[11px] text-slate-500">Duration: 48 Hours</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/50 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">ROLLBACK CEILING</div>
                    <div className="text-lg font-bold text-[#FF6B6B]">&gt; 200ms p99</div>
                    <div className="text-[11px] text-slate-500">Error rate &gt; 0.05%</div>
                  </div>
                </div>

                {/* Simulated Telemetry Audio Bar */}
                <div className="p-3 rounded-lg bg-black/40 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-[#00F5A0] animate-pulse" />
                    <span>Maya Chen audio stream: <strong>&ldquo;Enforcing 5% canary gate&rdquo;</strong></span>
                  </div>
                  <div className="flex items-center gap-1 h-3">
                    {[40, 75, 95, 60, 80, 50, 90, 65, 45].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-[#00F5A0] rounded-full"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Bottom Maya Chen Inset + Compact Attendee Rail */}
            <div className="p-4 bg-[#0F172A]/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {/* Maya Chen Bio Tag */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(45,106,79,0.5)]">
                    MC
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#00F5A0] border-2 border-black flex items-center justify-center">
                    <MicIcon size={8} className="text-black" />
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-sans flex items-center gap-2">
                    Maya Chen
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#00F5A0] font-mono">
                      SPEAKER
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans">
                    Head of Product · Presenting in sample
                  </div>
                </div>
              </div>

              {/* Compact Horizontal / Rail Attendee Badges: Liam, Priya, Alex */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase mr-1 hidden sm:inline">
                  Listeners:
                </span>
                {data.attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/60 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
                  >
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: attendee.avatarBg }}
                    >
                      {attendee.avatarInitials}
                    </div>
                    <div className="hidden md:block">
                      <div className="text-[11px] font-bold text-slate-200">{attendee.name.split(' ')[0]}</div>
                    </div>
                    <MicOffIcon size={11} className="text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Agenda Progress Strip on Theater Bottom */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
            {data.agenda.map((item, idx) => {
              const isCurrent = item.status === 'active';
              const isDone = item.status === 'completed';
              return (
                <div
                  key={item.id}
                  className={`p-2 rounded-lg border ${
                    isCurrent
                      ? 'bg-[#1E293B] border-[#00F5A0] text-[#00F5A0] shadow-[0_0_8px_rgba(0,245,160,0.2)]'
                      : isDone
                      ? 'bg-black/40 border-slate-800 text-slate-400'
                      : 'bg-black/20 border-slate-800/60 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span>TOPIC 0{idx + 1}</span>
                    <span>{isDone ? 'DONE' : isCurrent ? 'LIVE' : 'QUEUE'}</span>
                  </div>
                  <div className="text-[11px] font-sans font-semibold truncate text-slate-200">
                    {item.title}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Translucent Side HUD: Live Copilot, Transcript, Decisions (4 cols on lg) */}
        <aside className="lg:col-span-4 bg-[#0F172A]/80 backdrop-blur-xl border-l border-[#1E293B] flex flex-col justify-between overflow-hidden">
          {/* Side Panel Tabs */}
          <div className="p-3 bg-black/40 border-b border-[#1E293B] flex gap-1 font-mono text-xs">
            <button
              onClick={() => setHudTab('copilot')}
              className={`flex-1 py-1.5 px-2 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 ${
                hudTab === 'copilot'
                  ? 'bg-[#00F5A0] text-black shadow-[0_0_10px_rgba(0,245,160,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SparklesIcon size={12} />
              COPILOT HUD
            </button>
            <button
              onClick={() => setHudTab('transcript')}
              className={`flex-1 py-1.5 px-2 rounded-md font-bold transition-all ${
                hudTab === 'transcript'
                  ? 'bg-[#1E293B] text-[#00D2FF] border border-[#00D2FF]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TRANSCRIPT
            </button>
            <button
              onClick={() => setHudTab('decisions')}
              className={`flex-1 py-1.5 px-2 rounded-md font-bold transition-all ${
                hudTab === 'decisions'
                  ? 'bg-[#1E293B] text-amber-400 border border-amber-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              DECISIONS
            </button>
          </div>

          {/* Side Panel Content Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
            {hudTab === 'copilot' && (
              <>
                <div className="p-2.5 rounded-lg bg-black/50 border border-cyan-500/30 text-[11px] font-mono text-[#00D2FF] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] animate-ping" />
                  <span>SYNTHESIS ENGINE ONLINE // LOCAL DEMO UI</span>
                </div>

                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-500 mb-1">
                      {msg.sender === 'user' ? '&gt; USER' : '&gt; MINUTEMATE_AI'} [{msg.timestamp}]
                    </span>
                    <div
                      className={`p-3 rounded-xl max-w-[94%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#1E293B] text-white border border-slate-700'
                          : 'bg-black/60 text-slate-200 border border-emerald-500/30 shadow-[0_0_12px_rgba(0,245,160,0.06)]'
                      }`}
                    >
                      <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-1 items-center font-mono text-[10px]">
                          <span className="text-[#00F5A0]">EVIDENCE:</span>
                          {msg.citations.map((c) => (
                            <span key={c} className="px-1.5 py-0.2 rounded bg-black text-[#00D2FF] border border-cyan-900">
                              @{c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#00F5A0] animate-pulse">
                    <span>&gt; MINUTEMATE: PARSING AUDIO TELEMETRY...</span>
                  </div>
                )}
              </>
            )}

            {hudTab === 'transcript' && (
              <div className="space-y-2 font-mono text-xs">
                {data.transcript.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-lg border ${
                      item.isHighlighted
                        ? 'bg-black/70 border-emerald-500/40 text-emerald-300'
                        : 'bg-black/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-bold text-white">{item.speaker}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="m-0 leading-relaxed font-sans text-xs">{item.text}</p>
                  </div>
                ))}
              </div>
            )}

            {hudTab === 'decisions' && (
              <div className="space-y-3 font-sans">
                {data.decisions.map((dec) => (
                  <div
                    key={dec.id}
                    className="p-3 rounded-xl bg-black/60 border border-emerald-500/40 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#00F5A0] mb-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheckIcon size={12} />
                        FORMAL DECISION
                      </span>
                      <span>[{dec.citationTimestamp}]</span>
                    </div>
                    <div className="font-bold text-white text-sm mb-1">{dec.title}</div>
                    <p className="text-slate-300 text-xs leading-relaxed m-0">{dec.description}</p>
                  </div>
                ))}

                {data.actionProposals.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-black/50 border border-amber-500/30 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-amber-400 mb-1">
                      <span>ACTION PROPOSAL ({act.confidenceScore}%)</span>
                      <span>{act.dueDate}</span>
                    </div>
                    <div className="font-semibold text-slate-100 text-xs mb-1">{act.title}</div>
                    <div className="text-[11px] text-slate-400">
                      Owner: <strong className="text-white">{act.owner}</strong> · [{act.citationTimestamp}]
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assistant Input Bar */}
          <div className="p-3 bg-black/60 border-t border-[#1E293B]">
            <div className="flex flex-wrap gap-1 mb-2">
              {quickPrompts.slice(0, 2).map((p) => (
                <button
                  key={p}
                  onClick={() => onSendMessage(p)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E293B] text-slate-300 hover:text-[#00F5A0] border border-slate-700 hover:border-[#00F5A0] transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder="Type query to Copilot..."
                value={chatInput}
                onChange={(e) => onChatInputChange(e.target.value)}
                className="flex-1 text-xs font-mono px-3 py-2 rounded-lg bg-black/70 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#00F5A0]"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#00F5A0] text-black hover:bg-[#00D2FF] font-bold transition-colors"
                title="Send query"
              >
                <SendIcon size={14} />
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* Floating Glassmorphic Meeting Dock */}
      <footer className="px-6 py-3 bg-[#0B0F17] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#00F5A0]" />
          <span>Cinematic Focus Room Stage · Keyboard &amp; Telemetry Ready</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-colors ${
              micMuted
                ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                : 'bg-black/60 border-slate-700 text-white hover:border-[#00F5A0]'
            }`}
          >
            {micMuted ? <MicOffIcon size={14} /> : <MicIcon size={14} />}
            <span>{micMuted ? 'UNMUTE' : 'MUTE'}</span>
          </button>

          <button
            onClick={() => setCamOff(!camOff)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-bold transition-colors ${
              camOff
                ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                : 'bg-black/60 border-slate-700 text-white hover:border-[#00F5A0]'
            }`}
          >
            {camOff ? <VideoOffIcon size={14} /> : <VideoIcon size={14} />}
            <span>{camOff ? 'CAM ON' : 'CAM OFF'}</span>
          </button>

          <button
            className="px-3 py-1.5 rounded-lg border bg-black/60 border-slate-700 text-white flex items-center gap-1.5 hover:border-[#00D2FF] transition-colors"
          >
            <ScreenShareIcon size={14} />
            <span>SHARE</span>
          </button>

          <button
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold flex items-center gap-1.5 hover:bg-red-700 transition-colors"
          >
            <PhoneOffIcon size={14} />
            <span>DISCONNECT</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
