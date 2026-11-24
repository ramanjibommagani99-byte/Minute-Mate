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
  UsersIcon,
  PhoneOffIcon,
  InfoIcon,
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

export function CalmStudio({
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
  const [screenSharing, setScreenSharing] = useState(true);
  const [rightTab, setRightTab] = useState<'copilot' | 'transcript'>('copilot');

  return (
    <div
      style={{
        backgroundColor: '#FAF9F5',
        color: '#1E2320',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif',
      }}
      className="w-full rounded-2xl border border-[#E6E2D8] shadow-sm overflow-hidden flex flex-col min-h-[820px]"
    >
      {/* Calm Studio Top Header */}
      <header className="px-6 py-4 bg-[#F4F1EA] border-b border-[#E6E2D8] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E2EBE4] border border-[#CCDCD0] flex items-center justify-center text-[#2D553E] font-serif font-bold text-sm">
            MM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#4A7C59]">Calm Studio · Meeting Space</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[#E2EBE4] text-[#2D553E]">
                <span className="w-2 h-2 rounded-full bg-[#3B6B50] animate-pulse" />
                LIVE SAMPLE · COPILOT PREVIEW
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-[#1E2320] m-0">
              {data.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-sans">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#E6E2D8] text-[#55605A]">
            <ClockIcon size={14} className="text-[#3B6B50]" />
            <span className="font-semibold text-[#1E2320]">{data.timeElapsed}</span>
            <span className="text-[#88948C]">/ {data.totalDuration}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[#55605A]">
            <UsersIcon size={14} />
            <span>4 Present</span>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#EBF2EC] text-[#2D553E] font-medium border border-[#D5E4D8]">
            Topic: {data.topic}
          </span>
        </div>
      </header>

      {/* Main 3-Column Studio Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: Structured Agenda (3 cols on lg) */}
        <aside className="lg:col-span-3 bg-[#F7F5EE] border-r border-[#E6E2D8] p-5 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6A7870] font-sans">
                Agenda &amp; Timeline
              </h2>
              <span className="text-xs font-medium text-[#4A7C59]">2 of 4 Active</span>
            </div>

            <ol className="space-y-3 p-0 m-0 list-none font-sans">
              {data.agenda.map((item, idx) => {
                const isActive = item.status === 'active';
                const isDone = item.status === 'completed';
                return (
                  <li
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-[#FFFFFF] border-[#3B6B50] shadow-sm'
                        : isDone
                        ? 'bg-[#F2EFE8] border-[#E3DFD5] opacity-80'
                        : 'bg-[#FDFCFA] border-[#EAE6DD]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0 ${
                          isDone
                            ? 'bg-[#3B6B50] text-white'
                            : isActive
                            ? 'bg-[#E2EBE4] text-[#2D553E] border border-[#3B6B50]'
                            : 'bg-[#EAE6DD] text-[#7A8880]'
                        }`}
                      >
                        {isDone ? <CheckIcon size={12} /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="text-[#7A8880]">{item.timeRange}</span>
                          {isActive && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.2 bg-[#E2EBE4] text-[#2D553E] rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-medium leading-snug m-0 ${isActive ? 'text-[#1E2320] font-semibold' : 'text-[#4A554E]'}`}>
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Quick Context Card */}
            <div className="mt-6 p-3.5 rounded-xl bg-[#EBF2EC] border border-[#D5E4D8] text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#2D553E] mb-1">
                <InfoIcon size={13} />
                <span>Editorial Focus Note</span>
              </div>
              <p className="text-[#3E5246] m-0 leading-relaxed text-[11px]">
                MinuteMate is running non-intrusively in the background. Action proposals and agreed metrics are auto-cited with millisecond precision.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E6E2D8] mt-6 text-[11px] text-[#7A8880]">
            Pacing: <strong className="text-[#2D553E]">+2 mins</strong> ahead of schedule
          </div>
        </aside>

        {/* Center Column: Dominant Presenter & Listening Strip (6 cols on lg) */}
        <main className="lg:col-span-6 bg-[#FAF9F5] p-5 flex flex-col gap-4 overflow-y-auto">
          {/* Maya Chen: Sole Presenter Main Stage */}
          <section className="relative rounded-2xl bg-[#EBE7DD] border border-[#DCD5C6] p-4 flex flex-col justify-between overflow-hidden shadow-sm">
            {/* Presenter Header Bar */}
            <div className="flex items-center justify-between mb-3 z-10">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#2D553E] text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00F5A0] animate-pulse" />
                  PRESENTING
                </span>
                <span className="text-xs font-medium text-[#4A554E]">Maya Chen · Head of Product</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FAF9F5]/90 px-2.5 py-1 rounded-full text-[11px] text-[#3B6B50] font-medium border border-[#CCDCD0]">
                <MicIcon size={12} />
                <span>Speaking · Microphone live</span>
              </div>
            </div>

            {/* Simulated Live Presentation Screen Slide */}
            <div className="w-full bg-[#F4F1EA] rounded-xl border border-[#DCD5C6] p-5 my-2 flex flex-col justify-center">
              <div className="flex items-center justify-between border-b border-[#E3DFD5] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A7C59]">Slide Deck · Shared Screen</span>
                  <span className="text-[11px] text-[#7A8880]">v4.2-final</span>
                </div>
                <span className="text-[11px] font-mono text-[#3B6B50]">1080p · 60fps</span>
              </div>
              <h3 className="text-base md:text-lg font-serif font-bold text-[#1E2320] m-0 mb-2">
                November Phased Canary Deployment Strategy
              </h3>
              <p className="text-xs text-[#55605A] leading-relaxed mb-4">
                Targeting 5% initial traffic gate for 48 hours across primary availability zones. Automated rollback trigger set at 200ms p99 latency threshold.
              </p>

              {/* Graphic Flow Representation */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-[#E2EBE4] border border-[#CCDCD0]">
                  <div className="font-bold text-[#2D553E] text-sm">Stage 1: 5%</div>
                  <div className="text-[10px] text-[#4A554E]">First 48h Canary</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#DCD5C6]">
                  <div className="font-bold text-[#1E2320] text-sm">Stage 2: 25%</div>
                  <div className="text-[10px] text-[#7A8880]">Nov 24 Regional</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#DCD5C6]">
                  <div className="font-bold text-[#1E2320] text-sm">Stage 3: 100%</div>
                  <div className="text-[10px] text-[#7A8880]">Nov 28 Global</div>
                </div>
              </div>
            </div>

            {/* Maya Chen Video Inset & Audio Wave */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#2D553E] text-white flex items-center justify-center font-bold text-sm shadow">
                  MC
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1E2320]">Maya Chen</div>
                  <div className="text-[11px] text-[#55605A]">Presenting &ldquo;November launch plan&rdquo;</div>
                </div>
              </div>

              {/* Simulated Audio Waveform */}
              <div className="flex items-center gap-1 h-5 px-3 py-1 bg-[#FFFFFF] rounded-full border border-[#DCD5C6]">
                <span className="w-1 bg-[#3B6B50] h-2 rounded-full animate-pulse" />
                <span className="w-1 bg-[#3B6B50] h-4 rounded-full animate-pulse" />
                <span className="w-1 bg-[#3B6B50] h-3 rounded-full animate-pulse" />
                <span className="w-1 bg-[#3B6B50] h-5 rounded-full animate-pulse" />
                <span className="w-1 bg-[#3B6B50] h-2 rounded-full animate-pulse" />
              </div>
            </div>
          </section>

          {/* Listening Attendees Strip: Liam, Priya, Alex */}
          <section className="bg-[#F4F1EA] rounded-xl border border-[#E6E2D8] p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6A7870] font-sans">
                Listening Attendees (3)
              </span>
              <span className="text-[11px] text-[#7A8880]">Muted · Attentive</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {data.attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E3DFD5] flex items-center gap-2.5"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: attendee.avatarBg }}
                  >
                    {attendee.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#1E2320] truncate">{attendee.name}</div>
                    <div className="text-[10px] text-[#7A8880] truncate">{attendee.role}</div>
                  </div>
                  <MicOffIcon size={13} className="text-[#99A69E] shrink-0" />
                </div>
              ))}
            </div>
          </section>

          {/* Live Decisions & Action Proposals in Calm Studio Style */}
          <section className="space-y-3">
            {/* Formal Decision Card */}
            {data.decisions.map((dec) => (
              <div
                key={dec.id}
                className="p-3.5 rounded-xl bg-[#EBF2EC] border border-[#CCDCD0] text-xs font-sans"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1 font-bold text-[#2D553E] text-[11px] uppercase tracking-wide">
                    <ShieldCheckIcon size={13} />
                    {dec.status} · Agreed at {dec.agreedAt}
                  </span>
                  <span className="text-[10px] text-[#55605A] font-mono">Cite [{dec.citationTimestamp}]</span>
                </div>
                <div className="font-semibold text-sm text-[#1E2320] mb-1">{dec.title}</div>
                <p className="text-[#3E5246] leading-relaxed m-0 text-xs">{dec.description}</p>
              </div>
            ))}

            {/* Action Proposal Card */}
            {data.actionProposals.slice(0, 1).map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E6E2D8] text-xs font-sans shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B6B23] bg-[#FEF9EE] px-2 py-0.5 rounded border border-[#F4E3BC]">
                    Action Proposal · {act.confidenceScore}% Confidence
                  </span>
                  <span className="text-[10px] text-[#7A8880]">Due: {act.dueDate}</span>
                </div>
                <p className="font-medium text-xs text-[#1E2320] m-0 mb-1.5">{act.title}</p>
                <div className="flex items-center justify-between text-[11px] text-[#6A7870] pt-1.5 border-t border-[#F2EFE8]">
                  <span className="font-medium text-[#2D553E]">Owner: {act.owner}</span>
                  <span className="italic text-[10px] text-[#88948C]">Source: [{act.citationTimestamp}]</span>
                </div>
              </div>
            ))}
          </section>
        </main>

        {/* Right Column: Assistant & Transcript (3 cols on lg) */}
        <aside className="lg:col-span-3 bg-[#FDFCFA] border-l border-[#E6E2D8] flex flex-col justify-between overflow-hidden">
          {/* Tab Selector */}
          <div className="p-3 border-b border-[#E6E2D8] bg-[#F7F5EE] flex gap-1">
            <button
              onClick={() => setRightTab('copilot')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                rightTab === 'copilot'
                  ? 'bg-[#FFFFFF] text-[#2D553E] border border-[#CCDCD0] shadow-xs'
                  : 'text-[#6A7870] hover:text-[#1E2320]'
              }`}
            >
              <SparklesIcon size={13} />
              MinuteMate AI
            </button>
            <button
              onClick={() => setRightTab('transcript')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                rightTab === 'transcript'
                  ? 'bg-[#FFFFFF] text-[#2D553E] border border-[#CCDCD0] shadow-xs'
                  : 'text-[#6A7870] hover:text-[#1E2320]'
              }`}
            >
              Live Transcript
            </button>
          </div>

          {/* Right Panel Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {rightTab === 'copilot' ? (
              <>
                <div className="p-2.5 rounded-lg bg-[#EBF2EC] border border-[#D5E4D8] text-[11px] text-[#2D553E]">
                  <strong>Calm Studio Copilot:</strong> Local UI simulation with evidence citations. Ask about decisions, owners, or agenda pacing.
                </div>

                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col text-xs font-sans ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[10px] text-[#88948C] mb-0.5">
                      {msg.sender === 'user' ? 'You' : 'MinuteMate Copilot'} · {msg.timestamp}
                    </span>
                    <div
                      className={`p-3 rounded-xl max-w-[92%] leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#3B6B50] text-white rounded-br-xs'
                          : 'bg-[#F4F1EA] text-[#1E2320] border border-[#E6E2D8] rounded-bl-xs'
                      }`}
                    >
                      <p className="m-0 whitespace-pre-wrap">{msg.content}</p>
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-2 pt-1.5 border-t border-[#DCD5C6]/60 flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-[#55605A]">Citations:</span>
                          {msg.citations.map((c) => (
                            <span
                              key={c}
                              className="px-1.5 py-0.2 rounded bg-[#E2EBE4] text-[#2D553E] text-[10px] font-mono font-medium"
                            >
                              [{c}]
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-[#55605A] italic">
                    <SparklesIcon size={12} className="text-[#3B6B50] animate-spin" />
                    <span>MinuteMate is synthesizing transcript...</span>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3 font-sans">
                <div className="text-[11px] text-[#7A8880] uppercase tracking-wider font-bold mb-2">
                  Sample transcript · no audio capture
                </div>
                {data.transcript.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-lg border text-xs ${
                      item.isHighlighted
                        ? 'bg-[#F4F8F5] border-[#BCE1CE]'
                        : 'bg-[#FAF9F5] border-[#EAE6DD]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#7A8880] mb-1">
                      <span className="font-bold text-[#1E2320]">{item.speaker}</span>
                      <span className="font-mono">{item.timestamp}</span>
                    </div>
                    <p className="m-0 text-[#3E4A42] leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assistant Input & Quick Prompts */}
          <div className="p-3 border-t border-[#E6E2D8] bg-[#F7F5EE]">
            <div className="flex flex-wrap gap-1 mb-2">
              {quickPrompts.slice(0, 2).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSendMessage(prompt)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#DCD5C6] text-[#4A554E] hover:border-[#3B6B50] hover:text-[#2D553E] transition-colors"
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
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder="Ask MinuteMate..."
                value={chatInput}
                onChange={(e) => onChatInputChange(e.target.value)}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-white border border-[#CCDCD0] text-[#1E2320] focus:outline-none focus:ring-1 focus:ring-[#3B6B50]"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#3B6B50] text-white hover:bg-[#2D553E] transition-colors"
                title="Send demo question"
              >
                <SendIcon size={14} />
              </button>
            </form>
          </div>
        </aside>
      </div>

      {/* Floating Minimal Meeting Controls Footer */}
      <footer className="px-6 py-3 bg-[#F4F1EA] border-t border-[#E6E2D8] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#55605A]">
          <span className="w-2 h-2 rounded-full bg-[#3B6B50]" />
          <span>Calm Studio Layout · Responsive 3-Column Editorial</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`p-2 rounded-lg border flex items-center gap-1.5 transition-colors ${
              micMuted
                ? 'bg-[#FBEBEB] border-[#F2B8B8] text-[#9A3030]'
                : 'bg-white border-[#DCD5C6] text-[#1E2320] hover:bg-[#EAE6DD]'
            }`}
          >
            {micMuted ? <MicOffIcon size={15} /> : <MicIcon size={15} />}
            <span>{micMuted ? 'Muted' : 'Mic On'}</span>
          </button>

          <button
            onClick={() => setCamOff(!camOff)}
            className={`p-2 rounded-lg border flex items-center gap-1.5 transition-colors ${
              camOff
                ? 'bg-[#FBEBEB] border-[#F2B8B8] text-[#9A3030]'
                : 'bg-white border-[#DCD5C6] text-[#1E2320] hover:bg-[#EAE6DD]'
            }`}
          >
            {camOff ? <VideoOffIcon size={15} /> : <VideoIcon size={15} />}
            <span>{camOff ? 'Cam Off' : 'Camera'}</span>
          </button>

          <button
            onClick={() => setScreenSharing(!screenSharing)}
            className="p-2 rounded-lg border bg-white border-[#DCD5C6] text-[#1E2320] flex items-center gap-1.5 hover:bg-[#EAE6DD] transition-colors"
          >
            <ScreenShareIcon size={15} />
            <span>Sharing</span>
          </button>

          <button
            className="p-2 px-3 rounded-lg bg-[#9A3030] text-white font-medium flex items-center gap-1.5 hover:bg-[#802525] transition-colors"
          >
            <PhoneOffIcon size={15} />
            <span>Leave</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
