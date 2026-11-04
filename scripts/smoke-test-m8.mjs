import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_PATH = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\9416a2db-5727-48cc-9163-53a6d89c4654\\smoke-m8.png';
const TARGET_URL = 'http://localhost:3000/';
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

  // Step 2: Open TutorialScene and verify
  console.log('Step 2: Transitioning to TutorialScene...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      g.scene.stop('MenuScene');
      g.scene.start('TutorialScene');
      return true;
    })()`,
    returnByValue: true,
  });

  await sleep(600);
  const tutCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('TutorialScene');
      return {
        active: g.scene.isActive('TutorialScene'),
        stage: scene?.currentStage,
      };
    })()`,
    returnByValue: true,
  });
  console.log('TutorialScene status:', tutCheck.result.value);

  // Step 3: Transition to MirrorScene with sample metric data and rolling baseline
  console.log('Step 3: Populating SaveStore and transitioning to MirrorScene...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      localStorage.setItem('deeper_save_v1', JSON.stringify({
        bankedGold: 450,
        highScore: 12,
        unlockedEntries: [],
        purchasedUpgrades: {},
        hasCompletedTutorial: true,
        recentRunMetrics: [
          { greedRaw: 5, fearRaw: 8, depth: 3, gold: 60, outcome: 'extracted' },
          { greedRaw: 7, fearRaw: 4, depth: 5, gold: 110, outcome: 'extracted' },
          { greedRaw: 12, fearRaw: 2, depth: 7, gold: 180, outcome: 'died' },
          { greedRaw: 9, fearRaw: 5, depth: 6, gold: 140, outcome: 'extracted' }
        ]
      }));

      g.scene.stop('TutorialScene');
      g.scene.start('MirrorScene', {
        mirrorMetric: {
          greedRaw: 11,
          fearRaw: 3,
          depth: 7,
          gold: 210,
          outcome: 'extracted'
        }
      });
      return true;
    })()`,
    returnByValue: true,
  });

  await sleep(800);

  const mirrorCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('MirrorScene');
      return {
        active: g.scene.isActive('MirrorScene'),
        archetype: scene?.currentArchetype?.id,
        greedScore: scene?.currentGreedScore,
        fearScore: scene?.currentFearScore,
      };
    })()`,
    returnByValue: true,
  });
  console.log('MirrorScene status:', mirrorCheck.result.value);

  // Step 4: Capture screenshot
  console.log('Step 4: Capturing screenshot to', ARTIFACT_PATH);
  const screenshot = await sendCommand('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
  });

  const buffer = Buffer.from(screenshot.data, 'base64');
  fs.writeFileSync(ARTIFACT_PATH, buffer);
  console.log(`Saved screenshot successfully (${buffer.length} bytes).`);

  ws.close();
  chromeProc.kill();
  console.log('Smoke test complete!');
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
