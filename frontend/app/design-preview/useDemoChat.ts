'use client';

import { useState } from 'react';
import { ChatMessage } from './types';
import { MOCK_MEETING_DATA } from './mockData';

export function useDemoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MEETING_DATA.initialChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      timestamp: '09:24:18',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyContent = '';
      let citations: string[] = [];

      if (lower.includes('liam') || lower.includes('runbook') || lower.includes('doc') || lower.includes('playbook')) {
        replyContent =
          'Liam Vance confirmed at [09:22:30] that he will sync with the documentation team and deliver the signed-off support runbook & troubleshooting playbook to Priya Patel by Thursday, Nov 21 at 5:00 PM.';
        citations = ['09:22:30'];
      } else if (lower.includes('rollback') || lower.includes('canary') || lower.includes('threshold') || lower.includes('gate')) {
        replyContent =
          'Formal Decision #1 agreed at [09:20:10]:\n• Stage 1 canary is strictly capped at 5% for the first 48 hours.\n• Rollback triggers automatically if error rates exceed 0.05% or synthetic p99 latency exceeds 200ms.';
        citations = ['09:19:22', '09:20:10'];
      } else if (lower.includes('alex') || lower.includes('grafana') || lower.includes('infra') || lower.includes('alert')) {
        replyContent =
          'Alex Rivera is configuring Grafana alert webhooks for the synthetic failover monitors at [09:24:02] with a target completion of Friday noon.';
        citations = ['09:24:02'];
      } else if (lower.includes('agenda') || lower.includes('pacing') || lower.includes('status')) {
        replyContent =
          'We are currently 24m into "Q4 launch readiness". Topic 1 (Multi-region failover) is complete. Currently in Topic 2: "November launch plan" with Maya Chen presenting.';
        citations = ['09:15:00', '09:24:18'];
      } else if (lower.includes('recap') || lower.includes('email') || lower.includes('summary')) {
        replyContent =
          'Draft Recap: Team aligned on 5% Stage-1 canary rollout with 200ms latency rollback ceiling. Action items: Liam delivering support runbook by Thu 5 PM; Alex setting Grafana alert webhooks by Fri noon.';
        citations = ['09:20:10', '09:22:30', '09:24:02'];
      } else {
        replyContent = `MinuteMate captured that. Based on Maya Chen's presentation on the November launch plan: 1 formal decision logged (5% canary rollout) and 2 action proposals recorded with 96%+ evidence confidence.`;
        citations = ['09:20:10'];
      }

      const copilotMsg: ChatMessage = {
        id: `msg-copilot-${Date.now()}`,
        sender: 'copilot',
        timestamp: '09:24:20',
        content: replyContent,
        citations,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 450);
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    sendMessage,
  };
}
