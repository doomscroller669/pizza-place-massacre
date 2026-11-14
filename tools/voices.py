"""Voice every spoken line in the script with Kokoro (a local neural TTS) and embed the audio in the game.

Finds line('who', ...), thinkL(...), thinkM(...) and SAY_* arrays (Lucia's picked choices) in src/js/*.js,
renders each with that character's voice, post-processes with ffmpeg, and writes src/js/05-vodata.js
(base64 MP3 keyed by an FNV-1a hash of "who|text", computed the same way in the game).
Toni is never voiced here: he talks through the device's own text-to-speech, by design.

Needs: pip install kokoro-onnx soundfile; ffmpeg; the model files
  kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
Usage: python3 tools/voices.py /path/to/models   (renders only lines it hasn't cached in .vo_cache/)"""
import sys, re, json, base64, hashlib, pathlib, subprocess, tempfile
root = pathlib.Path(__file__).resolve().parent.parent
models = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/home/claude/models')
cache = root / '.vo_cache'; cache.mkdir(exist_ok=True)

# casting: kokoro voice, speed, pitch factor (resample; >1 is younger/higher), extra ffmpeg filters
CAST = {
    'dad':     dict(voice='am_michael', speed=0.92, pitch=1.0),
    'grandpa': dict(voice='am_onyx',    speed=0.86, pitch=0.95),
    'uncle':   dict(voice='am_liam',    speed=0.96, pitch=0.98),
    'alex':    dict(voice='am_puck',    speed=0.98, pitch=1.16),
    'ruben':   dict(voice='am_echo',    speed=1.04, pitch=1.2),
    'lucia':   dict(voice='af_sky',     speed=0.95, pitch=1.03),
    'manny':   dict(voice='am_fenrir',  speed=0.9,  pitch=0.98),
    'announcer': dict(voice='am_puck',  speed=1.08, pitch=1.04),
}
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

def spoken(text):
    t = text.replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"')
    t = re.sub('\u2014$', '!' if '!' in t else '.', t)
    t = t.replace('\u2014', ', ').replace('\u2026', '...').replace(':)', '').replace('!!', '!')
    t = re.sub(r'\b([A-Z]{2,})\b', lambda m: m.group(1).capitalize(), t)   # shouting reads as words, not letters
    t = re.sub(r'^\.\.\.', '', t).strip()
    t = re.sub(r'(\w)\.\.\.$', r'\1.', t)
    return t

def render(who, text, dst):
    from kokoro_onnx import Kokoro
    import soundfile as sf
    global _k
    try: _k
    except NameError: _k = Kokoro(str(models / 'kokoro-v1.0.onnx'), str(models / 'voices-v1.0.bin'))
    c = CAST[who]
    samples, sr = _k.create(spoken(text), voice=c['voice'], speed=c['speed'], lang='en-us')
    with tempfile.TemporaryDirectory() as td:
        wav = pathlib.Path(td) / 'a.wav'; sf.write(wav, samples, sr)
        p = c['pitch']
        af = [f'asetrate={int(sr*p)}', f'aresample={sr}', f'atempo={1/p:.4f}'] if abs(p - 1) > 0.005 else []
        af += ['highpass=f=80', 'acompressor=threshold=-20dB:ratio=3:attack=5:release=80', 'loudnorm=I=-17:TP=-2:LRA=9',
               'silenceremove=start_periods=1:start_threshold=-50dB', 'areverse', 'silenceremove=start_periods=1:start_threshold=-50dB', 'areverse']
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-af', ','.join(af), '-ac', '1', '-ar', '22050',
                        '-c:a', 'libmp3lame', '-b:a', '40k', str(dst)], check=True)

def main():
    lines = extract()
    data, manifest = {}, []
    for who, text in lines:
        key = fnv(who + '|' + text)
        dst = cache / f'{key}.mp3'
        if not dst.exists():
            print('render', who, '|', text); render(who, text, dst)
        data[key] = base64.b64encode(dst.read_bytes()).decode()
        manifest.append({'key': key, 'who': who, 'text': text})
    js = ('/* GENERATED by tools/voices.py: the cast\'s recorded lines (Kokoro TTS), base64 MP3 keyed by fnv("who|text"). Do not edit. */\n'
          'const VO_DATA=' + json.dumps(data, separators=(',', ':')) + ';\n')
    (root / 'src/js/05-vodata.js').write_text(js)
    (root / 'tools/voices.json').write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
    print(len(data), 'lines,', len(js) // 1024, 'KB')

if __name__ == '__main__':
    main()
