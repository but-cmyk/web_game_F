# DEEPER Telemetry & Data Consent Schema [LOCKED]

This document specifies the privacy architecture, anonymous data schemas, and ethical guardrails governing player telemetry and social leaderboards in DEEPER (§4.10, §4.11 Rule 7).

---

## 1. Ethical Principles & Privacy Contract

1. **Strictly Opt-In**:
   - Telemetry collection is disabled by default.
   - Players must explicitly toggle on `settings.telemetryConsent` in the Settings screen before any network submission occurs.
2. **Zero Personally Identifiable Information (PII)**:
   - No emails, names, IP addresses, geolocation, device identifiers, or hardware fingerprints are ever gathered or stored.
   - Player identity is an ephemeral, randomly generated UUID v4 string (`generateAnonymousId()`) stored locally in `localStorage`.
3. **Right to Immediate Erasure ("Wipe All Data")**:
   - The Settings menu provides an explicit, prominent **[ XÓA TOÀN BỘ DỮ LIỆU / WIPE ALL DATA ]** button.
   - Triggering this button immediately purges all local storage (`deeper_save`), resets all settings to default, wipes anonymous IDs, and removes stored corpse records.
4. **No Exploitative Ranking Metrics**:
   - Social leaderboards rank players strictly on **Depth Reached** and **Successful Extractions (Runs Survived)**.
   - **Gold is explicitly NOT used to rank survivors**. This avoids reinforcing unhealthy risk-taking or gambling-style competition.
5. **Zero Streak Retention or Guilt Traps**:
   - Daily runs use UTC date hashing for deterministic floor generation, but do not record daily streaks, streak penalties, or guilt notifications.

---

## 2. Telemetry Schemas

### 2.1 Survivor Record (`SurvivorRecord`)

Submitted upon successful extraction (only if `settings.telemetryConsent === true`).

```json
{
  "id": "uuid-v4-anonymous-id",
  "playerName": "Delver-a1b2",
  "depthReached": 7,
  "runsSurvived": 5,
  "archetypeId": "Gold Hunter",
  "timestamp": 1793836800000
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Anonymous client UUID (v4) generated locally. |
| `playerName` | `string` | Pseudonym formatted as `Delver-<first 4 chars of UUID>`. |
| `depthReached` | `number` | Deepest dungeon floor reached during the winning run. |
| `runsSurvived` | `number` | Cumulative career extraction count for this anonymous delver. |
| `archetypeId` | `string` | Mirror archetype determined by behavioral decisions. |
| `timestamp` | `number` | Epoch millisecond timestamp of run completion. |

---

### 2.2 Social Corpse Retrieval Schema (`PlayerCorpse`)

Stored locally (and synchronized peer-to-peer or via remote storage if configured).

```json
{
  "id": "corpse_3_14_18_1793836800000",
  "depth": 3,
  "x": 14,
  "y": 18,
  "lostGold": 120,
  "recoverableGold": 60,
  "deathCause": "monster",
  "timestamp": 1793836800000,
  "isLooted": false
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Deterministic corpse ID: `corpse_<depth>_<x>_<y>_<timestamp>`. |
| `depth` | `number` | Dungeon floor where player died. |
| `x`, `y` | `number` | Grid coordinates of death location. |
| `lostGold` | `number` | Amount of gold dropped upon death. |
| `recoverableGold`| `number` | Exactly 50% (`Math.round(lostGold * 0.5)`) recoverable upon stepping on corpse. |
| `deathCause` | `string` | Cause of demise (`"monster"`, `"oil_depleted"`). |
| `timestamp` | `number` | Epoch timestamp of death. |
| `isLooted` | `boolean` | Flag set to `true` once recovered, preventing duplication. |

---

## 3. Remote Storage Architecture

```
+-----------------------------------------------------------+
|                       RunScene / MenuScene                 |
+-----------------------------------------------------------+
                              |
                              v
                  +-----------------------+
                  |  RemoteStore Interface|
                  +-----------------------+
                     /                 \
                    v                   v
      +--------------------+     +-------------------------+
      |  LocalRemoteStore  |     |   SupabaseRemoteStore   |
      |   (100% Offline)   |     |    (Optional REST)      |
      +--------------------+     +-------------------------+
                                              |
                                     (Network Failure /
                                       Keys Missing)
                                              |
                                              v
                                       Silent Fallback
                                     to LocalRemoteStore
```

The game operates seamlessly 100% offline. If remote credentials or connectivity are absent, `SupabaseRemoteStore` silently and gracefully delegates all requests to `LocalRemoteStore` with zero crashes or error dialogs.
