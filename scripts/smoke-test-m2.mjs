import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_PATH = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\9416a2db-5727-48cc-9163-53a6d89c4654\\smoke-m2.png';
const TARGET_URL = 'http://127.0.0.1:3000/';
const DEBUG_PORT = 9222;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching headless Chrome with remote debugging on port', DEBUG_PORT);
  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,720',
    TARGET_URL,
  ]);

  chromeProc.on('error', (err) => {
    console.error('Failed to spawn Chrome:', err);
  });

  // Wait for debug port to become available
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const list = await res.json();
      if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
        wsUrl = list[0].webSocketDebuggerUrl;
        break;
      }
    } catch {
      // Retry
    }
  }

  if (!wsUrl) {
    chromeProc.kill();
    throw new Error('Could not connect to Chrome DevTools Protocol');
  }

  console.log('Connected to Chrome DevTools:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Enable Runtime and Page
  await sendCommand('Runtime.enable');
  await sendCommand('Page.enable');

  console.log('Waiting for game to load and transition from BootScene to RunScene...');
  // Poll until RunScene is active
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const check = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const g = window.__PHASER_GAME__;
        if (!g) return { ok: false, reason: 'Game not instantiated' };
        const runScene = g.scene.getScene('RunScene');
        if (!runScene) return { ok: false, reason: 'RunScene not registered' };
        const active = g.scene.isActive('RunScene');
        return { ok: true, active, sceneKeys: g.scene.scenes.map(s => s.scene.key) };
      })()`,
      returnByValue: true,
    });
    if (check.result.value?.active) {
      console.log('RunScene is active!');
      break;
    }
  }

  // Check scene state via Runtime.evaluate
  const checkScene = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      if (!g) return { ok: false, reason: 'No Phaser game found' };
      const runScene = g.scene.getScene('RunScene');
      if (!runScene) return { ok: false, reason: 'No RunScene found' };
      const isActive = g.scene.isActive('RunScene');
      return { ok: true, isActive, state: runScene.getState ? runScene.getState() : null };
    })()`,
    returnByValue: true,
  });

  console.log('Scene check result:', JSON.stringify(checkScene.result.value));

  // Perform >= 20 steps (WASD / Arrows) and check wall collisions
  console.log('Executing 24 player steps...');
  const stepEvaluation = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const startPos = { ...scene.getState().playerPos };
      const initialTurn = scene.getState().turnCount;

      const directions = ['E', 'E', 'E', 'S', 'S', 'E', 'N', 'W', 'S', 'S', 'E', 'E', 'N', 'E', 'S', 'W', 'E', 'S', 'E', 'E', 'S', 'S', 'W', 'W'];
      const stepLog = [];

      for (const dir of directions) {
        scene.stepAction({ type: 'MOVE', direction: dir });
        stepLog.push({ dir, pos: { ...scene.getState().playerPos }, turn: scene.getState().turnCount });
      }

      return {
        initialTurn,
        finalTurn: scene.getState().turnCount,
        startPos,
        finalPos: scene.getState().playerPos,
        actualFps: Math.round(g.loop.actualFps),
        exploredTilesCount: scene.fog ? scene.fog.explored.filter(Boolean).length : 0,
        visibleTilesCount: scene.fog ? scene.fog.visible.filter(Boolean).length : 0,
      };
    })()`,
    returnByValue: true,
  });

  console.log('Movement evaluation:', JSON.stringify(stepEvaluation.result.value, null, 2));

  // Wait a moment for rendering and camera smoothing
  await sleep(1000);

  // Capture screenshot via CDP
  console.log('Capturing screenshot...');
  const screenshotResult = await sendCommand('Page.captureScreenshot', {
    format: 'png',
  });

  const buffer = Buffer.from(screenshotResult.data, 'base64');
  fs.writeFileSync(ARTIFACT_PATH, buffer);
  console.log('Saved screenshot to:', ARTIFACT_PATH, `(${buffer.length} bytes)`);

  // Close connection and Chrome
  ws.close();
  chromeProc.kill();
  console.log('Smoke test complete.');
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
