# Pizza Place Massacre

A first-person PS1-style horror game set in Pepper Toni's Family Pizzeria. This repository builds it as an Android app (plus a Windows build and a web version).

## Getting the app on your phone

1. On your phone, open the **Releases** page of this repository (sign in to GitHub first).
2. Download `PizzaPlaceMassacre.apk` from the newest release.
3. Open the download. The first time, Android asks you to allow installs from your browser; allow it.
4. For updates, download the newest `PizzaPlaceMassacre.apk` and install it over the old one. Your saves stay.

Toni's typed lines play in Pepper Toni's recorded cartoon-mascot voice. Only a line with no recording falls back to your phone's own text-to-speech voice.

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
- Toni's lines are recorded like everyone else's (as `toni`) and play through a small-speaker filter: positional from his phone, or over the PA. A line with no recording falls back to the phone's TextToSpeech engine through `window.AndroidTTS` (`MainActivity`), or `speechSynthesis` in a browser.

After editing anything in `src/`, run `python3 tools/assemble.py` and commit the regenerated files.

## Voices

Every line is recorded. `tools/voices.py` finds every `line('who', …)`, `thinkL(…)`, `thinkM(…)`, `SAY_*` choice list, `toniSay(…)`, `MINUTES_LINE` and the training tape's captions in `src/js/`, and records each one with Chatterbox (Resemble AI's open-source voice model), which has an emotion dial per line. Each character's reference clip is made in two steps: Kokoro reads a sample in the cast voice, then Chatterbox re-reads it with feeling, and every line clones that second clip. Toni is Pepper Toni's cartoon mascot voice, lifted a little in pitch after recording.

Every take is checked twice. A speech recognizer (faster-whisper) must hear the written words, and a phoneme recognizer (wav2vec2) must hear the names said right: Lucia is loo-SEE-ah, mijo is MEE-ho, mija is MEE-ha. The script respells those names for the voice model (`PRON`), and a take that fails either check is recorded again with a new seed, up to five takes. The result goes into `src/js/05-vodata.js`.

- The casting is `CAST` at the top of the script; the acting direction for each line (how intense, how slow, shaky or shouting) is `DIRECT`.
- It only records lines whose text or direction changed (cached in `.vo_cache/`, which isn't committed).

```
pip install chatterbox-tts kokoro-onnx soundfile faster-whisper transformers librosa pyloudnorm   # plus ffmpeg on the PATH
# Kokoro's model files: kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
# Chatterbox and both recognizers download their weights from huggingface.co on first use
python3 tools/voices.py /path/to/kokoro-models
python3 tools/assemble.py
```

On a two-core machine a line takes about 30–40 seconds.

## Faces

The cast has photo faces in the Puppet Combo style: a low-poly blocky head with a photo projected onto its front, and faceted bodies with no outlines. The people in the photos are not real. `tools/faces.py` generates each one with Realistic Vision 5.1 (a photoreal Stable Diffusion 1.5 model, CreativeML OpenRAIL-M) plus the LCM LoRA, so a face takes about a minute and a half on a CPU. Each character gets a neutral portrait and fear, angry and sad versions made from it, so they stay the same person. Each image is lined up on the eyes (OpenCV's YuNet detector), the backdrop is cut out (rembg) and replaced with the head's own hair and skin, and the result is saved in `tools/faces/`. `tools/faces_pack.py` packs them into `src/js/06-facedata.js` at 128×128 with the eye and mouth positions. The game draws blinks and the moving jaw onto the photo from those positions.

- Who each person is (age, hair, clothes) is `FACE` at the top of `tools/faces.py`; the expressions are `EXPR`.
- Toni keeps his painted mascot head: the image model couldn't make his stocking mask.
- `PUPPET` in `src/js/50-chars.js` switches the whole look back to the painted faces and outlined bodies.

```
pip install diffusers transformers peft opencv-python pillow rembg
# YuNet's model file: face_detection_yunet_2023mar.onnx from github.com/opencv/opencv_zoo (path in faces.py, YUNET)
python3 tools/faces.py            # or: python3 tools/faces.py dad lucia --expr neutral,fear
python3 tools/faces_pack.py
python3 tools/assemble.py
```

## Fonts

The page bundles its fonts (`src/fonts.css`, subset to Latin) so the app looks right offline: Bungee, Bungee Shade, Courier Prime, Reenie Beanie and VT323 under the SIL Open Font License 1.1; Yellowtail and Special Elite under the Apache License 2.0. Sources: github.com/google/fonts.
