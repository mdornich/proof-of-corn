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
    """Test current weather using One Call API 3.0."""
    print("\n" + "="*60)
    print("CURRENT WEATHER (One Call API 3.0)")
    print("="*60)

    # Using One Call API 3.0 (what Seth subscribed to)
    url = "https://api.openweathermap.org/data/3.0/onecall"
    params = {
        "lat": FARM_LAT,
        "lon": FARM_LON,
        "appid": api_key,
        "units": "imperial",
        "exclude": "minutely,hourly"  # Just get current + daily for this test
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        current = data.get('current', {})
        print(f"Temperature: {current.get('temp', 'N/A')}°F")
        print(f"Feels like: {current.get('feels_like', 'N/A')}°F")
        print(f"Humidity: {current.get('humidity', 'N/A')}%")
        print(f"Conditions: {current.get('weather', [{}])[0].get('description', 'N/A')}")
        print(f"Wind: {current.get('wind_speed', 'N/A')} mph")
        print(f"UV Index: {current.get('uvi', 'N/A')}")
        return data
    elif response.status_code == 401:
        print("Error 401: API key not activated yet (wait a few minutes)")
        print("Or check your key at: https://home.openweathermap.org/api_keys")
        return None
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None


def test_5day_forecast(api_key: str, onecall_data=None):
    """Test 8-day forecast from One Call API 3.0."""
    print("\n" + "="*60)
    print("8-DAY FORECAST (One Call API 3.0)")
    print("="*60)

    if onecall_data is None:
        # Fetch if not already fetched
        url = "https://api.openweathermap.org/data/3.0/onecall"
        params = {
            "lat": FARM_LAT,
            "lon": FARM_LON,
            "appid": api_key,
            "units": "imperial",
            "exclude": "minutely,hourly"
        }
        response = requests.get(url, params=params)
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            return False
        onecall_data = response.json()

    daily = onecall_data.get('daily', [])
    if not daily:
        print("No daily forecast data available")
        return False

    print(f"Forecast days: {len(daily)}")
    print()
    print("Daily Summary:")
    print("-" * 60)

    for day in daily[:8]:
        dt = datetime.fromtimestamp(day['dt'])
        date_str = dt.strftime("%a %m/%d")
        high = day['temp']['max']
        low = day['temp']['min']
        rain = day.get('rain', 0)  # mm
        rain_inches = rain / 25.4
        pop = day.get('pop', 0) * 100  # probability of precipitation
        condition = day.get('weather', [{}])[0].get('main', 'N/A')

        print(f"  {date_str}: {low:.0f}°F - {high:.0f}°F | {pop:.0f}% chance | {rain_inches:.2f}\" | {condition}")

    return True


def test_planting_conditions(api_key: str, onecall_data=None):
    """Check if conditions are suitable for corn planting."""
    print("\n" + "="*60)
    print("PLANTING CONDITIONS CHECK")
    print("="*60)

    if onecall_data is None:
        url = "https://api.openweathermap.org/data/3.0/onecall"
        params = {
            "lat": FARM_LAT,
            "lon": FARM_LON,
            "appid": api_key,
            "units": "imperial",
            "exclude": "minutely,hourly"
        }
        response = requests.get(url, params=params)
        if response.status_code != 200:
            print("Failed to get weather data")
            return False
        onecall_data = response.json()

    current_temp = onecall_data.get('current', {}).get('temp', 0)

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
