import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9227;

const items = [
  { html: 'report_assets/diagrams/domain_model.html', out: 'report_assets/diagrams/fig4_1_domain_model.png', width: 750, height: 780 },
  { html: 'report_assets/implementation/fig5_1_project_structure.html', out: 'report_assets/implementation/fig5_1_project_structure.png', width: 950, height: 580 },
  { html: 'report_assets/implementation/fig5_2_main_application.html', out: 'report_assets/implementation/fig5_2_main_application.png', width: 950, height: 540 },
  { html: 'report_assets/implementation/fig5_3_spelling_service.html', out: 'report_assets/implementation/fig5_3_spelling_service.png', width: 950, height: 540 },
  { html: 'report_assets/implementation/fig5_4_textblob_implementation.html', out: 'report_assets/implementation/fig5_4_textblob_implementation.png', width: 950, height: 530 },
  { html: 'report_assets/implementation/fig5_5_symspell_implementation.html', out: 'report_assets/implementation/fig5_5_symspell_implementation.png', width: 950, height: 490 },
  { html: 'report_assets/implementation/fig5_6_consensus_logic.html', out: 'report_assets/implementation/fig5_6_consensus_logic.png', width: 950, height: 430 },
  { html: 'report_assets/implementation/fig5_7_frontend_corrector.html', out: 'report_assets/implementation/fig5_7_frontend_corrector.png', width: 950, height: 510 },
  { html: 'report_assets/implementation/fig5_8_word_inspector_api.html', out: 'report_assets/implementation/fig5_8_word_inspector_api.png', width: 950, height: 380 },
];

console.log('Starting Edge on port ' + port + '...');
const browserProcess = spawn(edgePath, [
  '--headless=new',
  '--disable-gpu',
  `--remote-debugging-port=${port}`,
  'about:blank'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const pageTarget = targets.find(t => t.type === 'page');

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

  for (const item of items) {
    const fileUrl = 'file:///' + path.resolve(item.html).replace(/\\/g, '/');
    console.log(`Navigating to ${fileUrl}...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: item.width,
      height: item.height,
      deviceScaleFactor: 2, // High-DPI for crisp text in Word
      mobile: false
    });
    await send('Page.navigate', { url: fileUrl });
    await new Promise(r => setTimeout(r, 600));

    const snap = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(snap.result.data, 'base64');
    fs.writeFileSync(item.out, buffer);
    console.log(`Saved: ${item.out}`);
  }

  console.log('ALL DIAGRAM AND CODE SCREENSHOTS GENERATED SUCCESSFULLY!');
  ws.close();
} catch (e) {
  console.error(e);
} finally {
  browserProcess.kill();
  process.exit(0);
}
