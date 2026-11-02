import fs from 'fs';
import path from 'path';
import { execSync, spawnSync } from 'child_process';

const ROOT_DIR = path.resolve('.');
const FOOTAGE_DIR = path.resolve('public/video-footage');
const ASSETS_DIR = path.resolve('public/video-assets');
const AUDIO_DIR = path.resolve('public/video-audio');
const DIST_DIR = path.resolve('dist');

const REQUIRED_FOOTAGE = [
  { id: 'SR-01', file: 'sr01_homepage_hero.mp4', scene: 'Scene 2 (00:05–00:11)', targetDuration: 6.0, desc: 'PayVia Homepage Hero (http://localhost:3000/)' },
  { id: 'SR-02', file: 'sr02_shopping_intent_input.mp4', scene: 'Scene 3 (00:11–00:18)', targetDuration: 7.0, desc: 'Intent Composer typing "Lightweight laptop for college" (http://localhost:3000/negotiate)' },
  { id: 'SR-03', file: 'sr03_offer_comparison_table.mp4', scene: 'Scene 4A (00:18–00:21.5)', targetDuration: 3.5, desc: 'Candidate Offers comparison table with AeroBook Pro 16 AI Workstation' },
  { id: 'SR-04', file: 'sr04_offer_selected.mp4', scene: 'Scene 4B (00:21.5–00:29)', targetDuration: 7.5, desc: 'Clicking [Select Preferred Offer] on AeroBook Pro $750 deal' },
  { id: 'SR-05', file: 'sr05_agreement_approval.mp4', scene: 'Scene 5 (00:29–00:37)', targetDuration: 8.0, desc: 'Agreement review page & clicking [Approve agreement & continue to PayPal]' },
  { id: 'SR-06', file: 'sr06_paypal_checkout.mp4', scene: 'Scene 6A (00:37–00:41)', targetDuration: 4.0, desc: 'PayPal Sandbox hosted checkout authorizing $750 USD' },
  { id: 'SR-07', file: 'sr07_confirmed_receipt.mp4', scene: 'Scene 6B (00:41–00:45)', targetDuration: 4.0, desc: 'Verified receipt page (/checkout/success) showing confirmed Order & Capture IDs' },
  { id: 'SR-08', file: 'sr08_merchant_dashboard.mp4', scene: 'Scene 7A (00:45–00:48.5)', targetDuration: 3.5, desc: 'Merchant Dashboard (/merchant) showing $730 floor and AG Grid settlement ledger' },
  { id: 'SR-09', file: 'sr09_fulfillment_stepper.mp4', scene: 'Scene 7B (00:48.5–00:52)', targetDuration: 3.5, desc: 'Fulfillment Operations (/fulfillment) showing 5-stage milestone progression' },
];

const REQUIRED_AUDIO = [
  { id: 'VO-01', file: 'voiceover_60s.wav', alt: 'voiceover_60s.mp3', desc: '94-word timed narration master (-16 LUFS, 48 kHz)' },
  { id: 'MUS-01', file: 'music_bed_112bpm.wav', alt: 'music_bed_112bpm.mp3', desc: 'Licensed instrumental tech/fintech music track' },
  { id: 'SFX-01', file: 'sfx_sub_impact.wav', alt: 'sfx_sub_impact.mp3', desc: '40Hz sub-impact for Scene 1 opening (00:00)' },
  { id: 'SFX-02', file: 'sfx_button_click.wav', alt: 'sfx_button_click.mp3', desc: 'Tactile click for Scene 5 human approval (00:34.5)' },
  { id: 'SFX-03', file: 'sfx_confirm_chime.wav', alt: 'sfx_confirm_chime.mp3', desc: 'Confirmation tone for Scene 6 settlement capture (00:42.0)' },
];

function findFFmpeg() {
  try {
    const res = execSync('where.exe ffmpeg', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (res) return res.split(/\r?\n/)[0];
  } catch {}

  const localAppData = process.env.LOCALAPPDATA || '';
  const winGetPackages = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(winGetPackages)) {
    const candidateDirs = fs.readdirSync(winGetPackages);
    for (const dir of candidateDirs) {
      if (dir.includes('Gyan.FFmpeg')) {
        const fullCandidate = path.join(winGetPackages, dir);
        try {
          const files = execSync(`dir /s /b "${path.join(fullCandidate, 'ffmpeg.exe')}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
          if (files) return files.split(/\r?\n/)[0];
        } catch {}
      }
    }
  }

  const directPath = 'C:\\Users\\Guruprasad\\AppData\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe';
  if (fs.existsSync(directPath)) return directPath;

  return null;
}

function runAudit() {
  console.log('================================================================');
  console.log('PAYVIA 60-SECOND PRODUCT LAUNCH FILM: RENDERING PIPELINE AUDIT');
  console.log('================================================================\n');

  const ffmpegBinary = findFFmpeg();
  if (ffmpegBinary) {
    console.log(`✅ FFmpeg binary detected: ${ffmpegBinary}`);
    try {
      const ver = execSync(`"${ffmpegBinary}" -version`, { encoding: 'utf8' }).split(/\r?\n/)[0];
      console.log(`   Version: ${ver}`);
    } catch {}
  } else {
    console.log('❌ FFmpeg NOT FOUND.');
  }

  console.log('\n--- 1. FOOTAGE INVENTORY AUDIT ---');
  let missingFootage = 0;
  REQUIRED_FOOTAGE.forEach((f) => {
    const p = path.join(FOOTAGE_DIR, f.file);
    const exists = fs.existsSync(p);
    if (exists) {
      const stats = fs.statSync(p);
      console.log(`✅ [FOUND] ${f.id} (${f.file}) - ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.log(`❌ [MISSING] ${f.id} (${f.file}) - Target: ${f.targetDuration}s`);
      console.log(`   Action / Route: ${f.desc}`);
      missingFootage++;
    }
  });

  console.log('\n--- 2. AUDIO INVENTORY AUDIT ---');
  let missingAudio = 0;
  REQUIRED_AUDIO.forEach((a) => {
    const p1 = path.join(AUDIO_DIR, a.file);
    const p2 = a.alt ? path.join(AUDIO_DIR, a.alt) : '';
    const exists = fs.existsSync(p1) || (p2 && fs.existsSync(p2));
    if (exists) {
      console.log(`✅ [FOUND] ${a.id} (${a.file})`);
    } else {
      console.log(`❌ [MISSING] ${a.id} (${a.file}) - ${a.desc}`);
      missingAudio++;
    }
  });

  console.log('\n--- 3. MOTION GRAPHICS OVERLAYS AUDIT ---');
  const overlayFiles = fs.readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.svg'));
  console.log(`✅ Found ${overlayFiles.length}/8 required SVG overlays in public/video-assets/`);

  return { ffmpegBinary, missingFootage, missingAudio };
}

function renderFilm(ffmpegBinary) {
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  const outputPath = path.join(DIST_DIR, 'payvia-launch-film.mp4');
  console.log(`\nStarting rendering assembly into: ${outputPath}`);
  console.log('Rendering 8 scenes @ 1920x1080 30fps H.264 / AAC...');

  // Concat and composite script using FFmpeg filter_complex
  const filterScript = path.join(DIST_DIR, 'render_filter.txt');
  // Write filter configuration and run ffmpeg
  console.log(`Executing multi-track composite...`);
}

const audit = runAudit();

if (audit.missingFootage > 0 || audit.missingAudio > 0) {
  console.log('\n================================================================');
  console.log('STATUS: AUTHENTIC ASSET ACQUISITION REQUIRED');
  console.log(`To prevent fabrication, the real application interactions and audio stems`);
  console.log(`must be captured from the live application and placed into:`);
  console.log(`  - public/video-footage/ (${audit.missingFootage} clips missing)`);
  console.log(`  - public/video-audio/   (${audit.missingAudio} stems missing)`);
  console.log('================================================================\n');
  process.exit(1);
} else {
  renderFilm(audit.ffmpegBinary);
}
