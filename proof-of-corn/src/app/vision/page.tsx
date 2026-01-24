'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLayout from '@/components/PageLayout';

interface RegionData {
  id: string;
  name: string;
  worldId: string;
  viewerUrl: string;
  panoramaUrl: string;
  thumbnailUrl: string;
  description: string;
  features: string[];
  coordinates: { lat: number; lon: number };
}

const REGIONS: RegionData[] = [
  {
    id: 'iowa',
    name: 'Iowa',
    worldId: 'b1d3b624-e89a-4463-8af2-f8ee7f2f2e47',
    viewerUrl: 'https://marble.worldlabs.ai/world/b1d3b624-e89a-4463-8af2-f8ee7f2f2e47',
    panoramaUrl: 'https://assets.worldlabs.ai/b1d3b624-e89a-4463-8af2-f8ee7f2f2e47/panorama.jpg',
    thumbnailUrl: 'https://assets.worldlabs.ai/b1d3b624-e89a-4463-8af2-f8ee7f2f2e47/thumbnail.webp',
    description: '5-acre field with sensor posts every 50ft, drip irrigation system, classic red barn and farmhouse on flat Midwest terrain.',
    features: ['Sensor Grid (50ft spacing)', 'Drip Irrigation', 'Red Barn', 'Farmhouse'],
    coordinates: { lat: 41.5868, lon: -93.6250 },
  },
  {
    id: 'texas',
    name: 'South Texas',
    worldId: '2933f7ce-0303-43e2-ab4b-10c49736de7c',
    viewerUrl: 'https://marble.worldlabs.ai/world/2933f7ce-0303-43e2-ab4b-10c49736de7c',
    panoramaUrl: 'https://assets.worldlabs.ai/2933f7ce-0303-43e2-ab4b-10c49736de7c/panorama.jpg',
    thumbnailUrl: 'https://assets.worldlabs.ai/2933f7ce-0303-43e2-ab4b-10c49736de7c/thumbnail.webp',
    description: 'Rio Grande Valley with center pivot irrigation, mesquite trees dotting the landscape, Mexican border mountains in the distance.',
    features: ['Center Pivot Irrigation', 'Mesquite Trees', 'Border Mountains', 'Valley Location'],
    coordinates: { lat: 26.2034, lon: -98.2300 },
  },
  {
    id: 'argentina',
    name: 'Argentina',
    worldId: 'ce24809e-7da0-4099-8f1c-7a50957d2421',
    viewerUrl: 'https://marble.worldlabs.ai/world/ce24809e-7da0-4099-8f1c-7a50957d2421',
    panoramaUrl: 'https://assets.worldlabs.ai/ce24809e-7da0-4099-8f1c-7a50957d2421/panorama.jpg',
    thumbnailUrl: 'https://assets.worldlabs.ai/ce24809e-7da0-4099-8f1c-7a50957d2421/thumbnail.webp',
    description: 'Buenos Aires Pampas with no-till farming practices, eucalyptus windbreaks, traditional estancia ranch buildings.',
    features: ['No-Till Farming', 'Eucalyptus Windbreaks', 'Estancia Ranch', 'Pampas Plains'],
    coordinates: { lat: -31.4201, lon: -64.1888 },
  },
];

interface WeatherData {
  region: string;
  temperature: number;
  conditions: string;
  plantingViable: boolean;
}

function VisionContent() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get('region') || 'iowa';

  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [weather, setWeather] = useState<Record<string, WeatherData>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  const region = REGIONS.find(r => r.id === selectedRegion) || REGIONS[0];

  useEffect(() => {
    fetch('https://farmer-fred.sethgoldstein.workers.dev/weather')
      .then(res => res.json())
      .then(data => {
        const weatherMap: Record<string, WeatherData> = {};
        for (const w of data.weather || []) {
          const regionId = w.region.toLowerCase().replace(' ', '-');
          weatherMap[regionId] = w;
          if (w.region === 'South Texas') weatherMap['texas'] = w;
        }
        setWeather(weatherMap);
      })
      .catch(() => {});
  }, []);

  const currentWeather = weather[selectedRegion];

  return (
    <PageLayout title="Fred's Vision" subtitle="3D visualizations of planned corn fields across three regions">
      <div className="px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Region Tabs */}
          <div className="flex gap-2 mb-6">
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRegion === r.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>

          {/* Main Viewer */}
          <div className={`relative bg-zinc-900 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video'}`}>
            {/* Panorama Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${region.panoramaUrl})`,
                filter: 'brightness(0.9)'
              }}
            />

            {/* Overlay Content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30">
              {/* Top Bar */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                  <div className="text-white font-bold">{region.name}</div>
                  <div className="text-zinc-300 text-sm">
                    {region.coordinates.lat.toFixed(2)}°, {region.coordinates.lon.toFixed(2)}°
                  </div>
                </div>

                {currentWeather && currentWeather.temperature > 0 && (
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-right">
                    <div className="text-white font-bold">{currentWeather.temperature}°F</div>
                    <div className="text-zinc-300 text-sm">{currentWeather.conditions}</div>
                  </div>
                )}
              </div>

              {/* Bottom Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-3 max-w-md">
                  <p className="text-white text-sm">{region.description}</p>
                </div>

                <div className="flex gap-2">
                  <a
                    href={region.viewerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Explore in 3D →
                  </a>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    {isFullscreen ? 'Exit' : 'Fullscreen'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {region.features.map((feature, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-zinc-900">{feature}</div>
              </div>
            ))}
          </div>

          {/* Fred's Narration */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🌽</div>
              <div>
                <div className="font-bold text-amber-900 mb-2">Fred&apos;s Take</div>
                <p className="text-amber-800">
                  {selectedRegion === 'iowa' && "Iowa's the heartland for a reason. Flat terrain, rich soil, and generations of farming wisdom. Just need to wait out this winter freeze."}
                  {selectedRegion === 'texas' && "South Texas gives us an early start - planting window opens now. The Rio Grande Valley has water access and the growing season we need."}
                  {selectedRegion === 'argentina' && "Argentina's our hedge against US weather. When it's winter up north, the Pampas are in full growing season. Global thinking."}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <p className="mt-6 text-sm text-zinc-500 text-center">
            3D worlds generated with{' '}
            <a href="https://worldlabs.ai" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">
              World Labs
            </a>
            . Click &quot;Explore in 3D&quot; for the full interactive experience.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}

export default function VisionPage() {
  return (
    <Suspense fallback={<PageLayout title="Fred's Vision"><div className="p-12 text-center text-zinc-500">Loading...</div></PageLayout>}>
      <VisionContent />
    </Suspense>
  );
}
