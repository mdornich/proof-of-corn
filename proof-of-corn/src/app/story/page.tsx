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
          <nav className="flex gap-6 text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <Link href="/story" className="text-zinc-900">Story</Link>
            <Link href="/log" className="hover:text-zinc-900 transition-colors">Log</Link>
            <Link href="/process" className="hover:text-zinc-900 transition-colors">Process</Link>
            <Link href="/budget" className="hover:text-zinc-900 transition-colors">Budget</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <article className="px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-amber-700 text-sm tracking-wide mb-4">THE ORIGIN</p>
          <h1 className="text-3xl font-bold mb-2">A Walk in San Francisco</h1>
          <p className="text-zinc-500 mb-12">January 21, 2026</p>

          <div className="prose-clean text-zinc-700">
            <p>
              It started with dinner. House of Nanking on Kearny Street, around 8pm on a
              Wednesday night. The kind of San Francisco evening where the fog hasn&apos;t
              rolled in yet and the city still feels electric.
            </p>

            <p>
              <a href="https://x.com/fredwilson" className="text-amber-600 hover:underline">@fredwilson</a> and
              I walked from the restaurant toward his hotel at 1 Hotel San Francisco
              by the Embarcadero. We&apos;d been talking about AI—not the hype, but the
              reality. What it can actually do. What it can&apos;t.
            </p>

            <p>
              Fred&apos;s been in tech for decades. He&apos;s seen every wave. And he had a
              point that cut through all the noise:
            </p>

            <blockquote className="border-l-4 border-amber-400 pl-6 my-8 text-xl italic text-zinc-600">
              &ldquo;Well, you can&apos;t grow corn.&rdquo;
            </blockquote>

            <p>
              It was a simple statement. AI can write code. AI can generate images.
              AI can pass the bar exam. But can it affect the physical world? Can it
              make something actually grow?
            </p>

            <p>
              The argument is that there&apos;s a gap between digital and physical that AI
              can&apos;t cross. Code doesn&apos;t water plants. Prompts don&apos;t drive tractors.
              Language models don&apos;t know when to harvest.
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-6">The Response</h2>

            <p>
              I got home that night and opened Claude Code. Not to prove Fred wrong—
              but to explore whether he might be missing something.
            </p>

            <p>
              The insight isn&apos;t that AI needs to drive a tractor. It&apos;s that AI can
              orchestrate the systems and people who do. A farm manager doesn&apos;t personally
              plant every seed—they aggregate data, make decisions, coordinate contractors.
            </p>

            <p>
              What if Claude Code became that farm manager?
            </p>

            <h2 className="text-2xl font-bold mt-12 mb-6">My Dinner with AI</h2>

            <p>
              There&apos;s something almost <em>My Dinner with Andre</em> about this moment
              we&apos;re living through. Two people walking through a city, having a
              conversation that seems philosophical but is actually deeply practical.
            </p>

            <p>
              Except now, the conversation doesn&apos;t end at the hotel lobby. It continues
              with a collaborator that never sleeps, that can research Iowa farm leases
              at midnight, that can write decision-making algorithms while you sleep,
              that can register a domain and deploy a website before you&apos;ve finished
              your coffee the next morning.
            </p>

            <p>
              This is what vibe coding actually means. It&apos;s not about prompting AI to
              generate code. It&apos;s about having an idea—born from a real conversation
              with a real friend on a real street—and then collaborating with AI to
              bring it into existence.
            </p>

            <p>
              The prompt wasn&apos;t &ldquo;generate a website.&rdquo; The prompt was a challenge
              from a friend. The website, the domain, the IoT architecture, the custom
              farming contracts, the decision engine—all of that emerged from the
              collaboration.
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
              Fred, this one&apos;s for you.
            </p>

            <div className="mt-16 pt-8 border-t border-zinc-200">
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
          <p>
            A project by{" "}
            <a href="https://x.com/seth" className="text-zinc-700 hover:underline">@seth</a>,
            inspired by{" "}
            <a href="https://x.com/fredwilson" className="text-zinc-700 hover:underline">@fredwilson</a>,
            orchestrated by Claude Code (Opus 4.5)
          </p>
        </div>
      </footer>
    </div>
  );
}
