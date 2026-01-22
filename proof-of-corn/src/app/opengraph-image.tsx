import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Proof of Corn - Can AI grow corn?';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#fafafa',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            color: '#b8860b',
            fontSize: 24,
            letterSpacing: '0.1em',
            marginBottom: 24,
          }}
        >
          A CASE STUDY
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: '#18181b',
            marginBottom: 32,
            lineHeight: 1.1,
          }}
        >
          Can AI grow corn?
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#52525b',
            lineHeight: 1.5,
            maxWidth: 900,
          }}
        >
          @fredwilson challenged @seth: AI can write code, but it can't affect the physical world. This is our response.
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: '#18181b',
              fontWeight: 'bold',
            }}
          >
            proofofcorn.com
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#a1a1aa',
            }}
          >
            Orchestrated by Claude Code
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
