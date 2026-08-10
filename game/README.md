# OVERBROOK RUN — starring Benji 5600

A browser-based, first-person arcade shooter / neighborhood survival run built with
[Three.js](https://threejs.org) and vanilla JavaScript (ES modules). No build step,
no downloads — open a link and play on desktop or mobile.

> **Fiction disclaimer:** Overbrook Run is a work of fiction. Benji 5600, "SIXERS"
> jersey #50, all opponents, businesses, and locations are entirely fictional.
> No real gangs, residents, private addresses, or official Philadelphia sports
> team logos/branding are depicted. Violence is stylized/arcade (knockout +
> fade, no blood/gore).

## Play

Benji 5600 has to get from **Overbrook Avenue** to the **5600 Safe House**
through five sections — Overbrook Avenue → The Basketball Courts → Market Block
→ The Train Station → The 5600 Safe House — while fictional opponents chase,
block, and shoot at him. Fill the **Philly Momentum** meter (move, land hits,
clear checkpoints fast, avoid damage) to unlock **5600 Mode**: faster movement,
quicker reloads, and bonus damage for 10 seconds.

### Controls

**Desktop**
| Key | Action |
|---|---|
| `W A S D` | Move |
| Mouse | Look |
| Left click | Fire |
| Right click | Aim (zoom + tighter spread) |
| `Shift` | Sprint |
| `Space` | Jump |
| `C` / `Ctrl` | Crouch |
| `R` | Reload |
| `Q` | Switch weapon |
| `F` | Activate 5600 Mode (when meter is full) |
| `Esc` | Pause |

**Mobile** — left thumb joystick to move, swipe the right half of the screen to
look, and on-screen buttons for Fire / Aim / Jump / Sprint / Reload / Switch / 5600.

## Run it locally

This project has **zero build step** — it's plain ES modules loaded via an
`importmap`, with Three.js vendored locally at `js/vendor/three.module.js` (no
CDN dependency, works offline once downloaded). Because it uses ES modules and
`fetch`-based imports, it must be served over `http://`, not opened directly as
a `file://` URL.

From the `game/` folder, run any static file server, for example:

```bash
# Option A — Python (usually preinstalled)
python3 -m http.server 8080

# Option B — Node
npx serve .

# Option C — VS Code "Live Server" extension
```

Then open `http://localhost:8080` (or whatever port/tool you used).

## Deployment

Because it's a static site with no build step, any static host works.

### Vercel
1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Set **Root Directory** to `game/`.
4. Framework preset: "Other" — no build command, output directory `.`.
5. Deploy.

### Netlify
1. Push this repo to GitHub (or drag-and-drop the `game/` folder in the Netlify UI).
2. New site from Git → set **Base directory** / **Publish directory** to `game`.
3. No build command needed.
4. Deploy.

### GitHub Pages
1. Push this repo to GitHub.
2. Repo Settings → Pages → Deploy from a branch.
3. Either point Pages at the `game/` folder on your default branch, or copy
   `game/*` into a `docs/` folder / dedicated `gh-pages` branch and point Pages there
   (GitHub Pages doesn't support arbitrary subfolders on all plans).
4. Save — your game will be live at `https://<user>.github.io/<repo>/`.

## Project structure

```
game/
  index.html              # all screens (title, HUD, menus, mobile controls) in one shell
  css/style.css            # full stylesheet (graffiti-inspired UI, HUD, responsive)
  js/
    main.js                 # screen state machine + top-level game loop
    vendor/three.module.js  # vendored Three.js (no CDN dependency)
    core/
      Input.js              # keyboard / mouse / touch input, pointer lock
      AudioManager.js        # 100% procedural WebAudio sound design + music
      SaveData.js             # localStorage settings + high scores
      Leaderboard.js           # local leaderboard now; online-ready adapter
    world/
      World.js               # scene, lighting, fog, rain, sky, collision system
      PropFactory.js          # procedural low-poly building blocks (rowhouses, etc.)
      Textures.js              # runtime canvas-generated textures (no image files)
      Sections.js               # the 5 sections' layout/waves/pickups/events data
    entities/
      Player.js               # FPS controller, stats, first-person rig
      Enemy.js                  # 6 opponent types + state-machine AI
      Pickup.js                  # health/armor/ammo/weapon pickups
      Weapons.js                  # fictional weapon definitions
    systems/
      Momentum.js               # Philly Momentum meter / 5600 Mode
      HUD.js                      # DOM HUD updates
      GameManager.js               # orchestrates the whole run
    utils/MathUtils.js           # small math helpers
```

## Feature checklist

- [x] First-person movement, mouse-look, sprint/crouch/jump, stamina
- [x] Visible first-person hands/arms/jersey + swappable weapon models
- [x] 4 fictional weapons (5600 Compact Blaster, Broad Street Pump, Overbrook
      Rapid, Philly Flash) with ammo, reload, recoil, spread, aim-down
- [x] 6 opponent types (Chaser, Blocker, Ranged, Heavy, Scout, Final Wave
      Captain) with patrol/detect/chase/attack/search AI, flanking/cutoff
      behavior, and obstacle avoidance
- [x] 5 sections, each with a checkpoint, scaling opponent waves, pickups, and
      a unique special event
- [x] Philly Momentum meter + 5600 Mode (speed/reload/damage buff + visual +
      audio cue)
- [x] HUD: health/armor/stamina, ammo, score, combo multiplier, mission timer,
      directional objective arrow, hit markers, damage indicators
- [x] Title, How to Play, Settings, Leaderboard, Credits, Story intro, Pause,
      Game Over, and Victory screens
- [x] Local high scores + a leaderboard adapter ready to point at a real backend
- [x] Desktop (keyboard/mouse/pointer-lock) and mobile (touch joystick + swipe
      look + buttons) controls
- [x] Procedural low-poly Overbrook: rowhouses, corner store, basketball
      courts, rec center, train station + moving train, safehouse, streetlights,
      parked cars, a transit bus, murals, rain, fog, night skyline

## Where to plug in real assets later

Every asset in this MVP is procedural (code-generated geometry, canvas
textures, and WebAudio synthesis) specifically so the game needs **zero**
binary files to run. When you're ready to swap in bespoke art/audio:

| Asset type | Where to add it |
|---|---|
| 3D character model for Benji | Replace the rig built in `entities/Player.js` → `buildFirstPersonRig()`. Load with `GLTFLoader` (add it under `js/vendor/`) and re-parent the weapon mount to the model's hand bone. |
| Enemy models | Replace `buildEnemyMesh()` in `entities/Enemy.js` the same way. |
| Weapon models | Replace the `makeGunModel()` cases in `entities/Player.js`. |
| Building/prop art | Replace the primitives in `world/PropFactory.js` with loaded meshes; keep returning `{ group, collider }` so collision keeps working. |
| Textures (brick, windows, graffiti, court, sky) | Replace the canvas generators in `world/Textures.js` with `THREE.TextureLoader().load('assets/textures/...')`. |
| Music | `core/AudioManager.js` → `startMusic()`. Swap the procedural scheduler for `this._playFile('assets/audio/theme.mp3', this.musicGain)` (helper already included) on a loop. |
| Sound effects (gunshots, footsteps, reload, alerts, checkpoint, 5600 mode, victory/defeat) | Each `play*()` method in `core/AudioManager.js` — swap the synthesis body for a call to `this._playFile(...)`. |
| Voice-over / crowd chant | `AudioManager._playChant()` currently synthesizes a stylized two-tone chant (no real vocals). Replace with a recorded/licensed voice clip via `_playFile`. |
| Online leaderboard | `core/Leaderboard.js` — set `ONLINE_ENDPOINT` to your backend's REST URL (`GET`/`POST /api/leaderboard`, contract documented in the file). Falls back to the local list automatically if unset or unreachable. |

## Notes on scope (MVP)

This is a complete, playable MVP built to run smoothly with zero external
dependencies. A few deliberate scope choices worth knowing about:

- The Basketball Courts "timed wave" and Safe House "final wave" are survive
  challenges (a countdown + HUD messaging), not literal physical gates/walls —
  this avoids any risk of a soft-lock while keeping the intended tension.
- Graphics quality (Settings → Graphics Quality) is read once when a run
  starts; changing it mid-run applies on your next Play.
- Enemy AI uses distance-based detection rather than full raycasted
  line-of-sight, in keeping with "simple but effective" arcade AI.
