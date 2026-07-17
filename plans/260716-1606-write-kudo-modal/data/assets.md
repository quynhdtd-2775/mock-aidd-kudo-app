# Asset Manifest

Mapping `nodeId → asset file path`. Multiple nodeIds may point to the same file (dedup by node name). The path is a PLAN — the file may still be downloading in the background. Paths are **import-ready** (prefix `/write-kudo`).

| Node ID | File path | Filename | Status |
|---------|-----------|----------|--------|
| `I520:11647;520:9873;186:2761` | `/write-kudo/Down.svg` | `Down.svg` | ✓ |
| `I520:11647;520:9881;186:1420` | `/write-kudo/Bold.svg` | `Bold.svg` | ✓ |
| `I520:11647;520:9906;186:2761` | `/write-kudo/Close.svg` | `Close.svg` | ✓ |
| `I520:11647;520:9907;186:1766` | `/write-kudo/Send.svg` | `Send.svg` | ✓ |
| `I520:11647;662:10376;186:1420` | `/write-kudo/Number_List.svg` | `Number_List.svg` | ✓ |
| `I520:11647;662:10507;186:1420` | `/write-kudo/Link.svg` | `Link.svg` | ✓ |
| `I520:11647;662:10647;186:1420` | `/write-kudo/Quote.svg` | `Quote.svg` | ✓ |
| `I520:11647;662:11119;186:1420` | `/write-kudo/Italic.svg` | `Italic.svg` | ✓ |
| `I520:11647;662:11213;186:1420` | `/write-kudo/Strikethrough.svg` | `Strikethrough.svg` | ✓ |
| `I520:11647;662:8911;186:2759` | `/write-kudo/Plus.svg` | `Plus.svg` | ✓ |
| `I520:11647;662:9133;186:2759` | `/write-kudo/Plus.svg` | `Plus.svg` | ✓ |
| `I520:11647;662:9197;256:4717` | `/write-kudo/Sample_Image.png` | `Sample_Image.png` | ✓ |
| `I520:11647;662:9197;662:9287;186:1420` | `/write-kudo/Close_Tiny.svg` | `Close_Tiny.svg` | ✓ |
