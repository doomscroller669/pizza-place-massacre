# Pizza Place Massacre

A first-person PS1-style horror game set in Pepper Toni's Family Pizzeria. This repository builds it as an Android app (plus a Windows build and a web version).

## Getting the app on your phone

1. On your phone, open the **Releases** page of this repository (sign in to GitHub first).
2. Download `PizzaPlaceMassacre.apk` from the newest release.
3. Open the download. The first time, Android asks you to allow installs from your browser; allow it.
4. For updates, download the newest `PizzaPlaceMassacre.apk` and install it over the old one. Your saves stay.

Toni's typed lines play in Pepper Toni's recorded cartoon-mascot voice. Only a line with no recording falls back to your phone's own text-to-speech voice.

## What's in this build

Milestone 2: the prologue, the table and pizza 1.

- **Cold open, 10:04 PM.** Manny is latched in the walk-in and watches Toni kill the closing crew through the door window: Devon at the dish pit, Bree at the freezer door, and the manager, Rick, against the glass. The window keeps what happened (frost, cracks, blood, the wipe) for the rest of the night.
- **Opening credits.** Right after the cold open, a pizza is made in the dark kitchen from shot to shot under the credits: the dough is dropped and rolled out, the sauce is ladled on, the cheese falls, it goes into the oven and comes out, and it gets a pepperoni face. The title lands on the smiling pizza, the cutter slices it eight ways, and it bleeds. Tap to skip. The names are `CREDITS` at the top of `src/js/87-credits.js`.
- **The score.** 80s horror synth, synthesized live: a slow dread cue, a stalking ostinato when Toni is moving, a chase cue that takes over while he's after you, and the main title theme (the Pepper Toni's jingle turned minor) for the credits. Everyone but Toni is silent; their lines are captions.
- **The Ramirez house, 10:41 PM.** Lucia at her mother's wake. The late delivery and Toni, in the suit, silent on the porch. Grandpa's two-dollar tip and the one-star rating on Lucia's phone, the "sorry it was late" text, and the drugged pizza.
- **Chase 1.** Lucia's dead phone, her locked bedroom, the power cut, the card in the lock, then out through the dark house while Toni searches it. She can duck behind furniture or hide in closets, under beds and behind the shower curtain. Out the front door, his van is at the curb.
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
- Toni's lines are recorded (as `toni`) and play through a small-speaker filter: positional from his phone, or over the PA. A line with no recording falls back to the phone's TextToSpeech engine through `window.AndroidTTS` (`MainActivity`), or `speechSynthesis` in a browser.

- Performance on phones: the game never draws faster than 60 frames a second (90 and 120 Hz screens included), and if frames run long for a few seconds it renders fewer pixels (down to 55%) until they don't; the scale is remembered (`ppm.resScale` in local storage). There are no CSS filters over the game canvas, and the HUD only touches the page when something on it changes.

After editing anything in `src/`, run `python3 tools/assemble.py` and commit the regenerated files.

## Voices

Only Toni is heard. Everyone else (the family, Lucia, Manny, the closing crew) is silent, and their lines are captions: it's creepier, and it keeps the game small. `VOICED` in `tools/voices.py` lists who gets recorded (`toni`, and `announcer` for the commercial).

`tools/voices.py` finds every `toniSay(…)`, `MINUTES_LINE` and the training tape's captions in `src/js/` (it can also find `line('who', …)`, `thinkL(…)`, `thinkM(…)` and the `SAY_*` choice lists, for anyone added to `VOICED`), and records each one with Chatterbox (Resemble AI's open-source voice model), which has an emotion dial per line. The reference clip is made in two steps: Kokoro reads a sample in the cast voice, then Chatterbox re-reads it with feeling, and every line clones that second clip. Toni is Pepper Toni's cartoon mascot voice, lifted a little in pitch after recording.

Every take is checked twice. A speech recognizer (faster-whisper) must hear the written words, and a phoneme recognizer (wav2vec2) must hear the names said right: Lucia is loo-SEE-ah, mijo is MEE-ho, mija is MEE-ha. The script respells those names for the voice model (`PRON`), and a take that fails either check is recorded again with a new seed, up to five takes. The result goes into `src/js/05-vodata.js`.

- The casting is `CAST` at the top of the script; the acting direction for each line (how intense, how slow, shaky or shouting) is `DIRECT`.
- It only records lines whose text or direction changed. Lines already in `05-vodata.js` with the same text and direction are kept as they are (`--redo` records everything again), and takes are cached in `.vo_cache/`, which isn't committed.
- New lines for the established cast clone from that character's own lines already in the game, so they match. A new character (the closing crew) gets a Kokoro-then-Chatterbox reference clip as described above.

```
pip install chatterbox-tts kokoro-onnx soundfile faster-whisper transformers librosa pyloudnorm   # plus ffmpeg on the PATH
# Kokoro's model files: kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
# Chatterbox and both recognizers download their weights from huggingface.co on first use
python3 tools/voices.py /path/to/kokoro-models
python3 tools/assemble.py
```

On a two-core machine a line takes about 30–40 seconds.

## Sound effects

The screams, gasps, body hits and falls, bone, glass, knocks, the door slam and the gore are real recordings: Freesound clips from the FSD50K dataset (Fonseca et al., 2022, via its Hugging Face mirror), released by their uploaders under CC0 or CC BY 3.0. `tools/sfx.py` cuts them (`CUTS` lists every take: clip, start, end, level), encodes them at 32 kHz mono and writes `src/js/07-sfxdata.js`; `tools/sfx.json` is the full list with links. Everything else (the score, the ambience, footsteps, the oven, the UI) is synthesized in the browser.

```
python3 tools/sfx.py --fetch      # downloads the source clips into .sfx_cache/ (not committed), then rebuilds
python3 tools/assemble.py
```

Credits for the CC BY 3.0 clips (creativecommons.org/licenses/by/3.0):

- “screaming_male_painIII.mp3” by GabrielaUPF, https://freesound.org/people/GabrielaUPF/sounds/220293/
- “Scream 01” by adriancalzon, https://freesound.org/people/adriancalzon/sounds/219858/
- “neck_crack.wav” by Halleck, https://freesound.org/people/Halleck/sounds/21914/
- “Bone Break 2a” by XRTdumper, https://freesound.org/people/XRTdumper/sounds/362970/
- “Chipping Large Ice Block 2.wav” by kev_durr, https://freesound.org/people/kev_durr/sounds/426204/
- “Flesh Bite.wav” by jgriffie919, https://freesound.org/people/jgriffie919/sounds/400174/

The rest are CC0 (no credit required): Freesound sounds 94773, 133282, 169628, 208696, 208893, 210536, 219660, 241592, 245410, 269484, 316579, 318077, 318078, 369109, 376308, 384213, 389804, 391362, 405705, 406197, 411034, 413645, 414213, 414848, 416890.

## Faces

The cast has photo faces in the Puppet Combo style: a low-poly blocky head with a photo projected onto its front, and faceted bodies with no outlines. The people in the photos are not real. `tools/faces.py` generates each one with Realistic Vision 5.1 (a photoreal Stable Diffusion 1.5 model, CreativeML OpenRAIL-M) plus the LCM LoRA, so a face takes about a minute and a half on a CPU. Each character gets a neutral portrait and fear, angry and sad versions made from it, so they stay the same person. Each image is lined up on the eyes (OpenCV's YuNet detector), the backdrop is cut out (rembg) and replaced with the head's own hair and skin, and the result is saved in `tools/faces/`. `tools/faces_pack.py` packs them into `src/js/06-facedata.js` at 128×128 with the eye and mouth positions. The game draws blinks and the moving jaw onto the photo from those positions.

- Who each person is (age, hair, clothes) is `FACE` at the top of `tools/faces.py`; the expressions are `EXPR`.
- The closing crew (Rick the manager, Bree and Devon) are generated the same way. Mom's framed photo at the wake is `tools/faces/portrait-mom.jpg`, cropped from her generated portrait; `faces_pack.py` packs it as `PORTRAIT_DATA`.
- Toni's mask is cut from Jordan's reference picture (`tools/faces/toni-ref.jpg`, kept out of git) with the eyes and smile marked by hand in `FACE`; his body (tan stocking suit, stained white apron, chef's hat, red Converse) is built to match it in `50-chars.js`.
- Bodies are built to match the faces: one smooth torso lofted from cross-sections (no separate shoulder pads or boards on the chest), rounded shoulders, elbows and knees, and hands and necks in skin sampled from each face photo. Clothes are drawn over woven fabric textures (`tools/fabrics.py`: twill, shirting, jersey, denim, nylon), with lapels, collars, ties, buttons and cuffs painted into the cloth. What each person wears is `OUTFIT` in `50-chars.js`.
- `PUPPET` in `src/js/50-chars.js` switches the whole look back to the painted faces and outlined bodies.

```
pip install diffusers transformers peft opencv-python pillow rembg
# YuNet's model file: face_detection_yunet_2023mar.onnx from github.com/opencv/opencv_zoo (path in faces.py, YUNET)
python3 tools/faces.py            # or: python3 tools/faces.py dad lucia --expr neutral,fear
python3 tools/fabrics.py
python3 tools/faces_pack.py
python3 tools/assemble.py
```

## Fonts

The page bundles its fonts (`src/fonts.css`, subset to Latin) so the app looks right offline: Bungee, Bungee Shade, Courier Prime, Reenie Beanie and VT323 under the SIL Open Font License 1.1; Yellowtail and Special Elite under the Apache License 2.0. Sources: github.com/google/fonts.
