/**
 * High-Fidelity Broadcast Shot Capturer using Headless Chrome & Puppeteer
 * Renders authentic HTML5/CSS3 live demo screens into 1080p master frames.
 */

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const SHOTS = [
  { id: '1a', filename: 'shot_01a.png', dur: 15.0 },
  { id: '1b', filename: 'shot_01b.png', dur: 12.5 },
  { id: '2a', filename: 'shot_02a.png', dur: 11.5 },
  { id: '2b', filename: 'shot_02b.png', dur: 14.7 },
  { id: '3a', filename: 'shot_03a.png', dur: 13.8 },
  { id: '3b', filename: 'shot_03b.png', dur: 12.5 },
  { id: '4a', filename: 'shot_04a.png', dur: 12.5 },
  { id: '4b', filename: 'shot_04b.png', dur: 12.5 },
  { id: '5a', filename: 'shot_05a.png', dur: 16.1 },
  { id: '5b', filename: 'shot_05b.png', dur: 13.4 },
  { id: '5c', filename: 'shot_05c.png', dur: 13.3 },
  { id: '6a', filename: 'shot_06a.png', dur: 12.5 },
  { id: '6b', filename: 'shot_06b.png', dur: 13.7 },
];

async function captureAllShots() {
  const framesDir = path.join(__dirname, 'frames');
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
  }

  const stageHtmlPath = path.resolve(__dirname, 'broadcast_stage.html').replace(/\\/g, '/');
  console.log(`Loading stage from: file:///${stageHtmlPath}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1920,1080',
      '--font-render-hinting=none',
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  for (const shot of SHOTS) {
    const shotUrl = `file:///${stageHtmlPath}?shot=${shot.id}`;
    await page.goto(shotUrl, { waitUntil: 'networkidle0' });
    // Brief sleep to ensure all fonts and SVG vectors are fully rasterized
    await new Promise(r => setTimeout(r, 150));

    const outPath = path.join(framesDir, shot.filename);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`Captured ${shot.filename} (${shot.id}) -> ${outPath}`);
  }

  await browser.close();
  console.log(`Successfully captured all ${SHOTS.length} broadcast master frames.`);
}

captureAllShots().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
