"""Cut the game's recorded sound effects out of real field and foley recordings, and embed them.

Source: FSD50K (Fonseca et al., 2022), a dataset of Freesound clips, from its Hugging Face mirror
(huggingface.co/datasets/Fhrozen/FSD50k). Only clips the uploaders released under CC0 or CC BY 3.0 are used;
every CC BY clip is credited in README.md ("Sound effects") and in tools/sfx.json.

Each entry in CUTS is one variant of a named sound: the clip, where to cut it, how loud. The game picks a variant
at random each time (SFX_DATA in src/js/07-sfxdata.js, base64 MP3 at 32 kHz mono).
Usage: python3 tools/sfx.py [--fetch]   (--fetch downloads the source clips into .sfx_cache/ first)
"""
import sys, json, base64, pathlib, subprocess, tempfile, urllib.request
import numpy as np, soundfile as sf
root = pathlib.Path(__file__).resolve().parent.parent
cache = root / '.sfx_cache'; cache.mkdir(exist_ok=True)
MIRROR = 'https://huggingface.co/datasets/Fhrozen/FSD50k/resolve/main/clips/{split}/{id}.wav'

# id: (split, Freesound title, uploader, license)
SOURCES = {
    '208893': ('dev', 'Scream, female x2', None, 'CC0'),
    '219660': ('dev', 'Young Girl Screaming', None, 'CC0'),
    '241592': ('dev', 'pandoramachineannalisaloefflerscreams_02.flac', None, 'CC0'),
    '384213': ('dev', 'Woman scream.wav', None, 'CC0'),
    '169628': ('dev', 'Male voice screaming loudly', None, 'CC0'),
    '391362': ('dev', 'Cry of fear - Man.wav', None, 'CC0'),
    '220293': ('dev', 'screaming_male_painIII.mp3', None, 'CC BY 3.0'),
    '219858': ('dev', 'Scream 01', None, 'CC BY 3.0'),
    '318078': ('dev', 'Whimper_Gasp_1_Female', None, 'CC0'),
    '318077': ('dev', 'Whimper_Gasp_1_Male', None, 'CC0'),
    '414213': ('dev', 'gasp.wav', None, 'CC0'),
    '416890': ('dev', 'Hammer Hitting a Head', None, 'CC0'),
    '405705': ('dev', 'found matress hit.wav', None, 'CC0'),
    '133282': ('dev', 'thump (on carpet)', None, 'CC0'),
    '369109': ('dev', 'VSH-14-fist-slam-concrete wall-short.wav', None, 'CC0'),
    '21914':  ('dev', 'neck_crack.wav', None, 'CC BY 3.0'),
    '362970': ('dev', 'Bone Break 2a', None, 'CC BY 3.0'),
    '426204': ('dev', 'Chipping Large Ice Block 2.wav', None, 'CC BY 3.0'),
    '208696': ('dev', 'Glass smash under boot (+ footsteps)', None, 'CC0'),
    '376308': ('dev', 'glasstomp.wav', None, 'CC0'),
    '245410': ('dev', 'breaking glass.wav', None, 'CC0'),
    '389804': ('dev', 'Shattering Glass.wav', None, 'CC0'),
    '210536': ('eval', 'foley_hardKnocking.wav', None, 'CC0'),
    '94773':  ('eval', 'Door Knock.wav', None, 'CC0'),
    '269484': ('dev', 'Chopping', None, 'CC0'),
    '413645': ('dev', 'Mixed Pickle.wav', None, 'CC0'),
    '400174': ('dev', 'Flesh Bite.wav', None, 'CC BY 3.0'),
    '316579': ('dev', 'Water_Paddle_med_017.wav', None, 'CC0'),
    '411034': ('dev', 'SpitintoSinkSplat.wav', None, 'CC0'),
    '406197': ('dev', 'door metal big heavy close kinda slam thud echo of', None, 'CC0'),
    '414848': ('dev', 'metal bang.mp3', None, 'CC0'),
}
# name: [(clip, start s, end s, peak dB), ...]
CUTS = {
    'screamF':  [('208893', 1.12, 2.25, -2), ('208893', 4.42, 6.0, -2), ('241592', 0.14, 3.05, -2), ('384213', 10.9, 12.45, -2)],
    'screamGirl': [('219660', 0.0, 1.9, -2)],
    'screamFshort': [('384213', 0.66, 1.18, -2)],
    'screamM':  [('169628', 0.05, 2.4, -2), ('220293', 0.05, 1.5, -2)],
    'yellM':    [('219858', 0.0, 0.9, -2), ('391362', 2.6, 3.78, -3)],
    'gaspF':    [('318078', 0.36, 0.95, -4)],
    'gaspM':    [('318077', 0.35, 0.95, -4), ('414213', 0.45, 0.86, -4)],
    'headHit':  [('416890', 0.03, 0.39, -1)],
    'bodyHit':  [('405705', 0.0, 0.62, -1)],
    'bodyFall': [('133282', 0.05, 0.8, -1)],
    'slamHit':  [('369109', 0.0, 0.85, -1)],
    'bone':     [('21914', 0.05, 0.5, -2), ('362970', 1.7, 2.3, -2)],
    'glassCrack': [('426204', 0.0, 0.85, -2), ('208696', 2.5, 2.98, -2)],
    'glassHit': [('376308', 0.0, 0.6, -1)],
    'glassBreak': [('245410', 0.0, 1.5, -1), ('389804', 0.26, 1.0, -1)],
    'knock':    [('210536', 0.0, 0.18, -2), ('210536', 0.22, 0.42, -2), ('94773', 2.18, 2.38, -3), ('94773', 2.6, 2.85, -3)],
    'chop':     [('269484', 0.36, 0.95, -1)],
    'squelch':  [('413645', 1.02, 1.32, -2), ('413645', 2.22, 2.6, -2), ('413645', 2.65, 2.95, -2), ('413645', 4.82, 5.25, -2), ('400174', 0.0, 0.98, -2)],
    'splat':    [('316579', 0.0, 0.85, -3), ('411034', 0.0, 0.5, -3)],
    'doorSlam': [('406197', 0.25, 2.4, -1)],
    'metalHit': [('414848', 0.0, 0.85, -1)],
}

def fetch():
    info = {}
    for f in ['dev_clips_info_FSD50K.json', 'eval_clips_info_FSD50K.json']:
        p = cache / f
        if not p.exists():
            urllib.request.urlretrieve('https://huggingface.co/datasets/Fhrozen/FSD50k/resolve/main/metadata/' + f, p)
        info.update(json.loads(p.read_text()))
    for i, (split, *_ ) in SOURCES.items():
        p = cache / f'{i}.wav'
        if not p.exists():
            print('fetch', i, flush=True); urllib.request.urlretrieve(MIRROR.format(split=split, id=i), p)
    return info

def cut(i, a, b, peak_db, sr_out=32000):
    y, sr = sf.read(cache / f'{i}.wav', always_2d=True); y = y.mean(1)
    y = y[int(a * sr):int(b * sr)].copy()
    n = len(y); fi = min(int(0.004 * sr), n // 4); fo = min(int(max(0.03, (b - a) * 0.18) * sr), n // 2)
    y[:fi] *= np.linspace(0, 1, fi); y[n - fo:] *= np.linspace(1, 0, fo) ** 1.5
    y *= 10 ** (peak_db / 20) / max(1e-6, np.abs(y).max())
    with tempfile.TemporaryDirectory() as td:
        w = pathlib.Path(td) / 'a.wav'; m = pathlib.Path(td) / 'a.mp3'; sf.write(w, y, sr)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(w), '-ac', '1', '-ar', str(sr_out), '-codec:a', 'libmp3lame', '-q:a', '5', str(m)], check=True)
        return m.read_bytes()

def main():
    info = fetch()
    data, manifest = {}, []
    for name, cuts in CUTS.items():
        data[name] = []
        for i, a, b, pk in cuts:
            mp3 = cut(i, a, b, pk); data[name].append(base64.b64encode(mp3).decode())
            split, title, _, lic = SOURCES[i]; up = info.get(i, {}).get('uploader', '?')
            manifest.append({'sound': name, 'clip': i, 'from': a, 'to': b, 'title': title, 'uploader': up, 'license': lic,
                             'url': f'https://freesound.org/people/{up}/sounds/{i}/'})
    js = ('/* GENERATED by tools/sfx.py: recorded sound effects (Freesound clips via FSD50K, CC0 / CC BY 3.0, credited in README.md),\n'
          '   base64 MP3, several variants per sound. Do not edit. */\nconst SFX_DATA=' + json.dumps(data, separators=(',', ':')) + ';\n')
    (root / 'src/js/07-sfxdata.js').write_text(js)
    (root / 'tools/sfx.json').write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
    print(len(manifest), 'cuts,', len(js) // 1024, 'KB')
    print('\n'.join(f"- “{m['title']}” by {m['uploader']} ({m['url']}), {m['license']}" for m in {m['clip']: m for m in manifest if m['license'] != 'CC0'}.values()))

if __name__ == '__main__':
    main()
