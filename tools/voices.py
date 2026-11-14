"""Voice every spoken line in the script and embed the audio in the game.

Engine: Chatterbox (Resemble AI, open source), which takes an emotion dial per line ("exaggeration") and clones each
character's timbre from a short reference clip. The reference clips are made once with Kokoro, so the cast keeps the
voices it already had. With --kokoro, everything is rendered with Kokoro alone (fast, flat).

Finds line('who', ...), thinkL(...), thinkM(...) and SAY_* arrays (Lucia's picked choices) in src/js/*.js,
renders each with that character's voice and the line's direction (DIRECT below), post-processes with ffmpeg,
and writes src/js/05-vodata.js (base64 MP3 keyed by an FNV-1a hash of "who|text", computed the same way in the game).
Toni is never voiced here: he talks through the device's own text-to-speech, by design.

Needs: pip install chatterbox-tts kokoro-onnx soundfile; ffmpeg; Kokoro's model files
  kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0).
  Chatterbox downloads its own weights from huggingface.co on first use.
Usage: python3 tools/voices.py /path/to/kokoro-models [--kokoro] [--only who]
  Renders only lines whose text or direction changed (cached in .vo_cache/)."""
import sys, re, json, base64, pathlib, subprocess, tempfile, os
root = pathlib.Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith('--')]
models = pathlib.Path(args[0] if args else '/home/claude/models')
KOKORO_ONLY = '--kokoro' in sys.argv
ONLY = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
cache = root / '.vo_cache'; cache.mkdir(exist_ok=True)

# ---------- casting ----------
# kokoro voice/speed/pitch make each character's reference clip; ex is their resting intensity in Chatterbox
CAST = {
    'dad':       dict(voice='am_michael', speed=0.92, pitch=1.0,  ex=0.6),
    'grandpa':   dict(voice='am_onyx',    speed=0.86, pitch=0.95, ex=0.55),
    'uncle':     dict(voice='am_liam',    speed=0.96, pitch=0.98, ex=0.55),
    'alex':      dict(voice='am_puck',    speed=0.98, pitch=1.16, ex=0.7),
    'ruben':     dict(voice='am_echo',    speed=1.04, pitch=1.2,  ex=0.7),
    'lucia':     dict(voice='af_sky',     speed=0.95, pitch=1.03, ex=0.6),
    'manny':     dict(voice='am_fenrir',  speed=0.9,  pitch=0.98, ex=0.5),
    'announcer': dict(voice='am_puck',    speed=1.08, pitch=1.04, ex=1.0),
}
# what each reference clip says: varied sentences, so the clone hears a range
REF_TEXT = {
    'dad': "Hey. Look at me. We're going to be fine, okay? I promise. Your mother would want us to stay together tonight, so that's what we do.",
    'grandpa': "Six dollars for a large. Six! And they still show up late. Back in my day you tipped when somebody earned it, and nobody earns it anymore.",
    'uncle': "Relax. Everybody relax. I've handled worse than this before breakfast. Just let me do the talking, alright? I know how to deal with people.",
    'alex': "Dad, can we go home now? I don't like it here. It smells weird, and Ruben keeps telling me scary movie stuff. It's not funny.",
    'ruben': "Okay, okay, okay. This is exactly like the movies. Rule one, never split up. Rule two, don't trust the mascot. Rule three, I forgot rule three.",
    'lucia': "I just want this night to be over. It's Mom's funeral and he's complaining about pizza. Whatever. I'm not eating that. It looks disgusting.",
    'manny': "Twelve years at this place. I know every oven, every timer, every busted tile. Just breathe. Do the job. Get through the night. Get home.",
    'announcer': "Come on down to Pepper Toni's! Pizza, games, and fun for the whole family! Pepper Toni's, where family comes first!",
}
# ---------- direction: (who, start of the line) -> exaggeration, cfg weight, effect ----------
# exaggeration: 0.25 flat .. 0.5 normal .. 1.0 big .. 2.0 screaming. Lower cfg (0.3) slows and loosens the delivery for big moments.
DIRECT = [
    ('lucia', 'Dad... what do we do', 0.75, 0.4, None),
    ('dad', 'We stay calm', 0.6, 0.45, 'shaky'),
    ('dad', 'Lucia? ...Lucia', 1.15, 0.3, None),
    ('alex', 'Dad? Where are we', 1.0, 0.35, 'shaky'),
    ('grandpa', 'What the hell is this', 1.0, 0.35, None),
    ('uncle', 'Hey! HEY!', 1.5, 0.3, 'shout'),
    ('ruben', 'This is a party room', 1.1, 0.35, None),
    ('dad', 'That\u2019s it. We\u2019re leaving', 1.2, 0.35, 'shout'),
    ('lucia', 'There\u2019s a pizza box in the middle', 0.65, 0.4, None),
    ('uncle', 'Twelve pizzas?', 1.0, 0.35, None),
    ('ruben', 'That\u2019s\u2026 that\u2019s the mascot', 0.9, 0.35, 'shaky'),
    ('grandpa', 'It\u2019s that delivery boy', 0.8, 0.4, None),
    ('grandpa', 'This is about that damn rating', 1.05, 0.35, None),
    ('grandpa', 'And you listened?', 0.85, 0.4, None),
    ('dad', 'Enough. Both of you', 0.9, 0.4, None),
    ('uncle', 'Just a review', 0.75, 0.45, None),
    ('dad', 'Mija, no.', 0.85, 0.35, 'shaky'),
    ('grandpa', 'Nothing? Typical', 0.65, 0.45, None),
    ('dad', 'Alex. Look at me', 0.9, 0.35, None),
    ('alex', 'I know, Dad', 0.85, 0.4, 'shaky'),
    ('ruben', 'Rule one', 0.95, 0.4, 'shaky'),
    ('uncle', 'What about her?', 0.9, 0.4, None),
    ('lucia', '...One star', 0.55, 0.35, None),
    ('alex', 'Lucia?', 1.0, 0.35, 'shaky'),
    ('alex', 'There\u2019s seeds', 1.4, 0.3, 'shaky'),
    ('alex', '\u2026No seeds', 0.75, 0.4, 'shaky'),
    ('dad', 'Okay! Okay. Just\u2026 eat around them', 1.3, 0.3, 'shaky'),
    ('dad', 'Lucia, don\u2019t', 0.85, 0.4, None),
    ('dad', 'Okay. Okay, mijo', 0.95, 0.35, 'shaky'),
    ('dad', 'ALEX! His pen', 1.9, 0.25, 'shout'),
    ('lucia', 'Sesame.', 0.55, 0.45, None),
    ('lucia', 'A pizza box with wires', 0.5, 0.45, None),
    ('lucia', '"Ramirez party', 0.55, 0.45, None),
    ('lucia', '...Where', 0.6, 0.3, None),
    ('lucia', 'You told me to give him', 0.9, 0.4, None),
    ('lucia', 'It was just a review', 0.65, 0.45, None),
    ('lucia', 'I\u2019m sorry. This is my fault', 1.0, 0.35, 'shaky'),
    ('lucia', 'It\u2019s okay. Just eat', 0.7, 0.4, 'shaky'),
    ('lucia', 'Look at it first', 0.75, 0.4, None),
    ('lucia', 'You don\u2019t have to do this', 0.95, 0.35, 'shaky'),
    ('manny', 'Don\u2019t look', 0.85, 0.35, 'shaky'),
    ('manny', 'They were alive', 0.85, 0.35, 'shaky'),
    ('manny', 'He forgives me', 0.85, 0.35, 'shaky'),
    ('manny', 'Still in the walk-in', 0.65, 0.4, 'cold'),
    ('manny', 'Okay. Okay. Just do what he says', 0.8, 0.35, 'shaky'),
    ('manny', 'He\u2019s coming for it', 0.7, 0.4, None),
    ('manny', 'A family at the party table', 0.75, 0.4, None),
    ('announcer', 'Pepper Toni', 1.1, 0.4, None),
]
def direction(who, text):
    for w, start, ex, cfg, fx in DIRECT:
        if w == who and text.startswith(start): return ex, cfg, fx
    return CAST[who]['ex'], 0.5, None

EXTRA = [('announcer', "Pepper Toni's! Where family comes first!")]

def fnv(s):
    h = 0x811c9dc5
    for ch in s:
        h ^= ord(ch); h = (h * 0x01000193) & 0xffffffff
    return format(h, '08x')

def js_strings(expr):
    out = []
    for m in re.finditer(r"'((?:\\.|[^'\\])*)'|\"((?:\\.|[^\"\\])*)\"", expr):
        raw = m.group(1) if m.group(1) is not None else m.group(2)
        txt = re.sub(r'\\u([0-9a-fA-F]{4})', lambda k: chr(int(k.group(1), 16)), raw)
        txt = txt.replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\')
        if len(txt) > 8 or ' ' in txt or txt.endswith(('.', '?', '!')): out.append(txt)
    return out

def arg_span(src, i):
    """from index i (just after '('), return the text of the first top-level argument and the index after it"""
    depth, j, q = 0, i, None
    while j < len(src):
        c = src[j]
        if q:
            if c == '\\': j += 2; continue
            if c == q: q = None
        elif c in '\'"`': q = c
        elif c in '([{': depth += 1
        elif c in ')]}':
            if depth == 0: return src[i:j], j
            depth -= 1
        elif c == ',' and depth == 0: return src[i:j], j
        j += 1
    return src[i:], j

def extract():
    lines = []
    for f in sorted((root / 'src/js').glob('*.js')):
        if f.name.startswith('05-'): continue
        s = f.read_text()
        for m in re.finditer(r"\bline\(\s*'(\w+)'\s*,", s):
            who = m.group(1); expr, _ = arg_span(s, m.end())
            if expr.strip().startswith('SAY_'): continue
            lines += [(who, t) for t in js_strings(expr)]
        for m in re.finditer(r"\bthink([LM])\(", s):
            who = 'lucia' if m.group(1) == 'L' else 'manny'; expr, _ = arg_span(s, m.end())
            lines += [(who, t) for t in js_strings(expr)]
        for m in re.finditer(r"\bSAY_\w+\s*=\s*\[", s):
            expr = s[m.end():s.index('];', m.end())]
            lines += [('lucia', t) for t in js_strings(expr)]
    seen, out = set(), []
    for l in lines + EXTRA:
        if l not in seen: seen.add(l); out.append(l)
    return out

def spoken(text, for_kokoro=True):
    t = text.replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"')
    t = re.sub('\u2014$', '!' if '!' in t else '.', t)
    t = t.replace('\u2014', ', ').replace('\u2026', '...').replace(':)', '').replace('!!', '!')
    t = re.sub(r'\b([A-Z]{2,})\b', lambda m: m.group(1).capitalize(), t)   # shouting reads as words, not letters
    t = re.sub(r'^\.\.\.', '', t).strip()
    t = re.sub(r'(\w)\.\.\.$', r'\1.', t)
    return t

_k = None
def kokoro(who, text, wav_out):
    global _k
    from kokoro_onnx import Kokoro
    import soundfile as sf
    if _k is None: _k = Kokoro(str(models / 'kokoro-v1.0.onnx'), str(models / 'voices-v1.0.bin'))
    c = CAST[who]
    samples, sr = _k.create(spoken(text), voice=c['voice'], speed=c['speed'], lang='en-us')
    raw = pathlib.Path(str(wav_out) + '.raw.wav'); sf.write(raw, samples, sr)
    p = c['pitch']
    af = [f'asetrate={int(sr*p)}', f'aresample={sr}', f'atempo={1/p:.4f}'] if abs(p - 1) > 0.005 else ['anull']
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(raw), '-af', ','.join(af), str(wav_out)], check=True); raw.unlink()

def reference(who):
    ref = cache / f'ref-{who}-{fnv(json.dumps(CAST[who]) + REF_TEXT[who])}.wav'
    if not ref.exists():
        print('reference clip', who, flush=True); kokoro(who, REF_TEXT[who], ref)
    return ref

_cb = None
def chatterbox(who, text, wav_out, ex, cfg, seed=0):
    global _cb
    import torch, torchaudio
    if _cb is None:
        from chatterbox.tts import ChatterboxTTS
        torch.set_num_threads(max(1, os.cpu_count() or 1))
        _cb = ChatterboxTTS.from_pretrained(device='cpu')
    torch.manual_seed(int(fnv(who + text), 16) % 100000 + seed * 7919)   # same line, same take; a new seed for a retake
    wav = _cb.generate(spoken(text, for_kokoro=False), audio_prompt_path=str(reference(who)), exaggeration=ex, cfg_weight=cfg, temperature=0.8)
    torchaudio.save(str(wav_out), wav, _cb.sr)

FX = {
    None: [],
    'shaky': ['vibrato=f=5.5:d=0.08'],
    'cold': ['vibrato=f=7:d=0.12', 'tremolo=f=6:d=0.15'],
    'shout': ['acompressor=threshold=-24dB:ratio=6:attack=2:release=60', 'volume=2.2', 'alimiter=limit=0.9'],
}
def finish(wav, dst, fx):
    af = ['highpass=f=80'] + FX[fx] + ['acompressor=threshold=-20dB:ratio=3:attack=5:release=80', 'loudnorm=I=-17:TP=-2:LRA=11',
          'silenceremove=start_periods=1:start_threshold=-50dB', 'areverse', 'silenceremove=start_periods=1:start_threshold=-50dB', 'areverse']
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-af', ','.join(af), '-ac', '1', '-ar', '22050',
                    '-c:a', 'libmp3lame', '-b:a', '40k', str(dst)], check=True)

# ---------- checking each take: a speech recognizer must hear the words that were written ----------
_w = None
NUM = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'.split()
def words(t):
    out = []
    for w in re.findall(r"[a-z0-9']+", t.lower().replace('\u2019', "'")):
        if w.isdigit() and int(w) <= 20: w = NUM[int(w)]
        out.append(w.strip("'"))
    return [w for w in out if w]
def heard(path):
    global _w
    import librosa
    from faster_whisper import WhisperModel
    if _w is None: _w = WhisperModel('base.en', device='cpu', compute_type='int8')
    if path.stat().st_size < 2000: return ''   # an empty take: the model went silent
    try: y, _ = librosa.load(str(path), sr=16000)
    except Exception: return ''
    segs, _ = _w.transcribe(y, language='en', beam_size=3)
    return ' '.join(s.text for s in segs)
def take_score(path, text):
    import difflib
    a, b = words(spoken(text)), words(heard(path))
    wr = difflib.SequenceMatcher(None, a, b).ratio()
    # names and one-word lines get spelled every which way ("Lucia" -> "loo shia"), so letters count too
    cr = difflib.SequenceMatcher(None, ''.join(a), ''.join(b)).ratio() if b else 0
    sc = max(wr, cr - 0.1) if len(a) > 2 else max(wr, cr + 0.25 if cr >= 0.45 else cr)
    return round(min(1.0, sc), 3), ' '.join(b)

def render_take(who, text, dst, engine, ex, cfg, fx, seed=0):
    with tempfile.TemporaryDirectory() as td:
        wav = pathlib.Path(td) / 'a.wav'
        if engine == 'kokoro': kokoro(who, text, wav)
        else: chatterbox(who, text, wav, ex, cfg, seed)
        finish(wav, dst, fx)

def main():
    lines = extract()
    data, manifest = {}, []
    engine = 'kokoro' if KOKORO_ONLY else 'chatterbox'
    for who, text in lines:
        key = fnv(who + '|' + text)
        ex, cfg, fx = direction(who, text)
        take = fnv(json.dumps([engine, CAST[who], REF_TEXT.get(who), ex, cfg, fx]))
        dst = cache / f'{key}-{take}.mp3'
        ok = dst.with_suffix('.ok')
        if (ONLY is None or ONLY == who) and not ok.exists():
            best = None
            for attempt in range(4):
                cand = dst if attempt == 0 else dst.with_name(f'{dst.stem}.t{attempt}.mp3')
                if not cand.exists():
                    e = ex if attempt < 3 else max(0.3, ex - 0.35)
                    print('render', engine, who, f'ex={e}', f'take {attempt + 1}', '|', text, flush=True)
                    render_take(who, text, cand, engine, e, cfg, fx, seed=attempt)
                sc, got = take_score(cand, text) if engine != 'kokoro' else (1.0, '')
                print(f'   heard ({sc}): {got}', flush=True)
                if best is None or sc > best[0]: best = (sc, cand)
                if sc >= 0.8: break
            if best[1] != dst: dst.write_bytes(best[1].read_bytes())
            ok.write_text(json.dumps({'score': best[0]}))
        if not dst.exists():   # fall back to the newest earlier take of this line
            older = sorted((p for p in cache.glob(f'{key}*.mp3') if '.t' not in p.name), key=lambda p: p.stat().st_mtime)
            if not older: continue
            dst = older[-1]
        data[key] = base64.b64encode(dst.read_bytes()).decode()
        manifest.append({'key': key, 'who': who, 'text': text, 'exaggeration': ex, 'cfg': cfg, 'fx': fx, 'take': dst.name})
    js = ('/* GENERATED by tools/voices.py: the cast\'s recorded lines, base64 MP3 keyed by fnv("who|text"). Do not edit. */\n'
          'const VO_DATA=' + json.dumps(data, separators=(',', ':')) + ';\n')
    (root / 'src/js/05-vodata.js').write_text(js)
    (root / 'tools/voices.json').write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
    print(len(data), 'lines,', len(js) // 1024, 'KB')

if __name__ == '__main__':
    main()
