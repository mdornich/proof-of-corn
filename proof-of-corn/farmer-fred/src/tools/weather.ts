/**
 * WEATHER TOOL
 *
 * Fetches weather data from OpenWeatherMap for all regions.
 */

import { CONSTITUTION } from "../constitution";

export interface RegionWeather {
  region: string;
  temperature: number;
  humidity: number;
  conditions: string;
  forecast: string;
  plantingViable: boolean;
  frostRisk: boolean;
  soilTempEstimate: number;
}

/**
 * Fetch weather for all regions
 */
export async function fetchAllRegionsWeather(
  apiKey: string
): Promise<RegionWeather[]> {
  const results: RegionWeather[] = [];

  for (const region of CONSTITUTION.regions) {
    try {
      const weather = await fetchRegionWeather(
        apiKey,
        region.name,
        region.coordinates.lat,
        region.coordinates.lon
      );
      results.push(weather);
    } catch (error) {
      console.error(`Failed to fetch weather for ${region.name}:`, error);
      results.push({
        region: region.name,
        temperature: 0,
        humidity: 0,
        conditions: "Unknown (API error)",
        forecast: "Unable to fetch forecast",
        plantingViable: false,
        frostRisk: true,
        soilTempEstimate: 0
      });
    }
  }

  return results;
}

/**
 * Fetch weather for a specific region
 * Uses OpenWeatherMap 2.5 API (free tier)
 */
export async function fetchRegionWeather(
  apiKey: string,
  regionName: string,
  lat: number,
  lon: number
): Promise<RegionWeather> {
  // Use OpenWeatherMap 2.5 API (free tier, up to 1000 calls/day)
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

  console.log(`[Weather] Fetching OWM 2.5 for ${regionName}`);

  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Weather] OWM 2.5 error: ${response.status} - ${errorText}`);
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  const temp = data.main?.temp || 0;
  const humidity = data.main?.humidity || 0;
  const conditions = data.weather?.[0]?.description || "Unknown";

  const soilTempEstimate = estimateSoilTemperature(temp);
  const frostRisk = temp < 36;
  const plantingViable = soilTempEstimate >= 50 && !frostRisk;

  // Simple forecast message based on current conditions
  const forecast = frostRisk
    ? `Current: ${Math.round(temp)}°F. FROST RISK present.`
    : `Current: ${Math.round(temp)}°F. Conditions: ${conditions}.`;

  return {
    region: regionName,
    temperature: Math.round(temp),
    humidity: Math.round(humidity),
    conditions,
    forecast,
    plantingViable,
    frostRisk,
    soilTempEstimate: Math.round(soilTempEstimate)
  };
}

/**
 * Estimate soil temperature from air temperature
 * Simplified model - soil lags air temp by ~10 degrees in winter
 */
function estimateSoilTemperature(airTemp: number): number {
  const month = new Date().getMonth();

  // In winter months, soil is warmer than air (lag effect)
  // In summer months, soil is cooler than air
  if (month >= 11 || month <= 2) {
    // Dec-Feb: soil is about 10°F warmer than air
    return airTemp + 10;
  } else if (month >= 3 && month <= 5) {
    // Mar-May: soil catching up, about 5°F diff
    return airTemp + 5;
  } else if (month >= 6 && month <= 8) {
    // Jun-Aug: soil slightly cooler
    return airTemp - 5;
  } else {
    // Sep-Nov: soil cooling slower
    return airTemp + 5;
  }
}

/**
 * Determine if it's a good day to plant
 */
export function evaluatePlantingConditions(weather: RegionWeather): {
  recommendation: "PLANT" | "WAIT" | "HOLD";
  reason: string;
} {
  if (weather.frostRisk) {
    return {
      recommendation: "HOLD",
      reason: "Frost risk detected. Wait for stable temperatures above 36°F."
    };
  }

  if (weather.soilTempEstimate < 50) {
    return {
      recommendation: "WAIT",
      reason: `Soil temperature estimated at ${weather.soilTempEstimate}°F. Corn needs 50°F+ for germination.`
    };
  }

  if (weather.soilTempEstimate >= 50 && weather.soilTempEstimate < 60) {
    return {
      recommendation: "WAIT",
      reason: `Soil at ${weather.soilTempEstimate}°F. Optimal is 60°F+. Planting possible but germination will be slow.`
    };
  }

  return {
    recommendation: "PLANT",
    reason: `Conditions favorable. Soil temp ~${weather.soilTempEstimate}°F, no frost risk. Good planting window.`
  };
}
