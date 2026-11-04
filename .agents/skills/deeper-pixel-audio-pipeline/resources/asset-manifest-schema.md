# Asset Manifest Schema Reference

Read this when registering or substituting visual assets in `src/data/assets.json`.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DeeperAssetManifest",
  "type": "object",
  "required": ["tiles", "sprites", "ui"],
  "properties": {
    "tiles": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["key", "width", "height", "source", "license"],
        "properties": {
          "key": { "type": "string", "pattern": "^tile_[a-z0-9_]+$" },
          "width": { "type": "integer", "const": 16 },
          "height": { "type": "integer", "const": 16 },
          "source": { "type": "string" },
          "license": { "type": "string" }
        }
      }
    }
  }
}
```

## Replacement Contract
When external pixel art replaces procedural placeholders:
1. Maintain identical `key` names.
2. Maintain exact 16x16 pixel dimensions.
3. Record artist credit and license grant in `CREDITS.md`.

