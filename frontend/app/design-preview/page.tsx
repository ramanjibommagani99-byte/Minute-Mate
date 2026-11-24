import { Metadata } from 'next';
import { ConceptShowcase } from './ConceptShowcase';

export const metadata: Metadata = {
  title: 'MinuteMate — Five Concept Design Showcase',
  description:
    'Compare five distinct in-meeting copilot architectures for MinuteMate: Calm Studio, Focus Room, Minutes Desk, Team Command, and Orbit Live.',
};

export default function DesignPreviewPage() {
  return (
    <main>
      <ConceptShowcase />
    </main>
  );
}
