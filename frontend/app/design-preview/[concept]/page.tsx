import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConceptShowcase } from '../ConceptShowcase';
import { CONCEPTS } from '../mockData';
import type { ConceptId } from '../types';

interface ConceptPageProps {
  params: Promise<{ concept: string }>;
}

export async function generateMetadata({ params }: ConceptPageProps): Promise<Metadata> {
  const { concept: conceptId } = await params;
  const concept = CONCEPTS.find((item) => item.id === conceptId);
  return {
    title: concept ? `MinuteMate — ${concept.name} Sample` : 'MinuteMate Design Sample',
  };
}

export default async function ConceptSamplePage({ params }: ConceptPageProps) {
  const { concept: conceptId } = await params;
  const concept = CONCEPTS.find((item) => item.id === conceptId);

  if (!concept) notFound();

  return (
    <main>
      <ConceptShowcase initialConceptId={concept.id as ConceptId} />
    </main>
  );
}
