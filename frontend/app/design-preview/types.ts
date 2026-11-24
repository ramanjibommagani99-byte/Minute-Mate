export type ConceptId = 'calm-studio' | 'focus-room' | 'minutes-desk' | 'team-command' | 'orbit-live';

export interface ConceptDefinition {
  id: ConceptId;
  name: string;
  badge: string;
  tagline: string;
  paletteDescription: string;
  layoutDescription: string;
  typography: string;
  bestFor: string;
  accentColor: string;
  bgColor: string;
}

export interface AgendaItem {
  id: string;
  timeRange: string;
  title: string;
  status: 'completed' | 'active' | 'upcoming';
  durationMinutes: number;
}

export interface Attendee {
  id: string;
  name: string;
  role: string;
  isPresenter?: boolean;
  isMuted: boolean;
  avatarInitials: string;
  avatarBg: string;
  statusText: string;
}

export interface TranscriptEntry {
  id: string;
  timestamp: string;
  speaker: string;
  speakerRole: string;
  text: string;
  isHighlighted?: boolean;
  isPresenter?: boolean;
}

export interface DecisionItem {
  id: string;
  title: string;
  description: string;
  agreedAt: string;
  status: 'Formal Decision' | 'Consensus' | 'Preliminary';
  impact: string;
  citationTimestamp: string;
  approvedBy: string[];
}

export interface ActionProposal {
  id: string;
  title: string;
  owner: string;
  ownerInitials: string;
  dueDate: string;
  confidenceScore: number;
  citationTimestamp: string;
  status: 'Proposed' | 'Approved' | 'In Review';
  sourceQuote: string;
}

export interface ChatMessage {
  id: string;
  sender: 'copilot' | 'user';
  timestamp: string;
  content: string;
  citations?: string[];
  suggestedAction?: {
    type: 'decision' | 'task';
    label: string;
  };
}

export interface MeetingData {
  title: string;
  topic: string;
  timeElapsed: string;
  totalDuration: string;
  statusLabel: string;
  presenter: Attendee;
  attendees: Attendee[];
  agenda: AgendaItem[];
  transcript: TranscriptEntry[];
  decisions: DecisionItem[];
  actionProposals: ActionProposal[];
  initialChatMessages: ChatMessage[];
}

export type ViewportMode = 'responsive' | 'desktop' | 'tablet' | 'mobile';
