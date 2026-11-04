# Balance Simulator CLI Contract

Read this when writing or running `scripts/balance-sim.ts`.

## Command Line Usage
```bash
npx tsx scripts/balance-sim.ts --runs 1000 --policy mixed --seed 12345
```

## JSON Output Schema
```json
{
  "policy": "mixed",
  "runs": 1000,
  "deathRate": 0.612,
  "extractionRate": 0.388,
  "meanDepth": 6.4,
  "expectedBankedGold": 142.5,
  "maxDepthReached": 12,
  "totalRunTimeMs": 1820
}
```

## Bot Policy Profiles
- **Cautious**: Extracts immediately at Floor 3/6 if HP < 2 or oil < 40%; avoids cursed chests; never takes risky bargains.
- **Greedy**: Always pushes past exit stations until oil < 10%; opens 100% of cursed chests; accepts all gold-yielding bargains.
- **Mixed**: Dynamically evaluates Dread and inventory; extracts if Dread >= 70 or oil < 25%; accepts high-value bargains when HP permits.

