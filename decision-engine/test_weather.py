#!/usr/bin/env python3
"""
Test script for OpenWeatherMap API integration.
Run this after setting OPENWEATHER_API_KEY environment variable.

Usage:
    export OPENWEATHER_API_KEY="your-api-key"
    python test_weather.py
"""

import os
import sys
import json
import requests
from datetime import datetime

# Target location: Des Moines, Iowa area (central Iowa)
FARM_LAT = 41.5868  # Des Moines latitude
FARM_LON = -93.6250  # Des Moines longitude
LOCATION_NAME = "Des Moines, Iowa (Proof of Corn target area)"

def test_current_weather(api_key: str):
    """Test current weather endpoint."""
    print("\n" + "="*60)
    print("CURRENT WEATHER")
    print("="*60)

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": FARM_LAT,
        "lon": FARM_LON,
        "appid": api_key,
        "units": "imperial"
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        print(f"Location: {data.get('name', 'Unknown')}")
        print(f"Temperature: {data['main']['temp']}°F")
        print(f"Feels like: {data['main']['feels_like']}°F")
        print(f"Humidity: {data['main']['humidity']}%")
        print(f"Conditions: {data['weather'][0]['description']}")
        print(f"Wind: {data['wind']['speed']} mph")
        return True
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return False


def test_5day_forecast(api_key: str):
    """Test 5-day forecast endpoint."""
    print("\n" + "="*60)
    print("5-DAY FORECAST")
    print("="*60)

    url = "https://api.openweathermap.org/data/2.5/forecast"
    params = {
        "lat": FARM_LAT,
        "lon": FARM_LON,
        "appid": api_key,
        "units": "imperial"
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        print(f"City: {data['city']['name']}")
        print(f"Forecast periods: {len(data['list'])}")
        print()

        # Group by day and show daily summary
        days = {}
        for item in data['list']:
            dt = datetime.fromtimestamp(item['dt'])
            day_key = dt.strftime("%Y-%m-%d")
            if day_key not in days:
                days[day_key] = {
                    "temps": [],
                    "precip": 0,
                    "conditions": []
                }
            days[day_key]["temps"].append(item['main']['temp'])
            days[day_key]["precip"] += item.get('rain', {}).get('3h', 0) / 25.4  # mm to inches
            days[day_key]["conditions"].append(item['weather'][0]['main'])

        print("Daily Summary:")
        print("-" * 50)
        for day, info in list(days.items())[:5]:
            high = max(info['temps'])
            low = min(info['temps'])
            precip = info['precip']
            # Most common condition
            condition = max(set(info['conditions']), key=info['conditions'].count)
            print(f"  {day}: {low:.0f}°F - {high:.0f}°F | {precip:.2f}\" rain | {condition}")

        return True
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return False


def test_planting_conditions(api_key: str):
    """Check if conditions are suitable for corn planting."""
    print("\n" + "="*60)
    print("PLANTING CONDITIONS CHECK")
    print("="*60)

    # Get current weather
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": FARM_LAT,
        "lon": FARM_LON,
        "appid": api_key,
        "units": "imperial"
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        print("Failed to get weather data")
        return False

    data = response.json()
    current_temp = data['main']['temp']

    # Check planting window
    now = datetime.now()
    planting_start = datetime(now.year, 4, 11)
    planting_end = datetime(now.year, 5, 18)
    in_window = planting_start <= now <= planting_end

    # Planting requirements for corn
    SOIL_TEMP_THRESHOLD = 50  # °F
    AIR_TEMP_PROXY = 50  # Using air temp as proxy until we have soil sensors

    print(f"Current air temperature: {current_temp}°F")
    print(f"Soil temp threshold: {SOIL_TEMP_THRESHOLD}°F (using air temp as proxy)")
    print()

    print("Planting Window Check:")
    if now < planting_start:
        days_until = (planting_start - now).days
        print(f"  ❌ Before window - {days_until} days until April 11")
    elif now > planting_end:
        print(f"  ⚠️  Past optimal window - yields may be reduced")
    else:
        print(f"  ✓ Within optimal planting window (April 11 - May 18)")

    print()
    print("Temperature Check:")
    if current_temp >= AIR_TEMP_PROXY:
        print(f"  ✓ Temperature {current_temp}°F >= {AIR_TEMP_PROXY}°F threshold")
    else:
        print(f"  ❌ Temperature {current_temp}°F below {AIR_TEMP_PROXY}°F threshold")

    print()
    print("Decision:")
    if in_window and current_temp >= AIR_TEMP_PROXY:
        print("  🌽 CONDITIONS FAVORABLE FOR PLANTING")
    elif not in_window:
        print("  ⏳ WAIT - Not in planting window yet")
    else:
        print("  ⏳ WAIT - Temperature too low")

    return True


def main():
    api_key = os.getenv("OPENWEATHER_API_KEY")

    if not api_key:
        print("="*60)
        print("OpenWeatherMap API Test - Proof of Corn")
        print("="*60)
        print()
        print("ERROR: OPENWEATHER_API_KEY environment variable not set")
        print()
        print("To get your free API key:")
        print("1. Go to https://openweathermap.org/api")
        print("2. Click 'Sign Up' and create an account")
        print("3. Go to your API keys page")
        print("4. Copy your API key")
        print()
        print("Then run:")
        print("  export OPENWEATHER_API_KEY='your-api-key'")
        print("  python test_weather.py")
        print()
        sys.exit(1)

    print("="*60)
    print("OpenWeatherMap API Test - Proof of Corn")
    print("="*60)
    print(f"Target Location: {LOCATION_NAME}")
    print(f"Coordinates: {FARM_LAT}, {FARM_LON}")

    # Run tests
    success = True
    success = test_current_weather(api_key) and success
    success = test_5day_forecast(api_key) and success
    success = test_planting_conditions(api_key) and success

    print()
    print("="*60)
    if success:
        print("✓ All tests passed! Weather API is configured correctly.")
    else:
        print("✗ Some tests failed. Check the errors above.")
    print("="*60)


if __name__ == "__main__":
    main()
