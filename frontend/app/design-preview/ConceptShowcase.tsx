'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ConceptId, ViewportMode } from './types';
import { CONCEPTS, MOCK_MEETING_DATA, QUICK_PROMPTS } from './mockData';
import { useDemoChat } from './useDemoChat';
import { CalmStudio } from './concepts/CalmStudio';
import { FocusRoom } from './concepts/FocusRoom';
import { MinutesDesk } from './concepts/MinutesDesk';
import { TeamCommand } from './concepts/TeamCommand';
import { OrbitLive } from './concepts/OrbitLive';
import {
  CheckIcon,
  CheckCircleIcon,
  LaptopIcon,
  TabletIcon,
  SmartphoneIcon,
  MaximizeIcon,
  SparklesIcon,
  ShieldCheckIcon,
  InfoIcon,
} from './InlineIcons';

interface ConceptShowcaseProps {
  initialConceptId?: ConceptId;
}

export function ConceptShowcase({ initialConceptId = 'calm-studio' }: ConceptShowcaseProps) {
  const [activeConceptId, setActiveConceptId] = useState<ConceptId>(initialConceptId);
  const [selectedForReview, setSelectedForReview] = useState<ConceptId | null>(null);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('responsive');
  const [showMatrix, setShowMatrix] = useState(false);

  const tabListRef = useRef<HTMLDivElement>(null);

  // Demo Chat State Hook
  const {
    messages: chatMessages,
    inputValue: chatInput,
    setInputValue: setChatInput,
    isTyping,
    sendMessage,
  } = useDemoChat();

  const activeConcept = CONCEPTS.find((c) => c.id === activeConceptId) || CONCEPTS[0];

  // Handle keyboard navigation for concept tabs
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (index + 1) % CONCEPTS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (index - 1 + CONCEPTS.length) % CONCEPTS.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = CONCEPTS.length - 1;
    }

    if (nextIndex !== index) {
      setActiveConceptId(CONCEPTS[nextIndex].id);
      const tabElements = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      tabElements?.[nextIndex]?.focus();
    }
  };

  const getViewportMaxWidth = () => {
    switch (viewportMode) {
      case 'desktop':
        return '1320px';
      case 'tablet':
        return '840px';
      case 'mobile':
        return '410px';
      default:
        return '100%';
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F0F3F1] text-[#17211D] font-sans pb-16">
      {/* Top Sticky Showcase Bar */}
      <section className="bg-white border-b border-[#DCE5DF] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#E7F3EC] text-[#18714F] uppercase tracking-wider">
                  Product Owner Showcase
                </span>
                <span className="text-xs text-[#65736C]">·</span>
                <span className="text-xs text-[#65736C]">MinuteMate In-Meeting Copilot</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17211D] m-0">
                Five Design Concepts for In-Meeting Intelligence
              </h1>
            </div>

            {/* Selection Action & Status */}
            <div className="flex items-center gap-3">
              {selectedForReview === activeConcept.id ? (
                <div className="px-3.5 py-1.5 rounded-lg bg-[#E7F3EC] border border-[#BCE1CE] text-[#18714F] text-xs font-bold flex items-center gap-2 shadow-xs">
                  <CheckCircleIcon size={16} />
                  <span>Selected for review: {activeConcept.name}</span>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedForReview(activeConcept.id)}
                  className="px-4 py-2 rounded-lg bg-[#18714F] text-white text-xs font-bold hover:bg-[#12583D] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckIcon size={14} />
                  <span>Select &ldquo;{activeConcept.name}&rdquo; for Review</span>
                </button>
              )}

              <button
                onClick={() => setShowMatrix(!showMatrix)}
                className="px-3 py-2 rounded-lg border border-[#DCE5DF] bg-white text-xs font-medium text-[#17211D] hover:bg-[#F4F7F5] transition-colors"
              >
                {showMatrix ? 'Hide Comparison Matrix' : 'Compare All 5 Concepts'}
              </button>
            </div>
          </div>

          {/* Subtitle & Explanatory Notice */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#65736C]">
            <p className="m-0 leading-relaxed max-w-3xl">
              Compare layout architecture, palette, typography, presenter visual hierarchy, and copilot integration across five distinct design paradigms. All concepts reflect the same real-time meeting data.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] bg-[#FAF9F5] px-2.5 py-1 rounded border border-[#E6E2D8] text-[#55605A]">
              <InfoIcon size={13} className="text-[#18714F]" />
              <span>Interactive sample: Copilot replies and meeting controls stay local; no mic, recording, or AI service is used.</span>
            </div>
          </div>

          {/* 5 Named Selectable Tabs / Cards */}
          <div
            ref={tabListRef}
            role="tablist"
            aria-label="MinuteMate Design Concepts"
            className="mt-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
          >
            {CONCEPTS.map((concept, idx) => {
              const isCurrent = concept.id === activeConceptId;
              const isChosen = concept.id === selectedForReview;
              return (
                <button
                  key={concept.id}
                  role="tab"
                  id={`tab-${concept.id}`}
                  aria-selected={isCurrent}
                  aria-controls={`panel-${concept.id}`}
                  tabIndex={isCurrent ? 0 : -1}
                  onClick={() => setActiveConceptId(concept.id)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-white border-[#18714F] shadow-md ring-2 ring-[#18714F]/20'
                      : 'bg-[#F8FAF9] border-[#DCE5DF] hover:border-[#BCE1CE] hover:bg-white'
                  }`}
                >
                  {isChosen && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E7F3EC] text-[#18714F] border border-[#BCE1CE]">
                      ✓ Chosen
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: concept.accentColor }}
                      />
                      <span className="text-xs font-bold text-[#17211D]">{concept.name}</span>
                    </div>
                    <span className="text-[10px] font-medium text-[#65736C] block leading-tight mb-1.5">
                      {concept.badge}
                    </span>
                    <p className="text-[11px] text-[#65736C] leading-snug m-0 line-clamp-2">
                      {concept.tagline}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#EAEFEA] flex items-center justify-between text-[10px]">
                    <span className="text-[#18714F] font-semibold">
                      {isCurrent ? 'Viewing Live Preview' : 'Click to Preview'}
                    </span>
                    <span className="text-slate-400 font-mono">0{idx + 1}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <nav aria-label="Open full design sample pages" className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-[#65736C]">Open a full sample page:</span>
            {CONCEPTS.map((concept) => (
              <Link
                key={concept.id}
                href={`/design-preview/${concept.id}`}
                className="rounded-full border border-[#DCE5DF] bg-white px-2.5 py-1 font-semibold text-[#18714F] hover:border-[#18714F] hover:bg-[#F4F7F5]"
              >
                {concept.name} ↗
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* Comparison Drawer / Matrix (Toggled) */}
      {showMatrix && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
          <div className="p-6 rounded-2xl bg-white border border-[#DCE5DF] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#17211D] m-0">
                  Five-Concept Architecture Comparison Matrix
                </h2>
                <p className="text-xs text-[#65736C] m-0">
                  Evaluation breakdown across visual hierarchy, real estate distribution, and copilot interaction.
                </p>
              </div>
              <button
                onClick={() => setShowMatrix(false)}
                className="text-xs text-[#65736C] hover:text-[#17211D]"
              >
                Close ✕
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#DCE5DF] bg-[#F4F7F5] text-[#17211D] font-bold">
                    <th className="p-2.5">Concept</th>
                    <th className="p-2.5">Palette &amp; Tone</th>
                    <th className="p-2.5">Presenter &amp; Attendees</th>
                    <th className="p-2.5">Copilot Model</th>
                    <th className="p-2.5">Best Suited For</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE5DF]">
                  {CONCEPTS.map((c) => (
                    <tr
                      key={c.id}
                      className={c.id === activeConceptId ? 'bg-[#E7F3EC]/30 font-medium' : ''}
                    >
                      <td className="p-2.5 font-bold text-[#17211D]">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: c.accentColor }}
                          />
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-[#65736C]">{c.paletteDescription}</td>
                      <td className="p-2.5 text-[#65736C]">{c.layoutDescription}</td>
                      <td className="p-2.5 text-[#65736C]">{c.typography}</td>
                      <td className="p-2.5 text-[#17211D] font-medium">{c.bestFor}</td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => {
                            setActiveConceptId(c.id);
                            setSelectedForReview(c.id);
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#18714F] text-white hover:bg-[#12583D] transition-colors"
                        >
                          Select &amp; Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Active Concept Summary & Device Viewport Toolbar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 mb-4">
        <div className="p-4 rounded-xl bg-white border border-[#DCE5DF] flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#17211D]">
                Active Preview: {activeConcept.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E7F3EC] text-[#18714F] font-semibold border border-[#BCE1CE]">
                {activeConcept.badge}
              </span>
            </div>
            <p className="text-xs text-[#65736C] m-0 max-w-2xl">
              <strong>Architecture:</strong> {activeConcept.layoutDescription} · <strong>Typography:</strong> {activeConcept.typography}
            </p>
          </div>

          {/* Viewport Frame Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-[#F4F7F5] p-1 rounded-lg border border-[#DCE5DF]">
            <span className="text-[11px] font-semibold text-[#65736C] px-2">Frame:</span>
            <button
              onClick={() => setViewportMode('responsive')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewportMode === 'responsive'
                  ? 'bg-white text-[#18714F] shadow-2xs'
                  : 'text-[#65736C] hover:text-[#17211D]'
              }`}
              title="Full responsive width"
            >
              <MaximizeIcon size={13} />
              <span>Fluid</span>
            </button>
            <button
              onClick={() => setViewportMode('desktop')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewportMode === 'desktop'
                  ? 'bg-white text-[#18714F] shadow-2xs'
                  : 'text-[#65736C] hover:text-[#17211D]'
              }`}
              title="Desktop 1320px frame"
            >
              <LaptopIcon size={13} />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewportMode === 'tablet'
                  ? 'bg-white text-[#18714F] shadow-2xs'
                  : 'text-[#65736C] hover:text-[#17211D]'
              }`}
              title="Tablet 840px frame"
            >
              <TabletIcon size={13} />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewportMode === 'mobile'
                  ? 'bg-white text-[#18714F] shadow-2xs'
                  : 'text-[#65736C] hover:text-[#17211D]'
              }`}
              title="Mobile 410px frame"
            >
              <SmartphoneIcon size={13} />
              <span>Mobile</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Faithful Live Preview Container */}
      <section
        role="tabpanel"
        id={`panel-${activeConcept.id}`}
        aria-labelledby={`tab-${activeConcept.id}`}
        className="mx-auto px-4 sm:px-6 transition-all duration-300"
        style={{ maxWidth: getViewportMaxWidth() }}
      >
        <div
          className={`transition-all duration-200 ${
            viewportMode !== 'responsive'
              ? 'p-3 bg-slate-800 rounded-3xl shadow-2xl border-4 border-slate-700 mx-auto'
              : ''
          }`}
        >
          {/* Concept 1: Calm Studio */}
          {activeConceptId === 'calm-studio' && (
            <CalmStudio
              data={MOCK_MEETING_DATA}
              chatMessages={chatMessages}
              chatInput={chatInput}
              isTyping={isTyping}
              onChatInputChange={setChatInput}
              onSendMessage={sendMessage}
              quickPrompts={QUICK_PROMPTS}
            />
          )}

          {/* Concept 2: Focus Room */}
          {activeConceptId === 'focus-room' && (
            <FocusRoom
              data={MOCK_MEETING_DATA}
              chatMessages={chatMessages}
              chatInput={chatInput}
              isTyping={isTyping}
              onChatInputChange={setChatInput}
              onSendMessage={sendMessage}
              quickPrompts={QUICK_PROMPTS}
            />
          )}

          {/* Concept 3: Minutes Desk */}
          {activeConceptId === 'minutes-desk' && (
            <MinutesDesk
              data={MOCK_MEETING_DATA}
              chatMessages={chatMessages}
              chatInput={chatInput}
              isTyping={isTyping}
              onChatInputChange={setChatInput}
              onSendMessage={sendMessage}
              quickPrompts={QUICK_PROMPTS}
            />
          )}

          {/* Concept 4: Team Command */}
          {activeConceptId === 'team-command' && (
            <TeamCommand
              data={MOCK_MEETING_DATA}
              chatMessages={chatMessages}
              chatInput={chatInput}
              isTyping={isTyping}
              onChatInputChange={setChatInput}
              onSendMessage={sendMessage}
              quickPrompts={QUICK_PROMPTS}
            />
          )}

          {/* Concept 5: Orbit Live */}
          {activeConceptId === 'orbit-live' && (
            <OrbitLive
              data={MOCK_MEETING_DATA}
              chatMessages={chatMessages}
              chatInput={chatInput}
              isTyping={isTyping}
              onChatInputChange={setChatInput}
              onSendMessage={sendMessage}
              quickPrompts={QUICK_PROMPTS}
            />
          )}
        </div>
      </section>

      {/* Bottom Product Owner Selection Feedback Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
        <div className="p-5 rounded-2xl bg-white border border-[#DCE5DF] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E7F3EC] text-[#18714F] flex items-center justify-center">
              <ShieldCheckIcon size={20} />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#18714F]">
                Product Owner Review Status
              </div>
              <div className="text-sm font-bold text-[#17211D]">
                Current Choice: &ldquo;{CONCEPTS.find((c) => c.id === selectedForReview)?.name}&rdquo; is selected for review.
              </div>
              <div className="text-xs text-[#65736C]">
                Ready to proceed with user testing, component implementation, and responsive polish for this direction.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {CONCEPTS.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedForReview(c.id);
                  setActiveConceptId(c.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedForReview === c.id
                    ? 'bg-[#18714F] text-white border-[#18714F]'
                    : 'bg-[#F4F7F5] text-[#17211D] border-[#DCE5DF] hover:bg-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
