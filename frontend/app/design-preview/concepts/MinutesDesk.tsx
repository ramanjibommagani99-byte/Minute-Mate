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
  FileTextIcon,
  CheckCircleIcon,
  PhoneOffIcon,
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

export function MinutesDesk({
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
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [approvedActionIds, setApprovedActionIds] = useState<string[]>(['act-2']);

  const toggleApproval = (id: string) => {
    setApprovedActionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        color: '#0F2744',
        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
      }}
      className="w-full rounded-2xl border border-[#CBD5E1] shadow-md overflow-hidden flex flex-col min-h-[820px]"
    >
      {/* Formal Executive Document Header */}
      <header className="px-8 py-5 bg-white border-b-2 border-[#0F2744] flex flex-wrap items-center justify-between gap-4 font-sans">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-[#0F2744] text-white flex items-center justify-center font-serif font-black text-lg">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-[#1E40AF] uppercase">
                MINUTES DESK · EXECUTIVE RECORD OF PROCEEDINGS
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-[#1E40AF] border border-blue-200 font-semibold">
                Doc Ref: MM-2026-Q4-019
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#0F2744] m-0">
              {data.title}
            </h1>
          </div>
        </div>

        {/* Meeting Metadata Stamp */}
        <div className="flex items-center gap-4 text-xs">
          <div className="px-3 py-1.5 rounded border border-[#CBD5E1] bg-[#F8FAFC] flex items-center gap-2">
            <ClockIcon size={14} className="text-[#1E40AF]" />
            <span>Time Elapsed: <strong>{data.timeElapsed}</strong></span>
            <span className="text-slate-400">/ 45m</span>
          </div>
          <span className="px-3 py-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Sample meeting notes · no recording
          </span>
        </div>
      </header>

      {/* Main Document & Slim Drawer Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Living Minutes Document Canvas (8 cols on lg, or 12 if drawer closed) */}
        <main
          className={`${
            drawerOpen ? 'lg:col-span-8' : 'lg:col-span-12'
          } bg-white p-6 sm:p-8 overflow-y-auto border-r border-[#E2E8F0] space-y-6`}
        >
          {/* Executive Memorandum Header Banner */}
          <div className="p-4 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-4 font-sans text-xs">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Topic Under Review
              </div>
              <div className="text-sm font-serif font-bold text-[#0F2744]">{data.topic}</div>
              <div className="text-slate-600">Chair &amp; Sole Presenter: <strong>Maya Chen (Head of Product)</strong></div>
            </div>

            {/* Picture-in-Picture Live Stream Presenter Tile */}
            <div className="p-3 rounded-lg bg-white border border-[#CBD5E1] shadow-xs flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded bg-[#0F2744] text-white flex items-center justify-center font-bold text-base">
                  MC
                </div>
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-bold tracking-tight">
                  LIVE
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    PRESENTING
                  </span>
                  <MicIcon size={12} className="text-emerald-700" />
                </div>
                <div className="text-xs font-bold text-[#0F2744]">Maya Chen</div>
                <div className="text-[10px] text-slate-500">Screen sharing canary topology</div>
              </div>
            </div>
          </div>

          {/* Attendee Ledger Sign-in Strip */}
          <section className="font-sans">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Quorum &amp; Attendees Present (4)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded border border-emerald-300 bg-emerald-50/60 flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs">
                  MC
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[#0F2744] truncate">Maya Chen</div>
                  <div className="text-[10px] text-emerald-800 font-semibold truncate">Presenting</div>
                </div>
              </div>

              {data.attendees.map((att) => (
                <div
                  key={att.id}
                  className="p-2.5 rounded border border-[#E2E8F0] bg-white flex items-center gap-2"
                >
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs text-white"
                    style={{ backgroundColor: att.avatarBg }}
                  >
                    {att.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#0F2744] truncate">{att.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">Listening</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Real-Time Document Ledger: Agenda & Progress */}
          <section className="border-t border-[#E2E8F0] pt-4 font-sans">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F2744] font-sans m-0">
                1. Order of Business &amp; Progress
              </h2>
              <span className="text-xs text-slate-500 font-mono">Status: In Session</span>
            </div>
            <div className="divide-y divide-[#E2E8F0] border border-[#CBD5E1] rounded-lg overflow-hidden">
              {data.agenda.map((ag) => (
                <div
                  key={ag.id}
                  className={`p-3 flex items-center justify-between text-xs ${
                    ag.status === 'active'
                      ? 'bg-blue-50/70 font-semibold'
                      : ag.status === 'completed'
                      ? 'bg-slate-50 text-slate-500'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        ag.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : ag.status === 'active'
                          ? 'bg-[#1E40AF] text-white'
                          : 'border border-slate-300 text-slate-400'
                      }`}
                    >
                      {ag.status === 'completed' ? <CheckIcon size={12} /> : '•'}
                    </span>
                    <span className="font-serif text-[#0F2744]">{ag.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-slate-500">{ag.timeRange}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        ag.status === 'active'
                          ? 'bg-blue-200 text-[#0F2744]'
                          : ag.status === 'completed'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {ag.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Formal Decisions Log as Ink Document Box */}
          <section className="border-t border-[#E2E8F0] pt-4 font-sans">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F2744] font-sans m-0">
                2. Recorded Decisions (Binding)
              </h2>
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircleIcon size={13} />
                Unanimously Verified
              </span>
            </div>

            {data.decisions.map((dec) => (
              <div
                key={dec.id}
                className="p-4 rounded-lg border-2 border-[#1E40AF] bg-blue-50/30 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#1E40AF] flex items-center gap-1.5">
                    <ShieldCheckIcon size={14} />
                    {dec.status} · Recorded at {dec.agreedAt}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Source Verified: [{dec.citationTimestamp}]
                  </span>
                </div>
                <h3 className="text-base font-serif font-bold text-[#0F2744] m-0">{dec.title}</h3>
                <p className="font-serif text-slate-700 leading-relaxed m-0 text-sm">{dec.description}</p>
                <div className="pt-2 border-t border-blue-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                  <span>
                    Signatories: <strong>{dec.approvedBy.join(', ')}</strong>
                  </span>
                  <span className="italic">Impact: {dec.impact}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Action Items Ledger with Interactive Approvals */}
          <section className="border-t border-[#E2E8F0] pt-4 font-sans">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F2744] font-sans m-0">
                3. Proposed Action Commitments
              </h2>
              <span className="text-xs text-slate-500">MinuteMate Extract Confidence &gt; 94%</span>
            </div>

            <div className="border border-[#CBD5E1] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F1F5F9] border-b border-[#CBD5E1] text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2.5">Action Commitment</th>
                    <th className="p-2.5">Owner</th>
                    <th className="p-2.5">Deadline</th>
                    <th className="p-2.5 text-right">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {data.actionProposals.map((act) => {
                    const isApproved = approvedActionIds.includes(act.id);
                    return (
                      <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3">
                          <div className="font-serif font-semibold text-[#0F2744] text-xs">
                            {act.title}
                          </div>
                          <div className="text-[10px] text-slate-500 italic mt-0.5">
                            &ldquo;{act.sourceQuote}&rdquo; · [{act.citationTimestamp}]
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-[#0F2744] whitespace-nowrap">
                          {act.owner}
                        </td>
                        <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                          {act.dueDate}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => toggleApproval(act.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                              isApproved
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                            }`}
                          >
                            {isApproved ? '✓ Approved' : 'Review & Sign'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Live Chronological Stenography Transcript */}
          <section className="border-t border-[#E2E8F0] pt-4 font-sans">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F2744] font-sans m-0 mb-3">
              4. Real-Time Transcript Record
            </h2>
            <div className="space-y-2 font-serif text-xs">
              {data.transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-2.5 rounded border ${
                    entry.isHighlighted
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-[#F8FAFC] border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-sans text-slate-500 mb-0.5">
                    <span className="font-bold text-[#0F2744]">{entry.speaker} ({entry.speakerRole})</span>
                    <span className="font-mono">{entry.timestamp}</span>
                  </div>
                  <p className="m-0 text-slate-800 leading-relaxed">{entry.text}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Slim Right Drawer: MinuteMate Compliance & Research Assistant (4 cols on lg) */}
        {drawerOpen && (
          <aside className="lg:col-span-4 bg-[#F8FAFC] border-l border-[#CBD5E1] flex flex-col justify-between overflow-hidden font-sans">
            <div className="p-4 bg-white border-b border-[#CBD5E1] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SparklesIcon size={14} className="text-[#1E40AF]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F2744] m-0">
                  MinuteMate Clerk
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#1E40AF] border border-blue-200">
                Stenographer AI
              </span>
            </div>

            {/* Assistant Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              <div className="p-2.5 rounded bg-blue-50/70 border border-blue-200 text-[#0F2744] text-[11px] leading-relaxed">
                <strong>Executive Clerk Notice:</strong> All statements are audited against audio timestamps. You can query past decisions or draft formal minutes.
              </div>

              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5">
                    {msg.sender === 'user' ? 'Inquiry' : 'Clerk Finding'} · {msg.timestamp}
                  </span>
                  <div
                    className={`p-3 rounded-lg max-w-[92%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#0F2744] text-white'
                        : 'bg-white text-[#0F2744] border border-[#CBD5E1] shadow-2xs'
                    }`}
                  >
                    <p className="m-0 font-serif whitespace-pre-wrap">{msg.content}</p>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap gap-1 items-center font-mono text-[10px]">
                        <span className="text-slate-400">Record Citations:</span>
                        {msg.citations.map((c) => (
                          <span key={c} className="px-1.5 py-0.2 rounded bg-slate-100 text-[#1E40AF]">
                            [{c}]
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="text-xs italic text-slate-500 flex items-center gap-1.5">
                  <SparklesIcon size={12} className="text-[#1E40AF] animate-spin" />
                  <span>Drafting formal answer...</span>
                </div>
              )}
            </div>

            {/* Assistant Drawer Input */}
            <div className="p-3 bg-white border-t border-[#CBD5E1]">
              <div className="flex flex-wrap gap-1 mb-2">
                {quickPrompts.slice(0, 2).map((qp) => (
                  <button
                    key={qp}
                    onClick={() => onSendMessage(qp)}
                    className="text-[10px] px-2 py-0.5 rounded border border-[#CBD5E1] bg-[#F8FAFC] text-slate-700 hover:border-[#1E40AF] transition-colors"
                  >
                    {qp}
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
                  placeholder="Inquire against meeting record..."
                  value={chatInput}
                  onChange={(e) => onChatInputChange(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded border border-[#CBD5E1] text-[#0F2744] focus:outline-none focus:border-[#1E40AF]"
                />
                <button
                  type="submit"
                  className="p-2 rounded bg-[#0F2744] text-white hover:bg-[#1E40AF] transition-colors"
                  title="Submit inquiry"
                >
                  <SendIcon size={14} />
                </button>
              </form>
            </div>
          </aside>
        )}
      </div>

      {/* Document Desk Meeting Controls Toolbar */}
      <footer className="px-8 py-3 bg-white border-t border-[#CBD5E1] flex flex-wrap items-center justify-between gap-3 font-sans text-xs">
        <div className="flex items-center gap-3 text-slate-600">
          <FileTextIcon size={15} className="text-[#1E40AF]" />
          <span>Minutes Desk Canvas · Real-time Binding Legal / Executive Proceedings</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMicMuted(!micMuted)}
            className={`px-3 py-1.5 rounded border flex items-center gap-1.5 font-medium transition-colors ${
              micMuted
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-white border-[#CBD5E1] text-[#0F2744] hover:bg-slate-50'
            }`}
          >
            {micMuted ? <MicOffIcon size={14} /> : <MicIcon size={14} />}
            <span>{micMuted ? 'Muted' : 'Mic'}</span>
          </button>

          <button
            onClick={() => setCamOff(!camOff)}
            className={`px-3 py-1.5 rounded border flex items-center gap-1.5 font-medium transition-colors ${
              camOff
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-white border-[#CBD5E1] text-[#0F2744] hover:bg-slate-50'
            }`}
          >
            {camOff ? <VideoOffIcon size={14} /> : <VideoIcon size={14} />}
            <span>{camOff ? 'Cam Off' : 'Cam'}</span>
          </button>

          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="px-3 py-1.5 rounded border bg-blue-50 border-blue-200 text-[#1E40AF] font-medium flex items-center gap-1.5"
          >
            <SparklesIcon size={14} />
            <span>{drawerOpen ? 'Hide Clerk' : 'Show Clerk'}</span>
          </button>

          <button
            className="px-3 py-1.5 rounded bg-[#991B1B] text-white font-medium flex items-center gap-1.5 hover:bg-rose-800 transition-colors"
          >
            <PhoneOffIcon size={14} />
            <span>Adjourn</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
