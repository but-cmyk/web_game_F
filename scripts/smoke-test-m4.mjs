import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_PATH = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\9416a2db-5727-48cc-9163-53a6d89c4654\\smoke-m4.png';
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

  // Step 2: Trigger start run into RunScene
  console.log('Step 2: Starting RunScene with seed 101...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      g.scene.getScene('MenuScene').scene.start('RunScene', { seed: 101, depth: 1, bankedGold: 100 });
    })()`,
  });

  await sleep(1000);

  // Step 3: Verify initial Fear & Oil state and movement modes
  console.log('Step 3: Testing movement modes (sneak, walk, run)...');
  const modeTest = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const state = scene.getState();

      const initialMode = state.movementMode;
      const initialOil = state.oil;
      const initialDread = state.dread;

      // Switch to sneak
      scene.stepAction({ type: 'SET_MODE', mode: 'sneak' });
      const afterSneak = state.movementMode;

      // Switch to run
      scene.stepAction({ type: 'SET_MODE', mode: 'run' });
      const afterRun = state.movementMode;

      // Switch back to walk
      scene.stepAction({ type: 'SET_MODE', mode: 'walk' });
      const afterWalk = state.movementMode;

      return {
        initialMode,
        initialOil,
        initialDread,
        afterSneak,
        afterRun,
        afterWalk,
      };
    })()`,
    returnByValue: true,
  });

  if (modeTest.exceptionDetails) {
    console.error('Mode test exception:', modeTest.exceptionDetails);
  } else {
    console.log('Mode test results:', JSON.stringify(modeTest.result?.value ?? modeTest, null, 2));
  }

  // Step 4: Step in darkness to test Oil depletion and Dread progression
  console.log('Step 4: Stepping through dungeon floor, tracking Oil and Dread...');
  const progressionTest = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const state = scene.getState();

      const initialFlaskCount = state.oilFlasks.length;
      const oilBefore = state.oil;
      const dreadBefore = state.dread;

      // Walk 15 steps inside rooms/corridors
      // We will step towards empty floor tiles
      const floor = state.floor;
      const currentPos = { ...state.playerPos };

      // Move player into corridor/room to trigger darkness steps
      for (let i = 0; i < 20; i++) {
        // Try all 4 directions to find walkable tile
        const dirs = [
          { dir: 'E', dx: 1, dy: 0 },
          { dir: 'S', dx: 0, dy: 1 },
          { dir: 'W', dx: -1, dy: 0 },
          { dir: 'N', dx: 0, dy: -1 },
        ];
        for (const { dir, dx, dy } of dirs) {
          const nx = state.playerPos.x + dx;
          const ny = state.playerPos.y + dy;
          const idx = ny * floor.width + nx;
          if (floor.tiles[idx] === 'FLOOR') {
            scene.stepAction({ type: 'MOVE', direction: dir });
            break;
          }
        }
      }

      const oilAfter = state.oil;
      const dreadAfter = state.dread;

      // Now collect an oil flask
      let collectedFlask = false;
      if (state.oilFlasks.length > 0) {
        const flask = state.oilFlasks[0];
        state.playerPos = { x: flask.x - 1, y: flask.y };
        scene.stepAction({ type: 'MOVE', direction: 'E' });
        collectedFlask = true;
      }

      const oilAfterFlask = state.oil;
      const remainingFlasks = state.oilFlasks.length;

      // Set Dread to 75 to check heavy vignette and visual tension
      state.dread = 75;
      scene.stepAction({ type: 'WAIT' });

      return {
        initialFlaskCount,
        oilBefore,
        oilAfter,
        oilDepleted: oilBefore > oilAfter,
        dreadBefore,
        dreadAfter,
        dreadIncreased: dreadAfter > dreadBefore,
        collectedFlask,
        oilAfterFlask,
        remainingFlasks,
        finalDread: state.dread,
        fps: Math.round(g.loop.actualFps),
      };
    })()`,
    returnByValue: true,
  });

  if (progressionTest.exceptionDetails) {
    console.error('Progression test exception:', progressionTest.exceptionDetails);
  } else {
    console.log('Progression test results:', JSON.stringify(progressionTest.result?.value ?? progressionTest, null, 2));
  }

  // Step 5: Capture high-tension screenshot with vignette and HUD
  await sleep(600);
  console.log('Step 5: Capturing screenshot of M4 Fear presentation...');
  const screenshotResult = await sendCommand('Page.captureScreenshot', {
    format: 'png',
  });

  const buffer = Buffer.from(screenshotResult.data, 'base64');
  fs.writeFileSync(ARTIFACT_PATH, buffer);
  console.log('Saved screenshot to:', ARTIFACT_PATH, `(${buffer.length} bytes)`);

  ws.close();
  chromeProc.kill();
  console.log('M4 Smoke test completed successfully!');
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
