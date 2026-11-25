# EMBER LINE — cook in the temperature band: 4 burners, 3 heat zones, 12 timed orders, 1 rush hour

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun)
[![Rank](https://make.fun/badge/best-cooking-game-20261125-0137/0x-zeze/best-cooking-game-20261125-0137/rank.svg)](https://make.fun)
[![Reward](https://make.fun/badge/best-cooking-game-20261125-0137/0x-zeze/best-cooking-game-20261125-0137/reward.svg)](https://make.fun)

## What It Is

EMBER LINE is a fast-paced line-cook browser game built around live heat control. Manage four stove burners, dial in each ingredient's ideal temperature, assemble incoming burger orders on the pass, and keep your combo alive through the rush hour finale.

## The Temperature-Band Mechanic

The line has **4 independent burners**, each slewing smoothly toward its setpoint across **3 heat zones**:

- **Too cold** — below the ingredient's band, cooking stalls and wastes ticket patience.
- **In-band** — inside the ingredient's ideal heat band (`Bun` 80–110, `Cheese` 90–130, `Tomato` 110–150, `Onion` 130–170, `Patty` 160–200; `Lettuce` plates raw), cooking progresses cleanly for a **PERFECT** finish and bonus points.
- **Too hot** — above the band, the ingredient chars and burns, forcing a trash and resetting your combo.

## How to Play

- **`1`–`4`** (or click a burner): select burner 1–4.
- **`ArrowUp` / `ArrowDown`** (or `W` / `S`, or burner `-` / `+` buttons): adjust the selected burner's target temperature.
- **Click ingredient bins**: drop an ingredient onto the selected burner (or straight onto the plate for raw lettuce).
- **Click a pan**: move a finished ingredient to the plate, or clear a burnt item.
- **`Space`** (or click **SERVE**): serve the plated order when it matches an active ticket.

## Proof Numbers

- **4 recipes**: Classic Ember, Garden Stack, Smoky Double, Meltdown
- **6 ingredients**: Bun, Patty, Cheese, Tomato, Onion, Lettuce
- **180-second shift**: full dinner service timer
- **Last 60s rush hour**: faster ticket spawns and tighter patience

## Screenshots

- `screenshots/1-cover.jpg` — Full line in service with active orders and plating
- `screenshots/2-heat.jpg` — Temperature bands in action: perfect, too cold, and overheating
- `screenshots/3-rush.jpg` — Rush hour final countdown with four live tickets
- `screenshots/4-serve.jpg` — Matched order ready on the pass to serve

## Run Locally

```bash
node serve.ts
```

Then open `http://localhost:8080/` in your browser.

## License

MIT — see [LICENSE](LICENSE).
