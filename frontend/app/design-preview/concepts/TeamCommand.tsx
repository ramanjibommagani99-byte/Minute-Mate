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
  CheckCircleIcon,
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

export function TeamCommand({
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
  const [activeBoardTab, setActiveBoardTab] = useState<'kanban' | 'transcript'>('kanban');

  return (
    <div
      style={{
        backgroundColor: '#F4F6F9',
        color: '#091E42',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      className="w-full rounded-2xl border border-[#D8E2EC] shadow-md overflow-hidden flex flex-col min-h-[820px]"
    >
      {/* Top Enterprise Metrics Bar */}
      <header className="px-6 py-3.5 bg-[#0A2540] text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#0052CC] text-white flex items-center justify-center font-bold text-sm shadow">
            TC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-[#4C9AFF] uppercase">
                ENTERPRISE COMMAND · WAR ROOM OPS
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/40">
                P1 LAUNCH
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight m-0">
              {data.title}
            </h1>
          </div>
        </div>

        {/* Dense Enterprise Telemetry Row */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          <div className="px-3 py-1 rounded bg-[#172B4D] border border-blue-900/60 flex items-center gap-1.5">
            <ClockIcon size={13} className="text-[#4C9AFF]" />
            <span className="font-bold">{data.timeElapsed}</span>
            <span className="text-slate-400">/ 45m</span>
          </div>
          <div className="hidden md:flex px-2.5 py-1 rounded bg-[#172B4D] text-slate-300 items-center gap-1.5 border border-blue-900/60">
            <span>Pacing:</span>
            <span className="font-bold text-emerald-400">+2m Buffer</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#172B4D] text-slate-300 flex items-center gap-1.5 border border-blue-900/60">
            <span>Decisions:</span>
            <span className="font-bold text-white">1 Locked</span>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#172B4D] text-slate-300 flex items-center gap-1.5 border border-blue-900/60">
            <span>Tasks:</span>
            <span className="font-bold text-[#4C9AFF]">2 Queued</span>
          </div>
        </div>
      </header>

      {/* Main Grid: Left Stage & Agenda, Right Kanban & Transcript */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Section: Presenter Stage & Agenda (7 cols on lg) */}
        <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto border-r border-[#D8E2EC] bg-[#FFFFFF]">
          {/* Maya Chen Presenter Stage Card */}
          <div className="rounded-xl border border-[#CCD8E6] bg-[#F8FAFC] p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#0052CC] text-white">
                  STAGE PRESENTER
                </span>
                <span className="text-xs font-bold text-[#091E42]">Maya Chen</span>
                <span className="text-[11px] text-slate-500">· {data.topic}</span>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Presentation
              </span>
            </div>

            {/* Simulated Architecture Slide Preview */}
            <div className="rounded-lg bg-[#0A2540] p-4 text-white space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-blue-900/60 pb-2">
                <span className="font-mono text-xs text-[#4C9AFF]">SLIDE 04 / CANARY READINESS</span>
                <span className="text-[11px] text-slate-300">5% Gate Thresholds</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-[#172B4D] border border-blue-800">
                  <div className="text-[10px] text-slate-400">Canary Tier</div>
                  <div className="font-bold text-emerald-400 text-sm">5% Traffic</div>
                </div>
                <div className="p-2 rounded bg-[#172B4D] border border-blue-800">
                  <div className="text-[10px] text-slate-400">Error Guard</div>
                  <div className="font-bold text-amber-300 text-sm">&lt; 0.05% Err</div>
                </div>
                <div className="p-2 rounded bg-[#172B4D] border border-blue-800">
                  <div className="text-[10px] text-slate-400">Latency Ceiling</div>
                  <div className="font-bold text-cyan-300 text-sm">&lt; 200ms p99</div>
                </div>
              </div>
            </div>

            {/* Presenter Footer Bar */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs">
                  MC
                </div>
                <span className="text-xs text-[#091E42] font-semibold">Maya Chen (Head of Product)</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <MicIcon size={12} />
                <span>Sample audio status · inactive</span>
              </div>
            </div>
          </div>

          {/* Listening Attendees Row */}
          <div className="rounded-xl border border-[#CCD8E6] bg-[#F8FAFC] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Listening Crew (3 Verified)
              </span>
              <span className="text-[11px] text-slate-500">Muted by default</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {data.attendees.map((att) => (
                <div
                  key={att.id}
                  className="p-2 rounded-lg bg-white border border-[#D8E2EC] flex items-center gap-2"
                >
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: att.avatarBg }}
                  >
                    {att.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#091E42] truncate">{att.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{att.role}</div>
                  </div>
                  <MicOffIcon size={11} className="text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Structured Agenda Checklist with Pacing Indicators */}
          <div className="rounded-xl border border-[#CCD8E6] bg-[#FFFFFF] p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Agenda Pacing &amp; Milestones
              </span>
              <span className="text-xs font-bold text-[#0052CC]">2 / 4 Items</span>
            </div>
            <div className="space-y-1.5">
              {data.agenda.map((ag) => (
                <div
                  key={ag.id}
                  className={`p-2 rounded-md border flex items-center justify-between text-xs ${
                    ag.status === 'active'
                      ? 'bg-blue-50/70 border-[#0052CC] font-semibold text-[#091E42]'
                      : ag.status === 'completed'
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                        ag.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : ag.status === 'active'
                          ? 'bg-[#0052CC] text-white'
                          : 'border border-slate-300 text-slate-400'
                      }`}
                    >
                      {ag.status === 'completed' ? <CheckIcon size={10} /> : '•'}
                    </span>
                    <span>{ag.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{ag.timeRange}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Decision & Action Kanban + Transcript (5 cols on lg) */}
        <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between gap-4 overflow-y-auto bg-[#F4F6F9]">
          {/* Sub-Tabs: Decision Kanban vs Live Transcript */}
          <div className="flex items-center justify-between border-b border-[#CCD8E6] pb-2">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveBoardTab('kanban')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                  activeBoardTab === 'kanban'
                    ? 'bg-[#0052CC] text-white'
                    : 'bg-white text-slate-600 border border-[#D8E2EC]'
                }`}
              >
                Decisions &amp; Tasks (3)
              </button>
              <button
                onClick={() => setActiveBoardTab('transcript')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                  activeBoardTab === 'transcript'
                    ? 'bg-[#0052CC] text-white'
                    : 'bg-white text-slate-600 border border-[#D8E2EC]'
                }`}
              >
                Transcript Feed
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Sync: 100%</span>
          </div>

          {/* Kanban / Task Cards or Transcript */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {activeBoardTab === 'kanban' ? (
              <>
                {/* Formal Decision Card */}
                {data.decisions.map((dec) => (
                  <div
                    key={dec.id}
                    className="p-3.5 rounded-xl border border-blue-200 bg-white shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#0052CC] uppercase">
                        {dec.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">[{dec.citationTimestamp}]</span>
                    </div>
                    <div className="text-xs font-bold text-[#091E42]">{dec.title}</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed m-0">{dec.description}</p>
                    <div className="text-[10px] text-emerald-700 font-semibold pt-1 border-t border-slate-100 flex items-center gap-1">
                      <CheckCircleIcon size={12} />
                      Sign-off: {dec.approvedBy.join(', ')}
                    </div>
                  </div>
                ))}

                {/* Proposed Actions */}
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pt-1">
                  Active Action Commitments
                </div>

                {data.actionProposals.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-lg border border-[#D8E2EC] bg-white shadow-2xs space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {act.status} · {act.confidenceScore}% AI Confidence
                      </span>
                      <span className="text-[10px] text-slate-500">{act.dueDate}</span>
                    </div>
                    <div className="font-semibold text-[#091E42] text-xs">{act.title}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Owner: <strong className="text-[#091E42]">{act.owner}</strong></span>
                      <span className="font-mono text-[10px]">[{act.citationTimestamp}]</span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="space-y-2">
                {data.transcript.map((tr) => (
                  <div
                    key={tr.id}
                    className={`p-2.5 rounded-lg border text-xs ${
                      tr.isHighlighted
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-[#D8E2EC]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                      <span className="font-bold text-[#091E42]">{tr.speaker}</span>
                      <span className="font-mono">{tr.timestamp}</span>
                    </div>
                    <p className="m-0 text-slate-700 leading-relaxed text-xs">{tr.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Copilot Chat Dock */}
      <div className="bg-[#FFFFFF] border-t border-[#CCD8E6] p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-[#0052CC] font-bold text-[10px]">
              COPILOT DOCK
            </span>
            <span className="text-xs text-slate-600">MinuteMate In-Meeting Command Interface</span>
          </div>
          <div className="flex gap-1">
            {quickPrompts.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                onClick={() => onSendMessage(prompt)}
                className="text-[10px] px-2 py-0.5 rounded bg-[#F4F6F9] hover:bg-[#0052CC] hover:text-white border border-[#D8E2EC] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Stream Inset */}
        <div className="max-h-36 overflow-y-auto space-y-2 p-2 rounded-lg bg-[#F8FAFC] border border-[#D8E2EC] text-xs">
          {chatMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2">
              <span className="font-bold text-[11px] text-[#0052CC] shrink-0">
                {msg.sender === 'user' ? 'Operator:' : 'Copilot:'}
              </span>
              <p className="m-0 text-slate-800 leading-relaxed text-xs whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          ))}
          {isTyping && (
            <div className="text-[11px] text-[#0052CC] italic flex items-center gap-1">
              <SparklesIcon size={12} className="animate-spin" />
              <span>Querying telemetry and transcript records...</span>
            </div>
          )}
        </div>

        {/* Command Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type command or prompt (e.g., 'Summarize rollback threshold')..."
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-[#CCD8E6] bg-white text-[#091E42] focus:outline-none focus:border-[#0052CC]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#0052CC] text-white font-bold text-xs hover:bg-[#0747A6] flex items-center gap-1.5 transition-colors"
          >
            <SendIcon size={13} />
            <span>Execute</span>
          </button>
        </form>
      </div>

      {/* Enterprise Control Toolbar Footer */}
      <footer className="px-6 py-2.5 bg-[#0A2540] text-slate-300 border-t border-blue-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <UsersIcon size={14} className="text-[#4C9AFF]" />
          <span>Team Command Ops Grid · Audited Telemetry Enabled</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`px-3 py-1 rounded border flex items-center gap-1 font-semibold transition-colors ${
              micMuted
                ? 'bg-rose-900/80 border-rose-500 text-rose-200'
                : 'bg-[#172B4D] border-blue-800 text-white hover:bg-blue-900'
            }`}
          >
            {micMuted ? <MicOffIcon size={13} /> : <MicIcon size={13} />}
            <span>{micMuted ? 'Muted' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setCamOff(!camOff)}
            className={`px-3 py-1 rounded border flex items-center gap-1 font-semibold transition-colors ${
              camOff
                ? 'bg-rose-900/80 border-rose-500 text-rose-200'
                : 'bg-[#172B4D] border-blue-800 text-white hover:bg-blue-900'
            }`}
          >
            {camOff ? <VideoOffIcon size={13} /> : <VideoIcon size={13} />}
            <span>{camOff ? 'Cam Off' : 'Camera'}</span>
          </button>

          <button
            className="px-3 py-1 rounded bg-rose-600 text-white font-bold flex items-center gap-1 hover:bg-rose-700 transition-colors"
          >
            <PhoneOffIcon size={13} />
            <span>End Session</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
