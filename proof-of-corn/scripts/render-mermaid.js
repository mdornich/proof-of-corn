#!/usr/bin/env node

/**
 * Mermaid Diagram Renderer
 * Uses mermaid.ink (free hosted renderer) — zero npm dependencies.
 * Base64-encodes Mermaid syntax, fetches SVG, saves locally.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DIAGRAMS_DIR = path.join(__dirname, '../diagrams');
const OUTPUT_DIR = path.join(__dirname, '../public/diagrams');

function fetchSVG(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchSVG(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} from mermaid.ink`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function encodeForMermaidInk(diagram) {
  // mermaid.ink uses base64 encoding of the diagram text
  return Buffer.from(diagram, 'utf8').toString('base64');
}

async function renderDiagram(mermaidSource, outputPath) {
  const encoded = encodeForMermaidInk(mermaidSource);
  const url = `https://mermaid.ink/svg/${encoded}`;

  console.log(`Fetching SVG from mermaid.ink...`);

  const svg = await fetchSVG(url);

  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, svg);
  console.log(`Saved: ${outputPath}`);
  return outputPath;
}

async function renderFile(filePath) {
  const basename = path.basename(filePath, '.mmd');
  const source = fs.readFileSync(filePath, 'utf8').trim();
  const outputPath = path.join(OUTPUT_DIR, `${basename}.svg`);

  console.log(`\nRendering: ${basename}.mmd`);
  return renderDiagram(source, outputPath);
}

async function renderAll() {
  if (!fs.existsSync(DIAGRAMS_DIR)) {
    console.error(`Diagrams directory not found: ${DIAGRAMS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(DIAGRAMS_DIR)
    .filter(f => f.endsWith('.mmd'))
    .sort();

  if (files.length === 0) {
    console.error('No .mmd files found in diagrams/');
    process.exit(1);
  }

  console.log(`Found ${files.length} diagram(s).\n`);

  for (const file of files) {
    await renderFile(path.join(DIAGRAMS_DIR, file));
  }

  console.log(`\nAll done. SVGs saved to public/diagrams/`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
Mermaid Diagram Renderer (mermaid.ink, zero dependencies)

Usage:
  node render-mermaid.js --diagram "<mermaid>" --output <path>   Render inline diagram
  node render-mermaid.js --file <path.mmd>                       Render a .mmd file
  node render-mermaid.js --all                                   Render all diagrams/*.mmd

Examples:
  node render-mermaid.js --diagram "graph TD; A-->B" --output public/diagrams/test.svg
  node render-mermaid.js --file diagrams/architecture.mmd
  node render-mermaid.js --all

Diagrams dir: ${DIAGRAMS_DIR}
Output dir:   ${OUTPUT_DIR}
    `);
    process.exit(0);
  }

  if (args.includes('--all')) {
    await renderAll();
    process.exit(0);
  }

  const fileIdx = args.indexOf('--file');
  if (fileIdx !== -1 && args[fileIdx + 1]) {
    let filePath = args[fileIdx + 1];
    // Resolve relative to cwd
    if (!path.isAbsolute(filePath)) {
      filePath = path.resolve(process.cwd(), filePath);
    }
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    await renderFile(filePath);
    process.exit(0);
  }

  const diagramIdx = args.indexOf('--diagram');
  const outputIdx = args.indexOf('--output');
  if (diagramIdx !== -1 && args[diagramIdx + 1]) {
    const source = args[diagramIdx + 1];
    let outputPath;
    if (outputIdx !== -1 && args[outputIdx + 1]) {
      outputPath = args[outputIdx + 1];
      if (!path.isAbsolute(outputPath)) {
        outputPath = path.resolve(process.cwd(), outputPath);
      }
    } else {
      outputPath = path.join(OUTPUT_DIR, `diagram-${Date.now()}.svg`);
    }
    await renderDiagram(source, outputPath);
    process.exit(0);
  }

  console.error('Invalid arguments. Use --help for usage.');
  process.exit(1);
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
