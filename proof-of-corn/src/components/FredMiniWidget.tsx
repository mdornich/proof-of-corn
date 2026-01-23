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
}

export default function FredMiniWidget() {
  const [fredState, setFredState] = useState<FredState>("dormant");
  const [currentRegion, setCurrentRegion] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("https://farmer-fred.sethgoldstein.workers.dev/weather");
        const data = await res.json();
        const regions = data.weather || [];
        const plantable = regions.find((w: WeatherData) => w.plantingViable);
        const interesting = plantable || regions.find((w: WeatherData) => w.temperature > 50) || regions[0];

        setCurrentRegion(interesting);
        setFredState(interesting?.plantingViable ? "active" : "monitoring");
      } catch {
        setFredState("dormant");
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

  // Dynamic background based on weather
  const getBgGradient = () => {
    if (!currentRegion) return "from-sky-200 to-green-200";
    const temp = currentRegion.temperature;
    if (temp < 32) return "from-slate-300 to-slate-200";
    if (temp > 85) return "from-orange-200 to-amber-100";
    return "from-sky-200 to-green-200";
  };

  return (
    <Link href="/fred" className="block">
      <div className={`relative w-16 h-16 bg-gradient-to-b ${getBgGradient()} border-2 border-amber-700 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-md`}>
        {/* Mini sun */}
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
          currentRegion && currentRegion.temperature > 85 ? "bg-orange-400" : "bg-yellow-300"
        } animate-pulse`} />

        {/* Snow if frozen */}
        {currentRegion && currentRegion.temperature < 32 && (
          <>
            <span className="absolute top-2 left-2 text-[8px]">❄</span>
            <span className="absolute top-4 right-3 text-[8px]">❄</span>
          </>
        )}

        {/* Mini corn */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-[2px]">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[10px]">🌽</span>
          ))}
        </div>

        {/* Mini Fred */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
          {/* State indicator */}
          <div className={`w-1.5 h-1.5 rounded-full ${stateColors[fredState]} animate-pulse mb-[1px]`} />
          {/* Tiny Fred */}
          <div className="flex flex-col items-center">
            <div className="w-3 h-1 bg-amber-500 rounded-t" /> {/* hat */}
            <div className="w-2 h-1 bg-gray-400 rounded-t -mt-[1px]" /> {/* gray hair */}
            <div className="w-2 h-2 bg-amber-300 rounded -mt-[1px]" /> {/* face */}
            <div className="w-2.5 h-2 bg-blue-700 rounded-b -mt-[1px]" /> {/* overalls */}
          </div>
        </div>

        {/* Ground */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${
          currentRegion && currentRegion.temperature < 32 ? "bg-slate-300" : "bg-amber-800"
        }`} />

        {/* Region indicator */}
        <div className="absolute top-0.5 left-0.5 text-[6px] font-mono bg-black/40 text-white px-0.5 rounded">
          {loading ? "..." : currentRegion?.region?.slice(0, 2).toUpperCase() || "??"}
        </div>
      </div>
    </Link>
  );
}
