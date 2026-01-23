"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type FredState = "active" | "monitoring" | "thinking" | "dormant";

interface WeatherData {
  region: string;
  temperature: number;
  plantingViable: boolean;
  evaluation?: {
    recommendation: string;
  };
}

export default function FredWidget() {
  const [fredState, setFredState] = useState<FredState>("dormant");
  const [currentThought, setCurrentThought] = useState("Waking up...");
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("https://farmer-fred.sethgoldstein.workers.dev/weather");
        const data = await res.json();
        setWeather(data.weather || []);

        const texasViable = data.weather?.find((w: WeatherData) =>
          w.region === "South Texas" && w.plantingViable
        );

        if (texasViable) {
          setFredState("active");
          setCurrentThought("Texas window OPEN. Watching for land confirmation...");
        } else {
          setFredState("monitoring");
          setCurrentThought("Monitoring conditions across all regions.");
        }
      } catch {
        setFredState("dormant");
        setCurrentThought("Resting... will check again soon.");
      }
      setLoading(false);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 120000); // Every 2 min
    return () => clearInterval(interval);
  }, []);

  const stateColors: Record<FredState, string> = {
    active: "bg-green-500",
    monitoring: "bg-amber-500",
    thinking: "bg-blue-500",
    dormant: "bg-zinc-400"
  };

  return (
    <Link href="/fred" className="block">
      <div className="bg-gradient-to-b from-sky-200 to-green-200 border-2 border-amber-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* Mini Scene */}
        <div className="relative h-32 bg-gradient-to-b from-sky-300 via-sky-200 to-green-400">
          {/* Mini Sun */}
          <div className="absolute top-2 right-4 w-6 h-6 bg-yellow-300 rounded-full animate-pulse" />

          {/* Mini Corn Row */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="text-lg">🌽</span>
            ))}
          </div>

          {/* Mini Fred */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            {/* State dot */}
            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${stateColors[fredState]} animate-pulse`} />
            {/* Simple Fred */}
            <div className="text-center">
              <div className="w-6 h-2 bg-amber-600 rounded-t mx-auto" />
              <div className="w-5 h-4 bg-amber-200 rounded mx-auto" />
              <div className="w-6 h-5 bg-blue-600 rounded-b mx-auto -mt-[1px]" />
            </div>
          </div>

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-amber-800" />
        </div>

        {/* Status */}
        <div className="bg-zinc-900 text-white p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stateColors[fredState]}`} />
              <span className="font-mono text-xs uppercase">
                {loading ? "Loading..." : fredState}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500">LIVE</span>
          </div>

          <p className="text-xs text-amber-400 truncate">
            &ldquo;{currentThought}&rdquo;
          </p>

          {/* Mini Weather */}
          {weather.length > 0 && (
            <div className="flex gap-2 mt-2 text-[10px]">
              {weather.slice(0, 3).map((w) => (
                <div
                  key={w.region}
                  className={`px-1.5 py-0.5 rounded ${
                    w.plantingViable ? "bg-green-800" : "bg-zinc-800"
                  }`}
                >
                  {w.region.split(" ")[0]}: {w.temperature}°
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
