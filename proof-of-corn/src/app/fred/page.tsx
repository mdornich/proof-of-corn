"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FredStatus {
  weather?: {
    region: string;
    temperature: number;
    conditions: string;
    plantingViable: boolean;
    evaluation: {
      recommendation: string;
      reason: string;
    };
  }[];
  lastDecision?: {
    decision: string;
    rationale: string;
    actions: { type: string; payload: { description: string } }[];
    needsHumanApproval: boolean;
    nextSteps: string[];
  };
  timestamp?: string;
}

type FredState = "active" | "monitoring" | "thinking" | "dormant";

export default function FredPage() {
  const [status, setStatus] = useState<FredStatus | null>(null);
  const [fredState, setFredState] = useState<FredState>("dormant");
  const [currentThought, setCurrentThought] = useState("Waking up...");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch Fred's status
  const fetchStatus = async () => {
    try {
      setFredState("thinking");

      // Fetch weather
      const weatherRes = await fetch("https://farmer-fred.sethgoldstein.workers.dev/weather");
      const weatherData = await weatherRes.json();

      // Get last decision from log
      const logRes = await fetch("https://farmer-fred.sethgoldstein.workers.dev/log");
      const logData = await logRes.json();

      setStatus({
        weather: weatherData.weather,
        timestamp: weatherData.timestamp
      });

      // Determine Fred's state and thought based on data
      const texasViable = weatherData.weather?.find((w: { region: string; plantingViable: boolean }) =>
        w.region === "South Texas" && w.plantingViable
      );

      if (texasViable) {
        setFredState("active");
        setCurrentThought("Texas window is OPEN. Watching for land confirmation...");
      } else {
        setFredState("monitoring");
        setCurrentThought("Monitoring conditions. Iowa frozen, patience required.");
      }

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError("Fred is resting... (API unavailable)");
      setFredState("dormant");
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const stateColors: Record<FredState, string> = {
    active: "bg-green-500",
    monitoring: "bg-amber-500",
    thinking: "bg-blue-500",
    dormant: "bg-zinc-400"
  };

  const stateLabels: Record<FredState, string> = {
    active: "ACTIVE",
    monitoring: "MONITORING",
    thinking: "THINKING...",
    dormant: "DORMANT"
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 font-serif">
      {/* Header */}
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold hover:text-amber-600 transition-colors">
            Proof of Corn
          </Link>
          <nav className="flex gap-3 md:gap-6 text-xs md:text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <Link href="/story" className="hover:text-zinc-900 transition-colors">Story</Link>
            <Link href="/log" className="hover:text-zinc-900 transition-colors">Log</Link>
            <Link href="/fred" className="text-zinc-900">Fred</Link>
            <Link href="/budget" className="hover:text-zinc-900 transition-colors">Budget</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-amber-700 text-sm tracking-wide mb-4">LIVE VIEW</p>
          <h1 className="text-3xl font-bold mb-2">Farmer Fred</h1>
          <p className="text-zinc-500 mb-8">Autonomous agricultural agent • Watching the window</p>

          {/* The Tandoori Oven Window */}
          <div className="bg-gradient-to-b from-sky-100 to-green-100 border-4 border-amber-800 rounded-lg overflow-hidden shadow-2xl">
            {/* Sky and Field Background */}
            <div className="relative h-80 bg-gradient-to-b from-sky-300 via-sky-200 to-green-400">

              {/* Sun */}
              <div className="absolute top-6 right-12 w-16 h-16 bg-yellow-300 rounded-full shadow-lg animate-pulse" />

              {/* Clouds */}
              <div className="absolute top-8 left-12 text-white text-4xl opacity-80">☁️</div>
              <div className="absolute top-16 left-32 text-white text-2xl opacity-60">☁️</div>

              {/* Corn Stalks - Row 1 (back) */}
              <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-4 opacity-60">
                {[...Array(12)].map((_, i) => (
                  <div key={`back-${i}`} className="text-3xl">🌽</div>
                ))}
              </div>

              {/* Corn Stalks - Row 2 (middle) */}
              <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-3 opacity-80">
                {[...Array(14)].map((_, i) => (
                  <div key={`mid-${i}`} className="text-4xl">🌽</div>
                ))}
              </div>

              {/* Pixel Fred */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                {/* Fred's Body - Pixel Art Style */}
                <div className="relative">
                  {/* Hat */}
                  <div className="flex justify-center mb-[-2px]">
                    <div className="w-10 h-3 bg-amber-600 rounded-t-lg" />
                  </div>
                  <div className="flex justify-center mb-[-2px]">
                    <div className="w-14 h-2 bg-amber-700 rounded-sm" />
                  </div>

                  {/* Head */}
                  <div className="w-12 h-10 bg-amber-200 rounded-lg mx-auto relative">
                    {/* Eyes */}
                    <div className="absolute top-3 left-2 w-2 h-2 bg-zinc-800 rounded-full" />
                    <div className="absolute top-3 right-2 w-2 h-2 bg-zinc-800 rounded-full" />
                    {/* Smile */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 border-b-2 border-zinc-800 rounded-b-full" />
                  </div>

                  {/* Overalls */}
                  <div className="w-14 h-12 bg-blue-600 rounded-b-lg mx-auto relative mt-[-2px]">
                    {/* Overall straps */}
                    <div className="absolute top-0 left-2 w-2 h-4 bg-blue-700" />
                    <div className="absolute top-0 right-2 w-2 h-4 bg-blue-700" />
                    {/* Pocket */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-4 bg-blue-700 rounded-sm" />
                  </div>

                  {/* Arms */}
                  <div className="absolute top-14 -left-3 w-4 h-8 bg-amber-200 rounded-lg transform -rotate-12" />
                  <div className="absolute top-14 -right-3 w-4 h-8 bg-amber-200 rounded-lg transform rotate-12" />

                  {/* State Indicator */}
                  <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${stateColors[fredState]} animate-pulse`} />
                </div>

                {/* Name Tag */}
                <div className="mt-2 px-3 py-1 bg-white/90 rounded-full text-xs font-bold text-zinc-700 shadow">
                  FARMER FRED
                </div>
              </div>

              {/* Corn Stalks - Row 3 (front) */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
                {[...Array(16)].map((_, i) => (
                  <div key={`front-${i}`} className="text-5xl">🌽</div>
                ))}
              </div>

              {/* Ground */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-amber-800" />
            </div>

            {/* Status Bar */}
            <div className="bg-zinc-900 text-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${stateColors[fredState]} animate-pulse`} />
                  <span className="font-mono text-sm">{stateLabels[fredState]}</span>
                </div>
                <span className="text-zinc-500 text-xs font-mono">
                  {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : "Loading..."}
                </span>
              </div>

              {/* Thought Bubble */}
              <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-zinc-400 mb-1">💭 Current Thought</p>
                <p className="text-amber-400 font-medium">&ldquo;{currentThought}&rdquo;</p>
              </div>

              {error && (
                <div className="text-red-400 text-sm mb-4">{error}</div>
              )}
            </div>
          </div>

          {/* Weather Dashboard */}
          {status?.weather && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {status.weather.map((w) => (
                <div
                  key={w.region}
                  className={`p-4 rounded-lg border-2 ${
                    w.plantingViable
                      ? "bg-green-50 border-green-300"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{w.region}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      w.plantingViable
                        ? "bg-green-200 text-green-800"
                        : "bg-zinc-200 text-zinc-600"
                    }`}>
                      {w.evaluation?.recommendation || "CHECKING"}
                    </span>
                  </div>
                  <p className="text-3xl font-bold mb-1">{w.temperature}°F</p>
                  <p className="text-sm text-zinc-600 capitalize">{w.conditions}</p>
                </div>
              ))}
            </div>
          )}

          {/* Live Feed */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">📋 Activity Feed</h2>
            <div className="bg-white border border-zinc-200 rounded-lg divide-y divide-zinc-100">
              <FeedItem
                time="6:00 AM UTC"
                icon="🌡️"
                title="Daily weather check"
                description="Checked conditions across Iowa, Texas, and Argentina"
              />
              <FeedItem
                time="6:01 AM UTC"
                icon="🧠"
                title="Decision: Continue monitoring"
                description="Iowa at -5°F with frost risk. Texas window open but awaiting land confirmation."
              />
              <FeedItem
                time="Yesterday"
                icon="📧"
                title="Outreach sent"
                description="Contacted Texas AgriLife Extension (Hidalgo & Cameron counties)"
              />
              <FeedItem
                time="Jan 23"
                icon="🎉"
                title="Fred activated"
                description="First autonomous decision made. Cited fiduciary duty and regenerative principles."
              />
            </div>
          </div>

          {/* Constitution Preview */}
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <h2 className="text-xl font-bold mb-4">📜 Fred&apos;s Constitution</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "Fiduciary Duty",
                "Regenerative Agriculture",
                "Sustainable Practices",
                "Global Citizenship",
                "Full Transparency",
                "Human-Agent Collaboration"
              ].map((principle) => (
                <div key={principle} className="text-sm bg-white px-3 py-2 rounded border border-amber-200">
                  {principle}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-zinc-600">
              Fred operates under these 6 principles. Every decision references them.{" "}
              <a
                href="https://farmer-fred.sethgoldstein.workers.dev/constitution"
                className="text-amber-700 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                View full constitution →
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-200 mt-12">
        <div className="max-w-4xl mx-auto text-sm text-zinc-500">
          <p className="mb-3">
            Farmer Fred runs on Cloudflare Workers, makes decisions with Claude, and checks in daily at 6 AM UTC.
          </p>
          <p>
            <a
              href="https://farmer-fred.sethgoldstein.workers.dev"
              className="text-amber-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Fred&apos;s API →
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeedItem({ time, icon, title, description }: {
  time: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 hover:bg-zinc-50 transition-colors">
      <div className="flex gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{title}</h3>
            <span className="text-xs text-zinc-400 font-mono">{time}</span>
          </div>
          <p className="text-sm text-zinc-600 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
