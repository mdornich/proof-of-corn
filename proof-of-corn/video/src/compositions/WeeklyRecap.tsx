import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";
import { z } from "zod";

const weatherItemSchema = z.object({
  region: z.string(),
  tempHigh: z.number(),
  tempLow: z.number(),
  status: z.string(),
});

export const weeklyRecapSchema = z.object({
  week: z.number(),
  dateRange: z.string(),
  weatherData: z.array(weatherItemSchema),
  emailsProcessed: z.number(),
  tasksCompleted: z.number(),
  followUpsSent: z.number(),
  budgetSpent: z.number(),
  budgetTotal: z.number(),
  nextMilestone: z.string(),
});

type WeeklyRecapProps = z.infer<typeof weeklyRecapSchema>;

// Source of truth: proof-of-corn/BRAND.md
const TOKENS = {
  bg: "#0a0a0a",
  bgLight: "#fafafa",
  accent: "#b8860b",
  amber: "#d97706",
  green: "#16a34a",
  blue: "#3b82f6",
  text: "#ededed",
  muted: "#71717a",
  border: "#27272a",
  fontSerif: 'Georgia, "Times New Roman", serif',
  fontSans: "system-ui, -apple-system, sans-serif",
  fontMono: 'ui-monospace, "Geist Mono", monospace',
};

const AnimatedCounter: React.FC<{
  value: number;
  prefix?: string;
  frame: number;
  startFrame: number;
  fps: number;
}> = ({ value, prefix = "", frame, startFrame, fps }) => {
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 50, stiffness: 100 },
  });
  const displayed = Math.round(value * Math.min(progress, 1));
  return (
    <span>
      {prefix}
      {displayed.toLocaleString()}
    </span>
  );
};

// Scene 1: Title Card (0-2s, frames 0-59)
const TitleScene: React.FC<{ week: number; dateRange: string }> = ({
  week,
  dateRange,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ frame, fps, config: { damping: 30 } });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.bg,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: TOKENS.fontSerif,
      }}
    >
      <div
        style={{
          transform: `translateY(${interpolate(titleY, [0, 1], [60, 0])}px)`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: TOKENS.amber,
            letterSpacing: 6,
            fontFamily: TOKENS.fontSans,
            marginBottom: 24,
          }}
        >
          PROOF OF CORN
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: TOKENS.text,
            lineHeight: 1,
          }}
        >
          Week {week}
        </div>
        <div
          style={{
            fontSize: 28,
            color: TOKENS.muted,
            marginTop: 20,
            opacity: subtitleOpacity,
          }}
        >
          {dateRange}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 80,
          width: 60,
          height: 4,
          backgroundColor: TOKENS.amber,
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

// Scene 2: Weather (2-5s, frames 60-149)
const WeatherScene: React.FC<{
  weatherData: WeeklyRecapProps["weatherData"];
}> = ({ weatherData }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.bg,
        fontFamily: TOKENS.fontSans,
        padding: 60,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 24,
          color: TOKENS.amber,
          letterSpacing: 4,
          marginBottom: 48,
          fontWeight: 600,
        }}
      >
        WEATHER REPORT
      </div>
      {weatherData.map((region, i) => {
        const delay = i * 8;
        const cardProgress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 30 },
        });
        const translateX = interpolate(cardProgress, [0, 1], [80, 0]);
        const opacity = interpolate(cardProgress, [0, 1], [0, 1]);

        return (
          <div
            key={region.region}
            style={{
              transform: `translateX(${translateX}px)`,
              opacity,
              backgroundColor: "#252525",
              borderRadius: 16,
              padding: 36,
              marginBottom: 20,
              borderLeft: `4px solid ${TOKENS.blue}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 30, fontWeight: 700, color: TOKENS.text }}>
                {region.region}
              </div>
              <div style={{ fontSize: 22, color: TOKENS.green, fontWeight: 600 }}>
                {region.status}
              </div>
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, color: TOKENS.text, marginTop: 12 }}>
              {region.tempHigh}°
              <span style={{ fontSize: 28, color: TOKENS.muted, fontWeight: 400 }}>
                {" "}/ {region.tempLow}°F
              </span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Scene 3: Activity (5-9s, frames 150-269)
const ActivityScene: React.FC<{
  emailsProcessed: number;
  tasksCompleted: number;
  followUpsSent: number;
}> = ({ emailsProcessed, tasksCompleted, followUpsSent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const metrics = [
    { label: "Emails Processed", value: emailsProcessed, color: TOKENS.blue },
    { label: "Tasks Completed", value: tasksCompleted, color: TOKENS.green },
    { label: "Follow-ups Sent", value: followUpsSent, color: TOKENS.amber },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.bg,
        fontFamily: TOKENS.fontSans,
        padding: 60,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 24,
          color: TOKENS.amber,
          letterSpacing: 4,
          marginBottom: 60,
          fontWeight: 600,
        }}
      >
        ACTIVITY
      </div>
      {metrics.map((metric, i) => {
        const delay = i * 12;
        const scaleProgress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 20, stiffness: 80 },
        });

        return (
          <div
            key={metric.label}
            style={{
              marginBottom: 48,
              opacity: interpolate(scaleProgress, [0, 1], [0, 1]),
              transform: `scale(${interpolate(scaleProgress, [0, 1], [0.8, 1])})`,
            }}
          >
            <div style={{ fontSize: 22, color: TOKENS.muted, marginBottom: 8, fontWeight: 500 }}>
              {metric.label}
            </div>
            <div style={{ fontSize: 96, fontWeight: 800, color: metric.color, lineHeight: 1 }}>
              <AnimatedCounter
                value={metric.value}
                frame={frame}
                startFrame={delay}
                fps={fps}
              />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Scene 4: Budget (9-12s, frames 270-359)
const BudgetScene: React.FC<{
  budgetSpent: number;
  budgetTotal: number;
}> = ({ budgetSpent, budgetTotal }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const barProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 40, stiffness: 60 },
  });
  const pct = budgetSpent / budgetTotal;
  const barWidth = interpolate(barProgress, [0, 1], [0, pct * 100]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.bg,
        fontFamily: TOKENS.fontSans,
        padding: 60,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 24,
          color: TOKENS.amber,
          letterSpacing: 4,
          marginBottom: 60,
          fontWeight: 600,
        }}
      >
        BUDGET
      </div>
      <div style={{ fontSize: 72, fontWeight: 800, color: TOKENS.text, marginBottom: 8 }}>
        <AnimatedCounter
          value={budgetSpent}
          prefix="$"
          frame={frame}
          startFrame={10}
          fps={fps}
        />
      </div>
      <div style={{ fontSize: 28, color: TOKENS.muted, marginBottom: 48 }}>
        of ${budgetTotal.toLocaleString()} total
      </div>
      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: 32,
          backgroundColor: "#252525",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            backgroundColor: pct > 0.8 ? "#dc2626" : TOKENS.green,
            borderRadius: 16,
            transition: "background-color 0.3s",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 22,
          color: TOKENS.muted,
          marginTop: 16,
          textAlign: "right",
        }}
      >
        {Math.round(pct * 100)}% used
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: Closing (12-15s, frames 360-449)
const ClosingScene: React.FC<{ nextMilestone: string }> = ({
  nextMilestone,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const milestoneY = spring({
    frame: frame - 15,
    fps,
    config: { damping: 30 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.bg,
        fontFamily: TOKENS.fontSerif,
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeIn,
      }}
    >
      <div style={{ textAlign: "center", padding: 60 }}>
        <div
          style={{
            fontSize: 24,
            color: TOKENS.muted,
            letterSpacing: 4,
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          NEXT MILESTONE
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: TOKENS.green,
            marginBottom: 80,
            transform: `translateY(${interpolate(milestoneY, [0, 1], [30, 0])}px)`,
            lineHeight: 1.3,
          }}
        >
          {nextMilestone}
        </div>
        <div
          style={{
            width: 60,
            height: 4,
            backgroundColor: TOKENS.amber,
            borderRadius: 2,
            margin: "0 auto",
            marginBottom: 40,
          }}
        />
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: TOKENS.text,
            letterSpacing: 2,
          }}
        >
          proofofcorn.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Main composition
export const WeeklyRecap: React.FC<WeeklyRecapProps> = (props) => {
  return (
    <AbsoluteFill style={{ backgroundColor: TOKENS.bg }}>
      {/* Scene 1: Title (0-2s) */}
      <Sequence from={0} durationInFrames={60}>
        <TitleScene week={props.week} dateRange={props.dateRange} />
      </Sequence>

      {/* Scene 2: Weather (2-5s) */}
      <Sequence from={60} durationInFrames={90}>
        <WeatherScene weatherData={props.weatherData} />
      </Sequence>

      {/* Scene 3: Activity (5-9s) */}
      <Sequence from={150} durationInFrames={120}>
        <ActivityScene
          emailsProcessed={props.emailsProcessed}
          tasksCompleted={props.tasksCompleted}
          followUpsSent={props.followUpsSent}
        />
      </Sequence>

      {/* Scene 4: Budget (9-12s) */}
      <Sequence from={270} durationInFrames={90}>
        <BudgetScene
          budgetSpent={props.budgetSpent}
          budgetTotal={props.budgetTotal}
        />
      </Sequence>

      {/* Scene 5: Closing (12-15s) */}
      <Sequence from={360} durationInFrames={90}>
        <ClosingScene nextMilestone={props.nextMilestone} />
      </Sequence>
    </AbsoluteFill>
  );
};
