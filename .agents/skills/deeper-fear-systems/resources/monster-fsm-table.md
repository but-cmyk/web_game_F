# Monster Finite State Machine (FSM) Table

Read this when implementing or testing monster AI transitions.

| Monster | Current State | Event / Trigger | Target State | Action / Behavior |
|---|---|---|---|---|
| **Crawler** | `PATROL` | Hears noise within path distance | `SUSPICIOUS` | Move towards noise source coordinate |
| **Crawler** | `PATROL` / `SUSPICIOUS` | Line of sight to player | `CHASE` | Mute ambient 1 turn, chase player directly |
| **Crawler** | `CHASE` | Loses player line of sight | `SEARCH` | Search last known point for 8 turns |
| **Crawler** | `SEARCH` | 8 turns elapse without sight/noise | `PATROL` | Resume random waypoint patrol |
| **Listener** | `IDLE` | Hears noise within 5 path tiles | `HOWL` | Alert howl: all monsters in 10 tiles -> `SUSPICIOUS` |
| **Listener** | `HOWL` | Howl completed | `IDLE` | Remain stationary, cooldown 5 turns |
| **Stalker** | `STALK` | Always active | `STALK` | Follow player breadcrumb trail, 1 step per 2 turns |

## Unit Test Invariant
Every row in this table must be asserted by a deterministic unit test with zero flaky behavior.
