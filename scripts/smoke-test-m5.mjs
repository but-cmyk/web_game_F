import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_PATH = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\9416a2db-5727-48cc-9163-53a6d89c4654\\smoke-m5.png';
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

  // Step 2: Trigger start run into RunScene at depth 2
  console.log('Step 2: Starting RunScene with depth 2 and seed 303...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      g.scene.getScene('MenuScene').scene.start('RunScene', { seed: 303, depth: 2, bankedGold: 50 });
    })()`,
  });

  await sleep(1000);

  // Step 3: Verify monster spawning and initial FSM states
  console.log('Step 3: Checking monster generation and states...');
  const monsterSpawnCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const state = scene.getState();

      const monsters = (state.monsters || []).map((m) => ({
        id: m.id,
        type: m.type,
        state: m.state,
        x: m.x,
        y: m.y,
        hp: m.hp,
        damage: m.damage,
      }));

      return {
        depth: state.depth,
        monsterCount: monsters.length,
        monsters,
        playerPos: state.playerPos,
        playerHp: state.hp,
      };
    })()`,
    returnByValue: true,
  });

  console.log('Monster spawn check:', JSON.stringify(monsterSpawnCheck.result.value, null, 2));

  // Step 4: Test monster awareness & combat collision
  console.log('Step 4: Testing combat collision and stun...');
  const combatCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const state = scene.getState();

      // Find first monster and move player next to it
      const targetMonster = state.monsters[0];
      state.playerPos = { x: targetMonster.x - 1, y: targetMonster.y };
      const hpBefore = state.hp;

      // Move onto monster tile -> triggers collision
      scene.stepAction({ type: 'MOVE', direction: 'E' });

      const hpAfter = state.hp;
      const monsterStunned = targetMonster.stunnedTurns;
      const playerInvulnerable = state.playerInvulnerableTurns;

      return {
        monsterType: targetMonster.type,
        hpBefore,
        hpAfter,
        tookDamage: hpAfter < hpBefore,
        monsterStunned,
        playerInvulnerable,
      };
    })()`,
    returnByValue: true,
  });

  console.log('Combat check results:', JSON.stringify(combatCheck.result.value, null, 2));

  // Step 5: Test hallucinations at high Dread
  console.log('Step 5: Testing hallucination apparition and evaporation at Dread >= 70...');
  const hallucinationCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const scene = g.scene.getScene('RunScene');
      const state = scene.getState();

      // Elevate Dread to 85
      state.dread = 85;

      // Manually spawn a hallucination 2 tiles away to verify evaporation
      state.hallucinations = [
        {
          id: 'test_phantom',
          type: 'crawler',
          x: state.playerPos.x + 1,
          y: state.playerPos.y,
          lifetime: 10,
        },
      ];

      const dreadBefore = state.dread;
      const hpBefore = state.hp;

      // Step WAIT -> hallucination is at distance 1 (<= 2) -> evaporates!
      scene.stepAction({ type: 'WAIT' });

      const dreadAfter = state.dread;
      const hpAfter = state.hp;
      const remainingPhantoms = state.hallucinations.length;

      return {
        dreadBefore,
        dreadAfter,
        dreadIncreased: dreadAfter === dreadBefore + 5,
        hpBefore,
        hpAfter,
        zeroDamageVerified: hpAfter === hpBefore,
        remainingPhantoms,
        fps: Math.round(g.loop.actualFps),
      };
    })()`,
    returnByValue: true,
  });

  console.log('Hallucination test results:', JSON.stringify(hallucinationCheck.result.value, null, 2));

  // Step 6: Capture high-tension screenshot with monster in view
  await sleep(600);
  console.log('Step 6: Capturing screenshot of M5 monster encounter...');
  const screenshotResult = await sendCommand('Page.captureScreenshot', {
    format: 'png',
  });

  const buffer = Buffer.from(screenshotResult.data, 'base64');
  fs.writeFileSync(ARTIFACT_PATH, buffer);
  console.log('Saved screenshot to:', ARTIFACT_PATH, `(${buffer.length} bytes)`);

  ws.close();
  chromeProc.kill();
  console.log('M5 Smoke test completed successfully!');
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
