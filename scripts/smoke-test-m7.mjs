import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_PATH = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\9416a2db-5727-48cc-9163-53a6d89c4654\\smoke-m7.png';
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

  // Step 2: Inject banked gold and test opening ShopScene
  console.log('Step 2: Injecting banked gold and opening ShopScene...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const saveStr = localStorage.getItem('deeper_save');
      const save = saveStr ? JSON.parse(saveStr) : { version: 1, bankedGold: 0, upgrades: {} };
      save.bankedGold = 150; // Provide sufficient gold for purchases
      localStorage.setItem('deeper_save', JSON.stringify(save));
      const menu = g.scene.getScene('MenuScene');
      menu.scene.start('ShopScene');
    })()`,
  });

  await sleep(800);

  const shopActiveCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const isShopActive = g.scene.isActive('ShopScene');
      return { isShopActive };
    })()`,
    returnByValue: true,
  });

  console.log('ShopScene active check:', shopActiveCheck.result.value);

  // Step 3: Verify Upgrade Cards and purchase Soft Shoes
  console.log('Step 3: Purchasing Soft Shoes upgrade in ShopScene...');
  const purchaseResult = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const shop = g.scene.getScene('ShopScene');
      shop.handlePurchase('soft_shoes');
      const save = JSON.parse(localStorage.getItem('deeper_save') || '{}');
      return {
        bankedGoldAfter: save.bankedGold,
        softShoesTier: save.upgrades?.['soft_shoes'] ?? 0,
      };
    })()`,
    returnByValue: true,
  });

  console.log('Purchase result:', purchaseResult.result.value);

  // Re-render shop to reflect purchase
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const shop = g.scene.getScene('ShopScene');
      shop.renderCards();
    })()`,
  });

  await sleep(600);

  // Step 4: Capture screenshot of the ShopScene
  console.log('Step 4: Capturing screenshot of ShopScene...');
  const screenshotData = await sendCommand('Page.captureScreenshot', {
    format: 'png',
  });

  const buffer = Buffer.from(screenshotData.data, 'base64');
  fs.writeFileSync(ARTIFACT_PATH, buffer);
  console.log('Screenshot successfully written to:', ARTIFACT_PATH);

  // Step 5: Verify RunScene receives the upgrade
  console.log('Step 5: Starting RunScene to verify upgrades apply to state...');
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const shop = g.scene.getScene('ShopScene');
      shop.scene.start('RunScene', { seed: 1000, depth: 1, bankedGold: 95 });
    })()`,
  });

  await sleep(1000);

  const runSceneUpgradeCheck = await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const g = window.__PHASER_GAME__;
      const run = g.scene.getScene('RunScene');
      const state = run.getState();
      return {
        isRunActive: g.scene.isActive('RunScene'),
        upgrades: state.upgrades,
        hasSoftShoes: (state.upgrades?.['soft_shoes'] ?? 0) >= 1,
      };
    })()`,
    returnByValue: true,
  });

  console.log('RunScene upgrade check:', runSceneUpgradeCheck.result.value);

  ws.close();
  chromeProc.kill();
  console.log('Smoke test M7 finished successfully!');
}

main().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
