"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type FredState = "active" | "monitoring" | "thinking" | "dormant";

interface WeatherData {
  region: string;
  temperature: number;
  conditions: string;
  plantingViable: boolean;
  frostRisk?: boolean;
  evaluation?: {
    recommendation: string;
  };
}

export default function FredWidget() {
  const [fredState, setFredState] = useState<FredState>("dormant");
  const [currentThought, setCurrentThought] = useState("Waking up...");
  const [weather, setWeather] = useState<WeatherData[]>([]);
  const [currentRegion, setCurrentRegion] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("https://farmer-fred.sethgoldstein.workers.dev/weather");
        const data = await res.json();
        setWeather(data.weather || []);

        // Find the most interesting region (plantable > active weather > default to first)
        const regions = data.weather || [];
        const plantable = regions.find((w: WeatherData) => w.plantingViable);
        const interesting = plantable || regions.find((w: WeatherData) => w.temperature > 50) || regions[0];

        setCurrentRegion(interesting);

        if (interesting?.plantingViable) {
          setFredState("active");
          setCurrentThought(`Checking the ${interesting.region} fields. Window is open...`);
        } else if (interesting?.frostRisk) {
          setFredState("monitoring");
          setCurrentThought(`${interesting.region} is frozen. Keeping watch.`);
        } else {
          setFredState("monitoring");
          setCurrentThought(`Walking the ${interesting.region} fields.`);
        }
      } catch {
        setFredState("dormant");
        setCurrentThought("Resting... will check again soon.");
      }
      setLoading(false);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 120000);
    return () => clearInterval(interval);
  }, []);

  const stateColors: Record<FredState, string> = {
    active: "bg-green-500",
    monitoring: "bg-amber-500",
    thinking: "bg-blue-500",
    dormant: "bg-zinc-400"
  };

  // Dynamic sky based on weather
  const getSkyGradient = () => {
    if (!currentRegion) return "from-sky-300 via-sky-200 to-green-400";

    const temp = currentRegion.temperature;
    const conditions = currentRegion.conditions?.toLowerCase() || "";

    if (temp < 32) {
      // Frozen - gray/blue cold sky
      return "from-slate-400 via-slate-300 to-slate-200";
    } else if (conditions.includes("cloud") || conditions.includes("overcast")) {
      return "from-slate-300 via-gray-200 to-green-300";
    } else if (temp > 85) {
      // Hot - intense sun
      return "from-orange-200 via-amber-100 to-green-400";
    } else {
      // Nice day
      return "from-sky-300 via-sky-200 to-green-400";
    }
  };

  // Sun appearance based on weather
  const getSunStyle = () => {
    if (!currentRegion) return "bg-yellow-300";
    const conditions = currentRegion.conditions?.toLowerCase() || "";
    if (conditions.includes("cloud") || conditions.includes("overcast")) {
      return "bg-yellow-200 opacity-50";
    }
    if (currentRegion.temperature > 85) {
      return "bg-orange-400";
    }
    return "bg-yellow-300";
  };

  return (
    <Link href="/fred" className="block">
      <div className="bg-gradient-to-b from-sky-200 to-green-200 border-2 border-amber-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* Mini Scene */}
        <div className={`relative h-32 bg-gradient-to-b ${getSkyGradient()}`}>
          {/* Sun */}
          <div className={`absolute top-2 right-4 w-6 h-6 ${getSunStyle()} rounded-full animate-pulse`} />

          {/* Snow if freezing */}
          {currentRegion && currentRegion.temperature < 32 && (
            <div className="absolute inset-0 opacity-40">
              {[...Array(12)].map((_, i) => (
                <span key={i} className="absolute text-white text-xs animate-pulse"
                  style={{ left: `${(i * 8) + 4}%`, top: `${(i * 7) % 60}%` }}>❄</span>
              ))}
            </div>
          )}

          {/* Mini Corn Row */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="text-lg">🌽</span>
            ))}
          </div>

          {/* Mini Fred - Older, weathered */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            {/* State dot */}
            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${stateColors[fredState]} animate-pulse`} />
            {/* Older Fred */}
            <div className="text-center">
              {/* Straw hat */}
              <div className="w-8 h-2 bg-amber-500 rounded-t mx-auto" />
              <div className="w-6 h-1 bg-amber-600 mx-auto" />
              {/* Gray hair peeking */}
              <div className="w-5 h-1 bg-gray-400 rounded-t mx-auto -mb-[2px]" />
              {/* Weathered face */}
              <div className="w-5 h-4 bg-amber-300 rounded mx-auto relative">
                {/* Wrinkles/weathered look - darker skin tone */}
                <div className="absolute top-1 left-0.5 w-1 h-0.5 bg-amber-400 rounded" />
                <div className="absolute top-1 right-0.5 w-1 h-0.5 bg-amber-400 rounded" />
              </div>
              {/* Overalls */}
              <div className="w-6 h-5 bg-blue-700 rounded-b mx-auto -mt-[1px]" />
            </div>
          </div>

          {/* Ground - varies by region */}
          <div className={`absolute bottom-0 left-0 right-0 h-2 ${
            currentRegion && currentRegion.temperature < 32 ? "bg-slate-300" : "bg-amber-800"
          }`} />

          {/* Region label */}
          <div className="absolute top-2 left-2 text-[10px] font-mono bg-black/30 text-white px-1.5 py-0.5 rounded">
            {currentRegion?.region || "..."}
          </div>
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
                    w.region === currentRegion?.region
                      ? "bg-amber-700 ring-1 ring-amber-500"
                      : w.plantingViable ? "bg-green-800" : "bg-zinc-800"
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
