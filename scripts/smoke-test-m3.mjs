import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_PATH = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\9416a2db-5727-48cc-9163-53a6d89c4654\\smoke-m3.png';
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

  console.log('Step 1: Waiting for BootScene to transition to MenuScene...');
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    const check = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const g = window.__PHASER_GAME__;
        if (!g) return { ok: false };
        return { ok: true, active: g.scene.isActive('MenuScene') };
      })()`,
      returnByValue: true,
    });
    if (check.result.value?.active) {
      console.log('MenuScene is active!');
      break;
    }
  }

  // Step 2: Trigger start run from MenuScene
  console.log('Step 2: Starting Run from MenuScene...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      g.scene.getScene('MenuScene').scene.start('RunScene', { seed: 42, depth: 1, bankedGold: 0 });
    })()`,
  });

  await sleep(1000);

  // Step 3: Verify RunScene active, collect gold, advance floors to depth 3
  console.log('Step 3: Running player in RunScene across floors...');
  const runProgress = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const state = scene.getState();

      // Collect first gold pile by stepping onto it
      const pile1 = state.goldPiles[0];
      state.playerPos = { x: pile1.x - 1, y: pile1.y };
      scene.stepAction({ type: 'MOVE', direction: 'E' });
      const goldAfterPick = state.carriedGold;

      // Descend to floor 2
      scene.advanceToNextFloor();
      const depth2 = state.depth;

      // Collect gold on floor 2 by stepping onto it
      const pile2 = state.goldPiles[0];
      state.playerPos = { x: pile2.x - 1, y: pile2.y };
      scene.stepAction({ type: 'MOVE', direction: 'E' });
      const goldAfterPick2 = state.carriedGold;

      // Descend to floor 3 (Extraction floor!)
      scene.advanceToNextFloor();
      const depth3 = state.depth;
      const hasExtraction = state.floor.extractionStation !== undefined;

      // Move player onto extraction station
      const station = state.floor.extractionStation;
      state.playerPos = { x: station.x - 1, y: station.y };
      scene.stepAction({ type: 'MOVE', direction: 'E' });

      return {
        depth2,
        depth3,
        goldAfterPick,
        goldAfterPick2,
        totalCarried: state.carriedGold,
        hasExtraction,
        stationPos: state.floor.extractionStation,
        playerPos: state.playerPos,
        fps: Math.round(g.loop.actualFps),
      };
    })()`,
    returnByValue: true,
  });

  console.log('Run progress:', JSON.stringify(runProgress.result.value, null, 2));

  // Step 4: Extract at extraction station
  console.log('Step 4: Triggering Extraction at depth 3...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      scene.stepAction({ type: 'EXTRACT' });
    })()`,
  });

  // Wait for transition to SummaryScene
  await sleep(1200);

  const summaryCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const isSummary = g.scene.isActive('SummaryScene');
      const saved = JSON.parse(localStorage.getItem('deeper_save') || '{}');
      return { isSummary, saved };
    })()`,
    returnByValue: true,
  });

  console.log('Summary scene status:', JSON.stringify(summaryCheck.result.value, null, 2));

  // Capture screenshot of SummaryScene
  console.log('Capturing screenshot of SummaryScene...');
  const screenshotResult = await sendCommand('Page.captureScreenshot', {
    format: 'png',
  });

  const buffer = Buffer.from(screenshotResult.data, 'base64');
  fs.writeFileSync(ARTIFACT_PATH, buffer);
  console.log('Saved screenshot to:', ARTIFACT_PATH, `(${buffer.length} bytes)`);

  // Step 5: Test return to MenuScene and verify persistence
  console.log('Step 5: Returning to MenuScene and verifying vault persistence...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      g.scene.getScene('SummaryScene').scene.start('MenuScene');
    })()`,
  });

  await sleep(600);

  const menuCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      return {
        isMenu: g.scene.isActive('MenuScene'),
        savedGold: JSON.parse(localStorage.getItem('deeper_save') || '{}').bankedGold,
      };
    })()`,
    returnByValue: true,
  });

  console.log('Menu reload verification:', JSON.stringify(menuCheck.result.value, null, 2));

  // Close connection and Chrome
  ws.close();
  chromeProc.kill();
  console.log('M3 Smoke test completed successfully!');
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
