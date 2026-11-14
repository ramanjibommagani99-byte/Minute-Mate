import Link from "next/link";
import MeetingsList from "@/components/MeetingsList";

export default function DashboardPage() {
  return <main className="main"><p className="eyebrow">Your workspace</p><h1>Saved meetings</h1><p className="lead">Review the transcripts and notes you have added.</p><div className="actions"><Link className="button" href="/meetings/new">Add a meeting source</Link></div><section className="meeting-section"><MeetingsList /></section></main>;
}
