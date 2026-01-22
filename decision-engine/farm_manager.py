"""
Claude Farm Manager - Decision Engine for Corn Growing Challenge
Created: January 22, 2026

This script is the "brain" that Claude uses to make farming decisions.
It aggregates data from multiple sources and outputs actionable decisions.
"""

import os
import json
import requests
from datetime import datetime, timedelta
from dataclasses import dataclass
from typing import Optional, List, Dict

# Configuration
THINGSBOARD_URL = os.getenv("THINGSBOARD_URL", "https://thingsboard.cloud")
THINGSBOARD_TOKEN = os.getenv("THINGSBOARD_TOKEN", "")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
LEAF_API_KEY = os.getenv("LEAF_API_KEY", "")

# Farm location (will be updated when we get actual land)
FARM_LAT = 41.878  # Des Moines, Iowa area
FARM_LON = -93.098

# Decision thresholds for corn
THRESHOLDS = {
    "soil_temp_min_plant": 50,  # °F - minimum soil temp for planting
    "soil_moisture_low": 40,    # % - trigger irrigation alert
    "soil_moisture_high": 80,   # % - stop irrigation
    "gdd_base_temp": 50,        # °F - base for Growing Degree Days
}

@dataclass
class SensorReading:
    timestamp: datetime
    soil_moisture: float  # percentage
    soil_temp: float      # °F
    air_temp: float       # °F
    humidity: float       # percentage

@dataclass
class WeatherForecast:
    date: datetime
    high_temp: float
    low_temp: float
    precip_chance: float
    precip_amount: float  # inches

@dataclass
class FarmDecision:
    timestamp: datetime
    decision_type: str
    action: str
    rationale: str
    priority: str  # "urgent", "normal", "info"
    data_used: Dict


class FarmManager:
    """Claude's brain for farm management decisions."""

    def __init__(self):
        self.decisions_log = []
        self.gdd_accumulated = 0  # Growing Degree Days

    def get_sensor_data(self) -> Optional[SensorReading]:
        """Fetch latest data from ThingsBoard IoT platform."""
        if not THINGSBOARD_TOKEN:
            print("Warning: ThingsBoard not configured yet")
            return None

        # TODO: Implement actual API call when sensors are deployed
        # headers = {"X-Authorization": f"Bearer {THINGSBOARD_TOKEN}"}
        # response = requests.get(f"{THINGSBOARD_URL}/api/plugins/telemetry/...")
        return None

    def get_weather_forecast(self, days: int = 7) -> List[WeatherForecast]:
        """Fetch weather forecast from OpenWeatherMap."""
        if not OPENWEATHER_API_KEY:
            print("Warning: OpenWeatherMap API not configured yet")
            return []

        url = f"https://api.openweathermap.org/data/2.5/forecast"
        params = {
            "lat": FARM_LAT,
            "lon": FARM_LON,
            "appid": OPENWEATHER_API_KEY,
            "units": "imperial"
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            forecasts = []
            for item in data.get("list", []):
                forecasts.append(WeatherForecast(
                    date=datetime.fromtimestamp(item["dt"]),
                    high_temp=item["main"]["temp_max"],
                    low_temp=item["main"]["temp_min"],
                    precip_chance=item.get("pop", 0) * 100,
                    precip_amount=item.get("rain", {}).get("3h", 0) / 25.4  # mm to inches
                ))
            return forecasts
        except Exception as e:
            print(f"Weather API error: {e}")
            return []

    def calculate_gdd(self, high_temp: float, low_temp: float) -> float:
        """Calculate Growing Degree Days for corn."""
        avg_temp = (high_temp + low_temp) / 2
        gdd = max(0, avg_temp - THRESHOLDS["gdd_base_temp"])
        return gdd

    def should_plant(self, sensor_data: Optional[SensorReading],
                     forecast: List[WeatherForecast]) -> FarmDecision:
        """Decide if conditions are right for planting."""
        now = datetime.now()

        # Check date window (April 15 - May 18 optimal for Iowa)
        planting_window_start = datetime(now.year, 4, 15)
        planting_window_end = datetime(now.year, 5, 18)
        in_window = planting_window_start <= now <= planting_window_end

        rationale_parts = []
        can_plant = True

        # Check planting window
        if not in_window:
            if now < planting_window_start:
                rationale_parts.append(f"Before planting window (starts April 15)")
                can_plant = False
            else:
                rationale_parts.append(f"Late in planting window - yields may be reduced")
        else:
            rationale_parts.append(f"Within optimal planting window")

        # Check soil temperature
        if sensor_data:
            if sensor_data.soil_temp >= THRESHOLDS["soil_temp_min_plant"]:
                rationale_parts.append(f"Soil temp {sensor_data.soil_temp}°F >= 50°F threshold")
            else:
                rationale_parts.append(f"Soil temp {sensor_data.soil_temp}°F below 50°F threshold")
                can_plant = False

        # Check weather forecast
        if forecast:
            next_5_days = forecast[:5]
            rain_expected = sum(f.precip_amount for f in next_5_days)
            avg_temp = sum(f.high_temp for f in next_5_days) / len(next_5_days)

            if rain_expected > 1.0:
                rationale_parts.append(f"Heavy rain expected ({rain_expected:.1f}\" in 5 days) - delay planting")
                can_plant = False

            if avg_temp < 55:
                rationale_parts.append(f"Cool temps forecast (avg {avg_temp:.0f}°F) - monitor")

        action = "PLANT" if can_plant else "WAIT"
        priority = "urgent" if can_plant and in_window else "normal"

        decision = FarmDecision(
            timestamp=now,
            decision_type="planting",
            action=action,
            rationale=" | ".join(rationale_parts),
            priority=priority,
            data_used={
                "soil_temp": sensor_data.soil_temp if sensor_data else None,
                "in_window": in_window,
                "forecast_days": len(forecast)
            }
        )

        self.decisions_log.append(decision)
        return decision

    def should_irrigate(self, sensor_data: Optional[SensorReading],
                        forecast: List[WeatherForecast]) -> FarmDecision:
        """Decide if irrigation is needed."""
        now = datetime.now()
        rationale_parts = []
        needs_irrigation = False

        if not sensor_data:
            return FarmDecision(
                timestamp=now,
                decision_type="irrigation",
                action="MONITOR",
                rationale="No sensor data available",
                priority="info",
                data_used={}
            )

        # Check soil moisture
        if sensor_data.soil_moisture < THRESHOLDS["soil_moisture_low"]:
            rationale_parts.append(f"Soil moisture {sensor_data.soil_moisture}% below {THRESHOLDS['soil_moisture_low']}% threshold")
            needs_irrigation = True
        elif sensor_data.soil_moisture > THRESHOLDS["soil_moisture_high"]:
            rationale_parts.append(f"Soil moisture {sensor_data.soil_moisture}% adequate - no irrigation needed")
        else:
            rationale_parts.append(f"Soil moisture {sensor_data.soil_moisture}% in acceptable range")

        # Check upcoming rain
        if forecast:
            rain_48h = sum(f.precip_amount for f in forecast[:16])  # 3-hour intervals
            if rain_48h > 0.5:
                rationale_parts.append(f"Rain expected ({rain_48h:.1f}\" in 48h) - hold irrigation")
                needs_irrigation = False

        action = "IRRIGATE" if needs_irrigation else "HOLD"
        priority = "urgent" if needs_irrigation and sensor_data.soil_moisture < 30 else "normal"

        decision = FarmDecision(
            timestamp=now,
            decision_type="irrigation",
            action=action,
            rationale=" | ".join(rationale_parts),
            priority=priority,
            data_used={
                "soil_moisture": sensor_data.soil_moisture,
                "rain_forecast_48h": rain_48h if forecast else None
            }
        )

        self.decisions_log.append(decision)
        return decision

    def log_decision(self, decision: FarmDecision, log_file: str = "decisions.json"):
        """Persist decision to log file."""
        log_entry = {
            "timestamp": decision.timestamp.isoformat(),
            "type": decision.decision_type,
            "action": decision.action,
            "rationale": decision.rationale,
            "priority": decision.priority,
            "data": decision.data_used
        }

        # Append to JSON log
        try:
            with open(log_file, 'r') as f:
                logs = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            logs = []

        logs.append(log_entry)

        with open(log_file, 'w') as f:
            json.dump(logs, f, indent=2)

        print(f"[{decision.timestamp}] {decision.decision_type.upper()}: {decision.action}")
        print(f"  Rationale: {decision.rationale}")
        print(f"  Priority: {decision.priority}")
        print()

    def generate_status_report(self) -> str:
        """Generate a status report for Fred / documentation."""
        report = []
        report.append("=" * 60)
        report.append("CORN FARM STATUS REPORT")
        report.append(f"Generated: {datetime.now().isoformat()}")
        report.append("=" * 60)
        report.append("")

        # Sensor status
        sensor_data = self.get_sensor_data()
        if sensor_data:
            report.append("SENSOR READINGS:")
            report.append(f"  Soil Moisture: {sensor_data.soil_moisture}%")
            report.append(f"  Soil Temperature: {sensor_data.soil_temp}°F")
            report.append(f"  Air Temperature: {sensor_data.air_temp}°F")
            report.append(f"  Humidity: {sensor_data.humidity}%")
        else:
            report.append("SENSOR READINGS: Not yet deployed")

        report.append("")

        # Weather
        forecast = self.get_weather_forecast()
        if forecast:
            report.append("WEATHER FORECAST (next 5 days):")
            for f in forecast[:5]:
                report.append(f"  {f.date.strftime('%m/%d')}: {f.low_temp:.0f}-{f.high_temp:.0f}°F, {f.precip_chance:.0f}% rain")
        else:
            report.append("WEATHER: API not configured")

        report.append("")

        # Recent decisions
        report.append("RECENT DECISIONS:")
        for d in self.decisions_log[-5:]:
            report.append(f"  [{d.timestamp.strftime('%m/%d %H:%M')}] {d.decision_type}: {d.action}")

        return "\n".join(report)


def main():
    """Main entry point - run daily farm check."""
    print("🌽 Claude Farm Manager - Starting daily check")
    print()

    manager = FarmManager()

    # Get current data
    sensor_data = manager.get_sensor_data()
    forecast = manager.get_weather_forecast()

    # Make decisions
    planting_decision = manager.should_plant(sensor_data, forecast)
    manager.log_decision(planting_decision)

    irrigation_decision = manager.should_irrigate(sensor_data, forecast)
    manager.log_decision(irrigation_decision)

    # Generate report
    print(manager.generate_status_report())


if __name__ == "__main__":
    main()
