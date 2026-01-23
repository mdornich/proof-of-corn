import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Story | Proof of Corn",
  description: "How a walk in San Francisco sparked a challenge to prove AI can grow corn.",
};

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-serif">
      {/* Header */}
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold hover:text-amber-600 transition-colors">
            Proof of Corn
          </Link>
          <nav className="flex gap-3 md:gap-6 text-xs md:text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <Link href="/story" className="text-zinc-900">Story</Link>
            <Link href="/log" className="hover:text-zinc-900 transition-colors">Log</Link>
            <Link href="/process" className="hidden sm:block hover:text-zinc-900 transition-colors">Process</Link>
            <Link href="/budget" className="hover:text-zinc-900 transition-colors">Budget</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <article className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-700 text-sm tracking-wide mb-4">THE ORIGIN</p>
          <h1 className="text-3xl font-bold mb-2">A Walk in San Francisco</h1>
          <p className="text-zinc-500 mb-12">January 21, 2026 &middot; 8:15 PM</p>

          <div className="prose-clean text-zinc-700">
            <p>
              It started with dinner. House of Nanking on Kearny Street, around 7pm on a
              Tuesday night. The kind of San Francisco evening where the fog hasn&apos;t
              rolled in yet and the city feels quiet—too quiet, maybe.
            </p>

            <p>
              <a href="https://x.com/fredwilson" className="text-amber-600 hover:underline">Fred Wilson</a> and
              I walked from the restaurant toward his hotel at 1 Hotel San Francisco
              by the Embarcadero. We&apos;d been talking about AI—not the hype, but the
              reality. What it can actually do. What it can&apos;t.
            </p>

            <p>
              I&apos;d been describing my experience with Claude Code. Something had shifted
              around New Year&apos;s. For the first time, I felt like I could do anything
              with software from my terminal. Not &ldquo;someday&rdquo;—now.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-6">The Moment: 8:15 PM</h2>

            <p className="text-sm text-zinc-500 mb-4">
              Walking along the Embarcadero toward 1 Hotel San Francisco
            </p>

            <div className="bg-white border border-zinc-200 rounded-lg p-6 my-8 font-mono text-sm space-y-4">
              <p><span className="text-zinc-500">SETH:</span> &ldquo;I can do anything I want with software from my terminal.&rdquo;</p>

              <p><span className="text-zinc-500">FRED:</span> &ldquo;That&apos;s not fire. You can&apos;t like grow corn.&rdquo;</p>

              <p><span className="text-zinc-500">SETH:</span> &ldquo;I bet you I could. You know what I mean? I&apos;m going to grow corn for you.&rdquo;</p>

              <p><span className="text-zinc-500">FRED:</span> &ldquo;That&apos;d be great. Thank you.&rdquo;</p>

              <p><span className="text-zinc-500">SETH:</span> &ldquo;I&apos;m going to figure it out and I&apos;m going to show you. And that&apos;ll be our first vibe coding project together.&rdquo;</p>

              <p><span className="text-zinc-500">FRED:</span> &ldquo;It&apos;s a physical thing.&rdquo;</p>

              <p><span className="text-zinc-500">SETH:</span> &ldquo;I will buy fucking land with an API via my terminal and I will hire some service to plant corn.&rdquo;</p>

              <p><span className="text-zinc-500">FRED:</span> &ldquo;Okay, well that&apos;s a little different... you&apos;re going to get somebody to grow corn for you. But that&apos;s not exactly what I&apos;m talking about. Like, you can hire Jeff to come and make dinner for you, but like you can&apos;t make dinner.&rdquo;</p>

              <p><span className="text-zinc-500">SETH:</span> &ldquo;No, but anything that could be done with technology, I can do now. Anything, which is insane.&rdquo;</p>
            </div>

            <p>
              That was the challenge. Fred&apos;s point was precise: there&apos;s a gap between
              digital and physical that AI can&apos;t cross. Code doesn&apos;t water plants.
              Prompts don&apos;t drive tractors. Language models don&apos;t know when to harvest.
            </p>

            <p>
              But there was something in his framing that I thought missed the mark.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-6">The Insight</h2>

            <p>
              I got home that night and opened Claude Code. Not to prove Fred wrong—but
              to explore whether he might be missing something.
            </p>

            <p>
              The insight isn&apos;t that AI needs to drive a tractor. It&apos;s that AI can
              orchestrate the systems and people who do. A farm manager doesn&apos;t personally
              plant every seed—they aggregate data, make decisions, coordinate contractors.
            </p>

            <p>
              Fred&apos;s analogy was: &ldquo;You can hire Jeff to make dinner, but you can&apos;t make dinner.&rdquo;
            </p>

            <p>
              But that&apos;s exactly what a restaurant owner does. They don&apos;t cook every meal.
              They hire chefs, source ingredients, manage inventory, make decisions about
              the menu. The output is dinner. The method is orchestration.
            </p>

            <p>
              What if Claude Code became a farm manager?
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-6">12 Hours Later</h2>

            <p>
              By the next afternoon, working with Claude Code:
            </p>

            <ul className="list-disc pl-6 space-y-2 my-6">
              <li>Registered proofofcorn.com via API</li>
              <li>Built and deployed this website</li>
              <li>Researched Iowa custom farming rates, land costs, planting windows</li>
              <li>Sent 10 outreach emails to extension offices, land companies, seed suppliers</li>
              <li>Created a decision engine for farming operations</li>
              <li>Made the first AI farming decision: <strong>WAIT</strong> (78 days to planting window)</li>
            </ul>

            <p>
              Total cost: $12.99 (the domain).
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-6">What We&apos;re Proving</h2>

            <p>
              This project isn&apos;t just about growing corn. It&apos;s about documenting what
              happens when you take AI seriously as a collaborator rather than a tool.
            </p>

            <p>
              Every decision will be logged. Every API call documented. Every dollar
              tracked. When we harvest corn in October, we&apos;ll have a complete record
              of how an idea became a reality—with AI as the orchestration layer.
            </p>

            <p>
              Fred, this one&apos;s for you.*
            </p>

            <p className="text-sm text-zinc-500 mt-8">
              *We&apos;re not alone in this. <a href="https://soltomato.fun" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">Sol Tomato</a> has
              Claude directly controlling a tomato plant via IoT sensors. That&apos;s the &ldquo;robot farmer&rdquo; approach—AI
              controlling hardware. Proof of Corn is the &ldquo;farm manager&rdquo; approach—AI orchestrating humans and services.
              Both prove the same point: AI can affect the physical world. The vibe coding movement is just getting started.
            </p>

            <div className="mt-12 pt-8 border-t border-zinc-200">
              <p className="text-zinc-500">
                — <a href="https://x.com/seth" className="text-amber-600 hover:underline">@seth</a>
                <br />
                <span className="text-sm">January 22, 2026</span>
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-200">
        <div className="max-w-2xl mx-auto text-sm text-zinc-500">
          <p className="mb-3">
            A project by{" "}
            <a href="https://x.com/seth" className="text-zinc-700 hover:underline" target="_blank" rel="noopener noreferrer">@seth</a>,
            inspired by{" "}
            <a href="https://x.com/fredwilson" className="text-zinc-700 hover:underline" target="_blank" rel="noopener noreferrer">@fredwilson</a>,
            orchestrated by Claude Code (Opus 4.5)
          </p>
          <p>
            Want to help? Land leads, ag expertise, vibe coders welcome:{" "}
            <a href="mailto:seth@proofofcorn.com" className="text-amber-600 hover:underline">seth@proofofcorn.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
