#!/usr/bin/env node

/**
 * Proof of Corn Visual Generator
 * Supports two backends:
 *   --backend google  (default) — Google Imagen 4, no npm deps
 *   --backend fal     — fal.ai FLUX Pro, requires node-fetch@2
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load credentials
const CREDS_PATH = path.join(process.env.HOME, '.claude/skills/api-credentials/credentials.json');

function loadCreds() {
  return JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
}

// --style: editorial-farm
// Design system constants — source of truth: proof-of-corn/BRAND.md
const STYLE_SUFFIX = `Clean editorial infographic style inspired by AVC.com and agricultural reportage. Primary accent: dark goldenrod (#b8860b) and amber (#d97706). Green (#16a34a) for growth, active states, outputs. Blue (#2563eb) for data, inputs, thinking. Background: off-white (#fafafa). Typography: serif headlines (Georgia feel), clean sans-serif labels. Data-forward layout with generous whitespace and subtle borders. Professional, editorial, agricultural. NOT pixel art, NOT cyberpunk, NOT neon, NOT CRT retro, NOT corporate SaaS. Warm, trustworthy, documentary tone.`;

const PRESETS = {
  architecture: {
    name: 'architecture',
    prompt: `Technical architecture diagram of an automated farming system called "Farmer Fred". Show a Cloudflare Worker at center connecting to: KV Store (weather cache), D1 Database (tasks, contacts, history), external APIs (weather, soil sensors), and email routing (ingest, categorize, respond). Use clean boxes and arrows. Label each component. Title: "PROOF OF CORN — System Architecture". ${STYLE_SUFFIX}`,
    aspect_ratio: '16:9'
  },
  timeline: {
    name: 'timeline',
    prompt: `Horizontal project timeline infographic for a corn growing challenge. Phases left to right: "Planning" (Jan-Feb, blue), "Planting" (Mar-Apr, green), "Growing" (May-Jul, amber), "Harvest" (Aug-Sep, green). Key milestones marked with dots. Current phase highlighted. Title: "PROOF OF CORN — Project Timeline". Subtitle: "From seed to harvest, powered by AI". ${STYLE_SUFFIX}`,
    aspect_ratio: '16:9'
  },
  regions: {
    name: 'regions',
    prompt: `Map infographic showing three US farming regions for a corn growing experiment. Region cards with temperature, rainfall, soil type, and status indicators. Regions: Midwest (primary), Southeast (warm climate test), Southwest (arid test). Each region has a small corn stalk icon and weather symbol. Title: "PROOF OF CORN — Regional Overview". ${STYLE_SUFFIX}`,
    aspect_ratio: '1:1'
  },
  budget: {
    name: 'budget',
    prompt: `Vertical budget breakdown infographic for a corn growing project. Categories with progress bars: Seeds & Supplies (green), Sensors & IoT (blue), Infrastructure (amber), Operations (amber), Reserve (gray). Total budget at top. Spent vs remaining shown. Clean bar chart visualization. Title: "PROOF OF CORN — Budget Tracker". ${STYLE_SUFFIX}`,
    aspect_ratio: '9:16'
  },
  'weekly-status': {
    name: 'weekly-status',
    prompt: `Weekly status card for a farm automation project. Four quadrants: Weather (temperature + conditions for 3 regions), Activity (emails processed, tasks completed, follow-ups sent as counters), Budget (progress bar with dollars), Next Milestone (text callout). Week number prominently displayed. Title: "PROOF OF CORN — Week N Status". ${STYLE_SUFFIX}`,
    aspect_ratio: '1:1'
  }
};

// --- Google Imagen backend (no npm deps) ---

const IMAGEN_MODEL = 'imagen-4.0-generate-001';

async function generateWithGoogle(prompt, name, aspectRatio = '1:1') {
  const creds = loadCreds();
  const apiKey = process.env.GOOGLE_API_KEY || creds.google?.gemini?.api_key;
  if (!apiKey) {
    throw new Error('No Google API key found. Set GOOGLE_API_KEY or add to credentials.json');
  }

  console.log(`\nGenerating: ${name}`);
  console.log(`Backend: Google Imagen 4`);
  console.log(`Aspect ratio: ${aspectRatio}`);
  console.log(`Submitting...`);

  const payload = JSON.stringify({
    instances: [{ prompt: prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: aspectRatio
    }
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_MODEL}:predict?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Imagen API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const imageData = data.predictions?.[0]?.bytesBase64Encoded
    || data.generatedImages?.[0]?.image?.bytesBase64Encoded;

  if (!imageData) {
    throw new Error('No image data in response');
  }

  console.log(`Generation complete.`);

  const outputDir = path.join(__dirname, '../generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `${name}-${Date.now()}.png`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));

  console.log(`Saved: ${filepath}`);
  return filepath;
}

// --- fal.ai backend (requires node-fetch@2) ---

const FAL_API_BASE = 'https://queue.fal.run';
const FAL_MODEL = 'fal-ai/flux-pro/v1.1';

function aspectRatioToSize(ratio) {
  const sizes = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1344, height: 768 },
    '9:16': { width: 768, height: 1344 },
    '4:3': { width: 1152, height: 896 }
  };
  return sizes[ratio] || sizes['1:1'];
}

async function generateWithFal(prompt, name, aspectRatio = '1:1') {
  const creds = loadCreds();
  const apiKey = creds.fal?.primary?.api_key;
  if (!apiKey) {
    throw new Error('No fal.ai API key found in credentials.json');
  }

  console.log(`\nGenerating: ${name}`);
  console.log(`Backend: fal.ai FLUX Pro`);
  console.log(`Aspect ratio: ${aspectRatio}`);
  console.log(`Submitting...`);

  const size = aspectRatioToSize(aspectRatio);
  const fetch = (await import('node-fetch')).default;

  const response = await fetch(`${FAL_API_BASE}/${FAL_MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt,
      image_size: { width: size.width, height: size.height },
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: false,
      output_format: 'png'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`fal.ai error ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const requestId = result.request_id;
  console.log(`Request submitted. ID: ${requestId}`);
  console.log(`Waiting for generation...`);

  const statusUrl = `${FAL_API_BASE}/${FAL_MODEL}/requests/${requestId}`;
  let attempts = 0;

  while (attempts < 60) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusResponse = await fetch(statusUrl, {
      headers: { 'Authorization': `Key ${apiKey}` }
    });

    if (!statusResponse.ok) {
      throw new Error(`Status check failed: ${statusResponse.status}`);
    }

    const status = await statusResponse.json();

    if (status.status === 'COMPLETED') {
      console.log(`Generation complete.`);

      const imageResponse = await fetch(status.images[0].url);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      const outputDir = path.join(__dirname, '../generated');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = `${name}-${Date.now()}.png`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, imageBuffer);

      console.log(`Saved: ${filepath}`);
      return filepath;

    } else if (status.status === 'FAILED') {
      throw new Error(`Generation failed: ${status.error || 'Unknown error'}`);
    }

    process.stdout.write('.');
    attempts++;
  }

  throw new Error('Timeout waiting for generation');
}

// --- CLI ---

async function generateImage(prompt, name, aspectRatio, backend) {
  if (backend === 'fal') {
    return generateWithFal(prompt, name, aspectRatio);
  }
  return generateWithGoogle(prompt, name, aspectRatio);
}

async function main() {
  const args = process.argv.slice(2);

  const backendIdx = args.indexOf('--backend');
  const backend = (backendIdx !== -1 && args[backendIdx + 1]) ? args[backendIdx + 1] : 'google';

  if (args.includes('--help') || args.length === 0) {
    console.log(`
Proof of Corn Visual Generator

Usage:
  node generate-visual.js --preset <name>                   Generate from preset
  node generate-visual.js --prompt "<text>"                 Generate from custom prompt
  node generate-visual.js --list                            List available presets
  node generate-visual.js --all                             Generate all presets
  node generate-visual.js --preset <name> --backend fal     Use fal.ai instead of Google

Backends:
  google  (default)  Google Imagen 4 — no npm deps, uses GOOGLE_API_KEY or credentials.json
  fal                fal.ai FLUX Pro — requires node-fetch@2

Presets:
${Object.entries(PRESETS).map(([id, config]) => `  ${id.padEnd(16)} (${config.aspect_ratio})`).join('\n')}

Output: ./generated/
    `);
    process.exit(0);
  }

  if (args.includes('--list')) {
    console.log('\nAvailable Presets:\n');
    Object.entries(PRESETS).forEach(([id, config]) => {
      console.log(`  ${id.padEnd(16)} (${config.aspect_ratio})`);
    });
    console.log(`\n5 presets available.`);
    console.log(`\nBackend: ${backend}`);
    process.exit(0);
  }

  if (args.includes('--all')) {
    console.log(`Generating all presets (${backend})...\n`);
    for (const [id, config] of Object.entries(PRESETS)) {
      await generateImage(config.prompt, config.name, config.aspect_ratio, backend);
      console.log('');
    }
    console.log('\nAll done. Check ./generated/');
    process.exit(0);
  }

  const presetIdx = args.indexOf('--preset');
  if (presetIdx !== -1 && args[presetIdx + 1]) {
    const presetName = args[presetIdx + 1];
    const config = PRESETS[presetName];
    if (!config) {
      console.error(`Preset "${presetName}" not found. Use --list to see available presets.`);
      process.exit(1);
    }
    await generateImage(config.prompt, config.name, config.aspect_ratio, backend);
    process.exit(0);
  }

  const promptIdx = args.indexOf('--prompt');
  if (promptIdx !== -1 && args[promptIdx + 1]) {
    const customPrompt = args[promptIdx + 1];
    const fullPrompt = `${customPrompt} ${STYLE_SUFFIX}`;
    await generateImage(fullPrompt, `custom-${Date.now()}`, '1:1', backend);
    process.exit(0);
  }

  console.error('Invalid arguments. Use --help for usage.');
  process.exit(1);
}

main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
