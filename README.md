# Pizza Place Massacre

A first-person PS1-style horror game set in Pepper Toni's Family Pizzeria. This repository builds it as an Android app (plus a Windows build and a web version).

## Getting the app on your phone

1. On your phone, open the **Releases** page of this repository (sign in to GitHub first).
2. Download `PizzaPlaceMassacre.apk` from the newest release.
3. Open the download. The first time, Android asks you to allow installs from your browser; allow it.
4. For updates, download the newest `PizzaPlaceMassacre.apk` and install it over the old one. Your saves stay.

Toni talks through your phone's own text-to-speech voice. If he's silent, check that a text-to-speech engine is installed (Settings → Accessibility → Text-to-speech output).

## What's in this build

Milestone 1: the table and pizza 1.

- The whole restaurant: party room, kitchen, walk-in freezer, storeroom, office, employee room, back hall, dining room and buffet, game zone, fun zone and ball pit, storage closet, front entrance and restrooms.
- Lucia wakes at the rigged party table; Toni's rules speech over the speakers; the first Telltale-style choice; Alex's medical bracelet.
- Manny cooks pizza 1 (Alex's Kiddie Pie, the tutorial): the ticket, the timer, gathering ingredients, the hands-on prep minigame, the conveyor oven, cutting and serving.
- A late pizza starts the hunt: break Toni's line of sight, then hide. He slides a note under the door. Three strikes and you're fired.
- Back at the table, Alex eats. A seeded crust or the wrong toppings kill him.

## How the code is laid out

- `src/head.html` is the page's CSS and markup. `src/js/*.js` is the game, in load order (all files share one scope).
- `tools/assemble.py` stitches `src/` into `game/pizza-place-massacre.html` (the same page as the Claude artifact) and writes the app's offline copy, `app/src/main/assets/index.html`, with three.js bundled.
- Every push to `main` runs `.github/workflows/build.yml`, which builds the APK and publishes it as a new release, then builds the Windows app and the GitHub Pages web version.
- Every build is signed with the same key (`app/pizza.keystore`), so updates install over the old app. That key is only suitable for sideloading, not for the Play Store.
- On Android, `MainActivity` hands Toni's lines to the phone's TextToSpeech engine through `window.AndroidTTS` (with pan and volume, so his voice comes from where he is). In a browser the game uses `speechSynthesis`.

After editing anything in `src/`, run `python3 tools/assemble.py` and commit the regenerated files.
