import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9226;
const outputDir = path.resolve('report_assets/results');
fs.mkdirSync(outputDir, { recursive: true });

console.log('Starting Edge on port ' + port + '...');
const browserProcess = spawn(edgePath, [
  '--headless=new',
  '--disable-gpu',
  `--remote-debugging-port=${port}`,
  '--window-size=1280,1000',
  'http://127.0.0.1:5173/corrector'
]);

await new Promise(r => setTimeout(r, 2500));

try {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('5173'));

  if (!pageTarget) {
    throw new Error('Page target not found');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  };

  await new Promise(r => ws.onopen = r);

  function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve) => {
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 950,
    deviceScaleFactor: 1,
    mobile: false
  });

  async function evalVal(expr) {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return res.result?.result?.value;
  }

  async function takeScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.result.data, 'base64');
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filePath}`);
  }

  // 1. Wait for initial page load and correction
  await new Promise(r => setTimeout(r, 2000));
  console.log('Capturing Fig 6.1: Main Spelling Correction Interface...');
  await takeScreenshot('fig6_1_main_interface.png');

  // 2. Capture Compare Both Result tab
  console.log('Capturing Fig 6.4: Compare Both Result...');
  await evalVal(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Compare Both'));
    btn?.click();
  `);
  await new Promise(r => setTimeout(r, 500));
  await takeScreenshot('fig6_4_compare_both.png');

  // 3. Switch to SymSpell only and capture
  console.log('Capturing Fig 6.3: SymSpell Result...');
  await evalVal(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('SymSpell'));
    btn?.click();
  `);
  await new Promise(r => setTimeout(r, 500));
  await takeScreenshot('fig6_3_symspell_result.png');

  // 4. Switch to TextBlob only and capture
  console.log('Capturing Fig 6.2: TextBlob Result...');
  await evalVal(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('TextBlob'));
    btn?.click();
  `);
  await new Promise(r => setTimeout(r, 500));
  await takeScreenshot('fig6_2_textblob_result.png');

  // Switch back to compare mode for remaining tabs
  await evalVal(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Compare Both'));
    btn?.click();
  `);
  await new Promise(r => setTimeout(r, 300));

  // 5. Detected Corrections Tab
  console.log('Capturing Fig 6.5: Detected Corrections...');
  await evalVal(`
    const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Detected Corrections'));
    tab?.click();
  `);
  await new Promise(r => setTimeout(r, 500));
  await takeScreenshot('fig6_5_detected_corrections.png');

  // 6. Statistics & Latency Tab
  console.log('Capturing Fig 6.6: Statistics and Latency...');
  await evalVal(`
    const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Statistics & Latency'));
    tab?.click();
  `);
  await new Promise(r => setTimeout(r, 500));
  await takeScreenshot('fig6_6_statistics_latency.png');

  // 7. How SymSpell Decided Tab
  console.log('Capturing Fig 6.7: How SymSpell Decided...');
  await evalVal(`
    const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('How SymSpell Decided'));
    tab?.click();
  `);
  await new Promise(r => setTimeout(r, 800));
  await takeScreenshot('fig6_7_how_symspell_decided.png');

  // 8. Mobile Responsive View
  console.log('Capturing Fig 6.8: Mobile Responsive Interface...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await evalVal(`
    const tab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Corrected Text'));
    tab?.click();
  `);
  await new Promise(r => setTimeout(r, 800));
  await takeScreenshot('fig6_8_mobile_responsive.png');

  console.log('ALL RESULT SCREENSHOTS CAPTURED SUCCESSFULLY!');
  ws.close();
} catch (err) {
  console.error('Error capturing screenshots:', err);
} finally {
  browserProcess.kill();
  process.exit(0);
}
