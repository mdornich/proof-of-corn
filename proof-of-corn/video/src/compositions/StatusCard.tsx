import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

const regionSchema = z.object({
  name: z.string(),
  status: z.string(),
});

export const statusCardSchema = z.object({
  week: z.number(),
  regions: z.array(regionSchema),
  emailCount: z.number(),
  budgetSpent: z.number(),
  budgetTotal: z.number(),
});

type StatusCardProps = z.infer<typeof statusCardSchema>;

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

export const StatusCard: React.FC<StatusCardProps> = ({
  week,
  regions,
  emailCount,
  budgetSpent,
  budgetTotal,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSpring = spring({ frame, fps, config: { damping: 30 } });
  const contentSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 30 },
  });

  const pct = budgetSpent / budgetTotal;
  const barProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 40, stiffness: 60 },
  });
  const barWidth = interpolate(barProgress, [0, 1], [0, pct * 100]);

  const counterProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 50, stiffness: 100 },
  });
  const displayedEmails = Math.round(
    emailCount * Math.min(counterProgress, 1)
  );
  const displayedBudget = Math.round(
    budgetSpent * Math.min(counterProgress, 1)
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: TOKENS.bg,
        fontFamily: TOKENS.fontSans,
        padding: 60,
        opacity: fadeIn,
      }}
    >
      {/* Header */}
      <div
        style={{
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: TOKENS.amber,
            letterSpacing: 4,
            marginBottom: 8,
          }}
        >
          PROOF OF CORN
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: TOKENS.text,
            lineHeight: 1,
            fontFamily: TOKENS.fontSerif,
          }}
        >
          Week {week}
        </div>
      </div>

      {/* Content grid */}
      <div
        style={{
          opacity: interpolate(contentSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(contentSpring, [0, 1], [20, 0])}px)`,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* Regions row */}
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {regions.map((region) => (
            <div
              key={region.name}
              style={{
                flex: 1,
                backgroundColor: "#252525",
                borderRadius: 12,
                padding: 20,
                borderTop: `3px solid ${TOKENS.blue}`,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  color: TOKENS.muted,
                  marginBottom: 6,
                  fontWeight: 500,
                }}
              >
                {region.name}
              </div>
              <div
                style={{
                  fontSize: 20,
                  color: TOKENS.green,
                  fontWeight: 700,
                }}
              >
                {region.status}
              </div>
            </div>
          ))}
        </div>

        {/* Emails metric */}
        <div
          style={{
            backgroundColor: "#252525",
            borderRadius: 12,
            padding: 28,
            borderLeft: `4px solid ${TOKENS.blue}`,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: TOKENS.muted,
              marginBottom: 4,
              fontWeight: 500,
            }}
          >
            Emails Processed
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: TOKENS.blue,
              lineHeight: 1,
            }}
          >
            {displayedEmails}
          </div>
        </div>

        {/* Budget bar */}
        <div
          style={{
            backgroundColor: "#252525",
            borderRadius: 12,
            padding: 28,
            borderLeft: `4px solid ${TOKENS.amber}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 18,
                color: TOKENS.muted,
                fontWeight: 500,
              }}
            >
              Budget
            </div>
            <div
              style={{
                fontSize: 18,
                color: TOKENS.muted,
              }}
            >
              ${displayedBudget.toLocaleString()} / $
              {budgetTotal.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: 20,
              backgroundColor: "#333",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${barWidth}%`,
                height: "100%",
                backgroundColor: TOKENS.amber,
                borderRadius: 10,
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: 24,
        }}
      >
        <div
          style={{
            width: 40,
            height: 3,
            backgroundColor: TOKENS.amber,
            borderRadius: 2,
            margin: "0 auto 16px",
          }}
        />
        <div
          style={{
            fontSize: 18,
            color: TOKENS.muted,
            fontWeight: 500,
            letterSpacing: 2,
          }}
        >
          proofofcorn.com
        </div>
      </div>
    </AbsoluteFill>
  );
};
