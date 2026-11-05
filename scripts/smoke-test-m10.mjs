import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_PATH = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\9416a2db-5727-48cc-9163-53a6d89c4654\\smoke-m10.png';
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

  // Step 2: Test LeaderboardScene
  console.log('Step 2: Transitioning to LeaderboardScene...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      g.scene.stop('MenuScene');
      g.scene.start('LeaderboardScene');
      return true;
    })()`,
    returnByValue: true,
  });

  await sleep(600);
  const leaderboardCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      return {
        active: g.scene.isActive('LeaderboardScene'),
      };
    })()`,
    returnByValue: true,
  });
  console.log('LeaderboardScene status:', leaderboardCheck.result.value);

  // Step 3: Test SettingsScene with M10 toggles
  console.log('Step 3: Transitioning to SettingsScene...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      g.scene.stop('LeaderboardScene');
      g.scene.start('SettingsScene');
      return true;
    })()`,
    returnByValue: true,
  });

  await sleep(600);
  const settingsCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const s = g.scene.getScene('SettingsScene');
      return {
        active: g.scene.isActive('SettingsScene'),
        hasBreakReminder: s?.settings?.breakReminder !== undefined,
        hasTelemetry: s?.settings?.telemetryConsent !== undefined,
      };
    })()`,
    returnByValue: true,
  });
  console.log('SettingsScene M10 status:', settingsCheck.result.value);

  // Step 4: Seed a corpse in local save and launch RunScene (Daily Run)
  console.log('Step 4: Seeding corpse and launching Daily Run in RunScene...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const raw = localStorage.getItem('deeper_save');
      const save = raw ? JSON.parse(raw) : {};
      
      // Seed a test corpse on depth 1 at entrance + (1, 0)
      save.corpses = [{
        id: 'corpse_test_1',
        depth: 1,
        x: 4,
        y: 4,
        lostGold: 100,
        recoverableGold: 50,
        deathCause: 'monster',
        timestamp: Date.now(),
        isLooted: false
      }];
      localStorage.setItem('deeper_save', JSON.stringify(save));

      g.scene.stop('SettingsScene');
      g.scene.start('RunScene', {
        seed: 987654321,
        isDailyRun: true,
        depth: 1,
        bankedGold: save.bankedGold || 0
      });
      return true;
    })()`,
    returnByValue: true,
  });

  await sleep(800);
  const runCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const run = g.scene.getScene('RunScene');
      return {
        active: g.scene.isActive('RunScene'),
        depth: run?.state?.depth,
        carriedGold: run?.state?.carriedGold,
        isDailyRun: run?.isDailyRun,
        activeCorpsesCount: run?.activeCorpses?.length || 0,
      };
    })()`,
    returnByValue: true,
  });
  console.log('RunScene M10 status:', runCheck.result.value);

  // Step 5: Capture screenshot
  console.log('Step 5: Capturing screenshot to', ARTIFACT_PATH);
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
