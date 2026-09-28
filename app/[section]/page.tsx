import Link from "next/link";

const sections: Record<string, { label: string; title: string; intro: string; notes: string[] }> = {
  journal: {
    label: "THE JOURNAL",
    title: "Notes from the in-between.",
    intro: "Personal essays on settling into the UK, university life, and the small rituals that make a place feel like home.",
    notes: ["Learning to arrive without rushing.", "The quiet magic of an ordinary Tuesday.", "University, but make it a little softer."],
  },
  japanese: {
    label: "LANGUAGE STUDIES",
    title: "毎日少しずつ.",
    intro: "Study notes, vocabulary, and reflections from learning Japanese one ordinary day at a time.",
    notes: ["言葉の間 — learning to hear the spaces.", "A pocket guide to useful train phrases.", "The joy of recognising a phrase."],
  },
  about: {
    label: "A LITTLE ABOUT ME",
    title: "Engineer by training, curious by nature.",
    intro: "I’m Tarik — an international student, maker, and perpetual beginner based in the north of England.",
    notes: ["Why this notebook exists", "What I’m learning next", "A short list of current interests"],
  },
  newsletter: {
    label: "THE NOTEBOOK",
    title: "A thoughtful note, once in a while.",
    intro: "New essays, project logs, and small observations from the week. No noise.",
    notes: ["Subscribe from the homepage to join the list."],
  },
  admin: {
    label: "PRIVATE AREA",
    title: "Admin dashboard.",
    intro: "A secure editorial workspace for managing posts, drafts, images, and newsletter subscribers.",
    notes: ["Connect Supabase Auth to enable sign in.", "Storage and publishing controls live here."],
  },
};

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const content = sections[section] ?? sections.journal;
  return (
    <main className="subpage page-width">
      <Link href="/" className="back-link">← Back to Ibi no Noto</Link>
      <p className="eyebrow">{content.label}</p>
      <h1>{content.title}</h1>
      <p className="subpage-intro">{content.intro}</p>
      <div className="subpage-list">{content.notes.map((note, index) => <article key={note}><span>0{index + 1}</span><h2>{note}</h2><b>Read note ↗</b></article>)}</div>
    </main>
  );
}
