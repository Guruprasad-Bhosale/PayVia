import fs from 'fs';
import path from 'path';

const svgDir = path.resolve('public/video-assets');
const files = [
  'scene1_hook_cards.svg',
  'scene2_meet_payvia_overlay.svg',
  'scene3_editorial_labels.svg',
  'scene4_agent_flow_diagram.svg',
  'scene5_human_approval_overlay.svg',
  'scene6_settlement_badge.svg',
  'scene7_control_plane_overlay.svg',
  'scene8_brand_resolve.svg',
];

console.log('====================================================');
console.log('PAYVIA VIDEO ASSETS: SVG VALIDATION AUDIT');
console.log('====================================================\n');

let totalErrors = 0;
let totalWarnings = 0;

for (const file of files) {
  const filePath = path.join(svgDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ [MISSING] ${file}`);
    totalErrors++;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const warnings = [];

  // 1. Check root SVG tag
  if (!content.includes('<svg') || !content.includes('</svg>')) {
    issues.push('Missing opening or closing <svg> tag');
  }

  // 2. Check viewBox
  const vbMatch = content.match(/viewBox=["']([^"']+)["']/);
  if (!vbMatch) {
    issues.push('Missing viewBox attribute');
  } else if (vbMatch[1].trim() !== '0 0 1920 1080') {
    issues.push(`Invalid viewBox: "${vbMatch[1]}" (expected "0 0 1920 1080")`);
  }

  // 3. Check width and height
  const wMatch = content.match(/width=["']([^"']+)["']/);
  const hMatch = content.match(/height=["']([^"']+)["']/);
  if (!wMatch || wMatch[1] !== '1920') {
    warnings.push(`Width attribute is "${wMatch ? wMatch[1] : 'missing'}" (expected "1920")`);
  }
  if (!hMatch || hMatch[1] !== '1080') {
    warnings.push(`Height attribute is "${hMatch ? hMatch[1] : 'missing'}" (expected "1080")`);
  }

  // 4. Check typography
  if (!content.includes('Inter')) {
    warnings.push('Does not explicitly declare Inter font-family');
  }

  // 5. Check Brand Color Tokens
  const validColors = ['#0A192F', '#0052CC', '#FFFFFF', '#0E6245', '#16845B', '#003087', '#0070E0', '#62B0FF', '#CBD5E1', '#E2E8F0', '#F8FAFC', '#64748B'];
  const hasBrandColor = validColors.some(c => content.toUpperCase().includes(c.toUpperCase()));
  if (!hasBrandColor) {
    warnings.push('No recognized PayVia brand color token found in asset');
  }

  // 6. Safe Area Bounds Check (80% safe zone is x: 192 to 1728, y: 108 to 972)
  // Check if text translates outside safe zone
  const translateMatches = [...content.matchAll(/transform=["']translate\(([^,)]+)[, ]+([^,)]+)\)["']/g)];
  for (const m of translateMatches) {
    const x = parseFloat(m[1]);
    const y = parseFloat(m[2]);
    if (x < 60 || x > 1860) {
      warnings.push(`Translate X coordinate (${x}) is close to frame boundary`);
    }
    if (y < 40 || y > 1040) {
      warnings.push(`Translate Y coordinate (${y}) is close to frame boundary`);
    }
  }

  if (issues.length === 0) {
    console.log(`✅ [VALID] ${file} (1920x1080)`);
    if (warnings.length > 0) {
      warnings.forEach(w => console.log(`   ⚠️ Notice: ${w}`));
      totalWarnings += warnings.length;
    }
  } else {
    console.error(`❌ [INVALID] ${file}:`);
    issues.forEach(i => console.error(`   - ${i}`));
    totalErrors += issues.length;
  }
}

console.log(`\nAudit Complete: ${files.length} assets audited, ${totalErrors} errors, ${totalWarnings} notices.\n`);
