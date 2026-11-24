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
  CheckIcon,
  ClockIcon,
  SendIcon,
  ShieldCheckIcon,
  PhoneOffIcon,
  UsersIcon,
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

export function OrbitLive({
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
  const [activeTab, setActiveTab] = useState<'copilot' | 'transcript' | 'decisions'>('copilot');

  return (
    <div
      style={{
        backgroundColor: '#0F0A1F',
        color: '#F3E8FF',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      className="w-full rounded-2xl border border-[#38265E] shadow-2xl overflow-hidden flex flex-col min-h-[820px]"
    >
      {/* Cosmic Top Nebula Header */}
      <header className="px-6 py-4 bg-[#191033]/90 backdrop-blur-md border-b border-[#38265E] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A855F7] via-[#EC4899] to-[#FF6B6B] p-0.5 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <div className="w-full h-full bg-[#130E26] rounded-2xl flex items-center justify-center font-bold text-white text-xs">
              OL
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-[#FF6B6B] uppercase">
                ORBIT LIVE · CONSTELLATION STAGE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#A855F7]/20 text-[#D8B4FE] border border-[#A855F7]/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B] animate-ping" />
                Live Pulse
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight m-0">
              {data.title}
            </h1>
          </div>
        </div>

        {/* Orbit Telemetry Pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1 rounded-full bg-[#27184A] border border-[#4C337D] text-[#E9D5FF] flex items-center gap-1.5">
            <ClockIcon size={13} className="text-[#A855F7]" />
            <span className="font-bold text-white">{data.timeElapsed}</span>
            <span className="text-[#A855F7]/70">/ 45m</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#FF6B6B]/15 text-[#FF8585] border border-[#FF6B6B]/30 font-medium">
            Topic: {data.topic}
          </span>
        </div>
      </header>

      {/* Main Orbit Stage + Fluid Frosted Side Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Constellation Stage Canvas (7 cols on lg) */}
        <main className="lg:col-span-7 bg-[#130E26] p-5 flex flex-col justify-between gap-5 overflow-y-auto">
          {/* Maya Chen Speaker Spotlight Orb */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#241747] to-[#170E33] border border-[#4C337D] p-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Glowing Ambient Light Rings */}
            <div className="absolute inset-0 bg-radial from-[#A855F7]/15 via-transparent to-transparent pointer-events-none" />

            {/* Presenter Pill Badge */}
            <div className="flex items-center gap-2 mb-4 z-10">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[#FF6B6B] to-[#EC4899] text-white shadow-[0_0_12px_rgba(255,107,107,0.5)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                PRESENTING · SPEAKER SPOTLIGHT
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] bg-[#1E123D] text-[#D8B4FE] border border-[#4C337D]">
                Maya Chen
              </span>
            </div>

            {/* Maya Chen Avatar with Sound Ripple Rings */}
            <div className="relative my-3 z-10 flex items-center justify-center">
              <div className="absolute -inset-4 rounded-full border border-[#A855F7]/30 animate-ping opacity-30" />
              <div className="absolute -inset-2 rounded-full border border-[#EC4899]/50 animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] p-1 shadow-[0_0_25px_rgba(168,85,247,0.6)]">
                <div className="w-full h-full rounded-full bg-[#1A1035] flex items-center justify-center text-xl font-extrabold text-white">
                  MC
                </div>
              </div>
            </div>

            <div className="z-10 mt-2 space-y-1 max-w-md">
              <h2 className="text-base sm:text-lg font-bold text-white m-0">
                Maya Chen · Head of Product
              </h2>
              <p className="text-xs text-[#D8B4FE]/80 leading-relaxed m-0">
                &ldquo;We need a hard gate on the p99 latency threshold before moving beyond the 10% canary tier.&rdquo;
              </p>
            </div>

            {/* Embedded Shared Slide Graphic */}
            <div className="w-full mt-4 p-4 rounded-2xl bg-[#1A1035]/80 border border-[#4C337D] z-10 text-left">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-[#FF6B6B]">Shared Canvas: November Phased Rollout</span>
                <span className="text-[11px] text-[#A855F7]">Canary: 5% Target</span>
              </div>
              <div className="w-full bg-[#27184A] h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#FF6B6B] h-full w-[24%]" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#D8B4FE]/70">
                <span>01 Multi-region (Done)</span>
                <span className="font-bold text-white">02 Phased Rollout (Live)</span>
                <span>03 Support Escalation</span>
              </div>
            </div>
          </div>

          {/* Orbiting Satellite Attendees: Liam, Priya, Alex */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-[#D8B4FE]/70 flex items-center gap-1.5">
                <UsersIcon size={13} className="text-[#A855F7]" />
                Orbiting Attendees (3 Listening)
              </span>
              <span className="text-[11px] text-[#A855F7]">Constellation Synchronized</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {data.attendees.map((att) => (
                <div
                  key={att.id}
                  className="p-3 rounded-2xl bg-[#1E123D]/90 border border-[#3E2868] hover:border-[#A855F7]/60 transition-all flex items-center gap-3 shadow-sm"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0"
                    style={{ backgroundColor: att.avatarBg }}
                  >
                    {att.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{att.name}</div>
                    <div className="text-[10px] text-[#D8B4FE]/70 truncate">{att.role}</div>
                  </div>
                  <MicOffIcon size={12} className="text-[#A855F7]/60 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Agenda Carousel Pills */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#D8B4FE]/70">
              Meeting Orbit Path
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {data.agenda.map((ag, i) => (
                <div
                  key={ag.id}
                  className={`p-2 rounded-xl border ${
                    ag.status === 'active'
                      ? 'bg-[#2D1B54] border-[#FF6B6B] text-white shadow-[0_0_8px_rgba(255,107,107,0.3)]'
                      : ag.status === 'completed'
                      ? 'bg-[#191033] border-[#38265E] text-[#D8B4FE]/60'
                      : 'bg-[#120B24] border-[#2A1C47] text-[#D8B4FE]/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-0.5">
                    <span className="font-bold">ORBIT 0{i + 1}</span>
                    <span>{ag.status === 'completed' ? '✓' : ag.status === 'active' ? '●' : '○'}</span>
                  </div>
                  <div className="text-[11px] truncate font-medium">{ag.title}</div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Fluid Frosted Side Panel: Copilot, Transcript, Decisions (5 cols on lg) */}
        <aside className="lg:col-span-5 bg-[#191033]/90 backdrop-blur-xl border-l border-[#38265E] flex flex-col justify-between overflow-hidden">
          {/* Orbit Side Tabs */}
          <div className="p-3 bg-[#130E26]/80 border-b border-[#38265E] flex gap-1 text-xs">
            <button
              onClick={() => setActiveTab('copilot')}
              className={`flex-1 py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'copilot'
                  ? 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-[#D8B4FE]/70 hover:text-white'
              }`}
            >
              <SparklesIcon size={13} />
              AI Copilot
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition-all ${
                activeTab === 'transcript'
                  ? 'bg-[#27184A] text-white border border-[#4C337D]'
                  : 'text-[#D8B4FE]/70 hover:text-white'
              }`}
            >
              Transcript
            </button>
            <button
              onClick={() => setActiveTab('decisions')}
              className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition-all ${
                activeTab === 'decisions'
                  ? 'bg-[#27184A] text-white border border-[#4C337D]'
                  : 'text-[#D8B4FE]/70 hover:text-white'
              }`}
            >
              Decisions
            </button>
          </div>

          {/* Orbit Chat & Info Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {activeTab === 'copilot' && (
              <>
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#A855F7]/20 to-[#EC4899]/20 border border-[#A855F7]/40 text-[#F3E8FF] text-[11px] leading-relaxed">
                  <strong>Orbit Conversational Copilot:</strong> Real-time neural parsing of meeting audio. Click prompt chips below or type queries.
                </div>

                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[10px] text-[#D8B4FE]/60 mb-0.5">
                      {msg.sender === 'user' ? 'You' : 'MinuteMate Copilot'} · {msg.timestamp}
                    </span>
                    <div
                      className={`p-3.5 rounded-2xl max-w-[92%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-[#A855F7] to-[#8B5CF6] text-white shadow-md'
                          : 'bg-[#221447] text-[#F3E8FF] border border-[#472E78] shadow-sm'
                      }`}
                    >
                      <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#3A2563] flex flex-wrap gap-1 items-center text-[10px]">
                          <span className="text-[#FF6B6B]">Audio Anchors:</span>
                          {msg.citations.map((c) => (
                            <span key={c} className="px-1.5 py-0.2 rounded-full bg-[#130E26] text-[#D8B4FE] border border-[#4C337D]">
                              @{c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-[#EC4899] italic">
                    <SparklesIcon size={12} className="animate-spin" />
                    <span>Synthesizing voice constellation...</span>
                  </div>
                )}
              </>
            )}

            {activeTab === 'transcript' && (
              <div className="space-y-2 text-xs">
                {data.transcript.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border ${
                      item.isHighlighted
                        ? 'bg-[#2E1A57] border-[#A855F7] text-white'
                        : 'bg-[#1A1035] border-[#38265E] text-[#D8B4FE]/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#A855F7] mb-1">
                      <span className="font-bold text-white">{item.speaker}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="m-0 leading-relaxed text-xs">{item.text}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'decisions' && (
              <div className="space-y-3 text-xs">
                {data.decisions.map((dec) => (
                  <div
                    key={dec.id}
                    className="p-3.5 rounded-2xl bg-[#231548] border border-[#FF6B6B]/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#FF6B6B] font-bold">
                      <span className="flex items-center gap-1">
                        <ShieldCheckIcon size={12} />
                        LOCKED DECISION
                      </span>
                      <span>[{dec.citationTimestamp}]</span>
                    </div>
                    <div className="font-bold text-white text-sm">{dec.title}</div>
                    <p className="text-[#D8B4FE]/80 text-xs leading-relaxed m-0">{dec.description}</p>
                  </div>
                ))}

                {data.actionProposals.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-2xl bg-[#1D113C] border border-[#A855F7]/30 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#A855F7] font-semibold">
                      <span>ACTION ITEM ({act.confidenceScore}% ACCURACY)</span>
                      <span>{act.dueDate}</span>
                    </div>
                    <div className="font-semibold text-white text-xs">{act.title}</div>
                    <div className="text-[11px] text-[#D8B4FE]/60">Owner: {act.owner}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Prompts & Chat Input */}
          <div className="p-3 bg-[#130E26]/80 border-t border-[#38265E]">
            <div className="flex flex-wrap gap-1 mb-2">
              {quickPrompts.slice(0, 2).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSendMessage(prompt)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-[#27184A] border border-[#4C337D] text-[#D8B4FE] hover:border-[#FF6B6B] hover:text-white transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Orbit Copilot..."
                value={chatInput}
                onChange={(e) => onChatInputChange(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#221447] border border-[#4C337D] text-white placeholder-[#A855F7]/60 focus:outline-none focus:border-[#FF6B6B]"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#FF6B6B] text-white hover:opacity-90 font-bold transition-opacity"
                title="Send query"
              >
                <SendIcon size={14} />
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* Cosmic Bottom Controls Toolbar */}
      <footer className="px-6 py-3 bg-[#130E26] border-t border-[#38265E] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#D8B4FE]/70">
          <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
          <span>Orbit Live Radial Constellation · Modern Acoustic Space</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
              micMuted
                ? 'bg-rose-950/70 border-rose-500 text-rose-300'
                : 'bg-[#27184A] border-[#4C337D] text-white hover:border-[#FF6B6B]'
            }`}
          >
            {micMuted ? <MicOffIcon size={14} /> : <MicIcon size={14} />}
            <span>{micMuted ? 'Muted' : 'Mic On'}</span>
          </button>

          <button
            onClick={() => setCamOff(!camOff)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
              camOff
                ? 'bg-rose-950/70 border-rose-500 text-rose-300'
                : 'bg-[#27184A] border-[#4C337D] text-white hover:border-[#FF6B6B]'
            }`}
          >
            {camOff ? <VideoOffIcon size={14} /> : <VideoIcon size={14} />}
            <span>{camOff ? 'Cam Off' : 'Camera'}</span>
          </button>

          <button
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
          >
            <PhoneOffIcon size={14} />
            <span>Leave Space</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
