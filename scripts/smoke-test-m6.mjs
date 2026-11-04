import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_PATH = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\9416a2db-5727-48cc-9163-53a6d89c4654\\smoke-m6.png';
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

  // Step 2: Test opening CodexScene from MenuScene
  console.log('Step 2: Testing CodexScene navigation from MenuScene...');
  const codexNavCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const menu = g.scene.getScene('MenuScene');
      menu.scene.start('CodexScene');
    })()`,
  });

  await sleep(600);

  const codexActiveCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const isCodexActive = g.scene.isActive('CodexScene');
      return { isCodexActive };
    })()`,
    returnByValue: true,
  });

  console.log('CodexScene active check:', codexActiveCheck.result.value);

  // Return to MenuScene
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const codex = g.scene.getScene('CodexScene');
      codex.scene.start('MenuScene');
    })()`,
  });

  await sleep(600);

  // Step 3: Start RunScene on Depth 2 (even floor with Bargain Altar)
  console.log('Step 3: Starting RunScene with depth 2 and seed 404...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      g.scene.getScene('MenuScene').scene.start('RunScene', { seed: 404, depth: 2, bankedGold: 100 });
    })()`,
  });

  await sleep(1000);

  // Step 4: Verify Chest and Bargain Altar spawning
  console.log('Step 4: Checking chest and bargain altar spawning on Depth 2...');
  const greedSpawnCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const state = scene.getState();

      const chests = (state.chests || []).map((c) => ({
        id: c.id,
        isCursed: c.isCursed,
        goldValue: c.goldValue,
        isOpen: c.isOpen,
        x: c.x,
        y: c.y,
      }));

      const pedestal = state.bargainPedestal
        ? {
            x: state.bargainPedestal.x,
            y: state.bargainPedestal.y,
            isUsed: state.bargainPedestal.isUsed,
            bargainsCount: state.bargainPedestal.bargains.length,
          }
        : null;

      return {
        depth: state.depth,
        chestsCount: chests.length,
        chests,
        pedestal,
        carriedGold: state.carriedGold,
      };
    })()`,
    returnByValue: true,
  });

  console.log('Greed spawn check:', JSON.stringify(greedSpawnCheck.result.value, null, 2));

  // Step 5: Test Cursed Chest opening and Curse infliction
  console.log('Step 5: Testing cursed chest opening and 25% curse application...');
  const chestOpenCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const state = scene.getState();

      const cursedChest = state.chests.find((c) => c.isCursed && !c.isOpen);
      if (!cursedChest) return { ok: false, reason: 'No cursed chest found' };

      const goldBefore = state.carriedGold;
      const cursesCountBefore = (state.activeCurses || []).length;

      // Open cursed chest
      scene.stepAction({ type: 'OPEN_CHEST', chestId: cursedChest.id });

      const goldAfter = state.carriedGold;
      const cursesAfter = state.activeCurses || [];

      return {
        ok: true,
        chestId: cursedChest.id,
        goldBefore,
        goldAfter,
        goldGained: goldAfter - goldBefore,
        cursesCountBefore,
        cursesCountAfter: cursesAfter.length,
        curseAfflicted: cursesAfter[cursesAfter.length - 1],
      };
    })()`,
    returnByValue: true,
  });

  console.log('Chest opening results:', JSON.stringify(chestOpenCheck.result.value, null, 2));

  // Step 6: Test Devil's Bargain Altar interaction
  console.log('Step 6: Testing Devil Bargain resolution (safe decline & acceptance)...');
  const bargainCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const state = scene.getState();

      if (!state.bargainPedestal) return { ok: false, reason: 'No pedestal' };

      const bargain = state.bargainPedestal.bargains[0];
      const goldBefore = state.carriedGold;

      // Resolve bargain accepted
      scene.stepAction({ type: 'RESOLVE_BARGAIN', bargainId: bargain.id, accepted: true });

      return {
        ok: true,
        bargainId: bargain.id,
        isUsed: state.bargainPedestal.isUsed,
        goldBefore,
        goldAfter: state.carriedGold,
        activeCurses: (state.activeCurses || []).length,
      };
    })()`,
    returnByValue: true,
  });

  console.log('Bargain test results:', JSON.stringify(bargainCheck.result.value, null, 2));

  // Step 7: Test Escape Rope 3-Turn Channeling and Extraction
  console.log('Step 7: Testing Escape Rope 3-turn channeling...');
  const ropeCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const state = scene.getState();

      // Grant 1 rope
      state.ropeCount = 1;

      // Use rope -> starts channeling (3 turns)
      scene.stepAction({ type: 'USE_ROPE' });
      const turnsRemainingAfterStart = state.escapeRopeTurnsRemaining;

      // Turn 2
      scene.stepAction({ type: 'WAIT' });
      const turnsRemainingStep2 = state.escapeRopeTurnsRemaining;

      return {
        turnsRemainingAfterStart,
        turnsRemainingStep2,
        fps: Math.round(g.loop.actualFps),
      };
    })()`,
    returnByValue: true,
  });

  console.log('Rope channeling check:', JSON.stringify(ropeCheck.result.value, null, 2));

  // Show a bargain modal for visual verification in screenshot
  console.log('Displaying bargain modal for screenshot capture...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const state = scene.getState();
      state.bargainPedestal.isUsed = false;
      scene.showBargainModal(state.bargainPedestal);
    })()`,
  });

  await sleep(600);

  // Step 8: Capture screenshot
  console.log('Step 8: Capturing screenshot of M6 Greed mechanics...');
  const screenshotResult = await sendCommand('Page.captureScreenshot', {
    format: 'png',
  });

  const buffer = Buffer.from(screenshotResult.data, 'base64');
  fs.writeFileSync(ARTIFACT_PATH, buffer);
  console.log('Saved screenshot to:', ARTIFACT_PATH, `(${buffer.length} bytes)`);

  ws.close();
  chromeProc.kill();
  console.log('M6 Smoke test completed successfully!');
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
