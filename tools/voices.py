"""Voice every spoken line in the script and embed the audio in the game.

Engine: Chatterbox (Resemble AI, open source), which takes an emotion dial per line ("exaggeration") and clones each
character's timbre from a short reference clip. The reference clips are made once with Kokoro, so the cast keeps the
voices it already had. With --kokoro, everything is rendered with Kokoro alone (fast, flat).

Finds line('who', ...), thinkL(...), thinkM(...), SAY_* arrays (Lucia's picked choices), toniSay(...), MINUTES_LINE and the
training tape's captions (TAPE) in src/js/*.js, renders each with that character's voice and the line's direction (DIRECT below),
post-processes with ffmpeg, and writes src/js/05-vodata.js (base64 MP3 keyed by an FNV-1a hash of "who|text", computed the same
way in the game). Toni ('toni') is Pepper Toni's cartoon mascot voice: his phone reads his typing out in it.

Each character's reference clip is made in two steps: Kokoro reads REF_TEXT in the cast voice, then Chatterbox re-reads it with
feeling from that clip. The second clip is the one every line clones, so the cast keeps its timbre but loses Kokoro's flat delivery.
Every take is checked twice: a speech recognizer must hear the written words, and a phoneme recognizer must hear the names said
right (Lucia = loo-SEE-ah, mijo = MEE-ho, mija = MEE-ha). A take that fails either is recorded again with a new seed.

Needs: pip install chatterbox-tts kokoro-onnx soundfile faster-whisper transformers pyloudnorm; ffmpeg; Kokoro's model files
  kokoro-v1.0.onnx and voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0).
  Chatterbox downloads its own weights from huggingface.co on first use.
Usage: python3 tools/voices.py /path/to/kokoro-models [--kokoro] [--only who]
  Renders only lines whose text or direction changed (cached in .vo_cache/)."""
import sys, re, json, base64, pathlib, subprocess, tempfile, os
root = pathlib.Path(__file__).resolve().parent.parent
args = [a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith('--') and sys.argv[i - 1] not in ('--only', '--max')]
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
    'manny':     dict(voice='am_fenrir',  speed=0.94, pitch=0.98, ex=0.7),
    # Pepper Toni, the mascot: a bouncy cartoon voice, pitched up after recording (fx 'toon')
    'toni':      dict(voice='am_puck',    speed=1.12, pitch=1.16, ex=1.05, fx='toon'),
    'announcer': dict(voice='am_puck',    speed=1.12, pitch=1.16, ex=1.1,  fx='toon', same='toni'),
    # the closing crew, for the cold open
    'manager':   dict(voice='am_eric',    speed=1.0,  pitch=0.96, ex=0.55),
    'bree':      dict(voice='af_bella',   speed=1.06, pitch=1.06, ex=0.75),
}
# what each reference clip says: varied sentences, so the clone hears a range
REF_TEXT = {
    'dad': "Hey. Look at me. We're going to be fine, okay? I promise. Your mother would want us to stay together tonight, so that's what we do.",
    'grandpa': "Six dollars for a large. Six! And they still show up late. Back in my day you tipped when somebody earned it, and nobody earns it anymore.",
    'uncle': "Relax. Everybody relax. I've handled worse than this before breakfast. Just let me do the talking, alright? I know how to deal with people.",
    'alex': "Dad, can we go home now? I don't like it here. It smells weird, and Ruben keeps telling me scary movie stuff. It's not funny.",
    'ruben': "Okay, okay, okay. This is exactly like the movies. Rule one, never split up. Rule two, don't trust the mascot. Rule three, I forgot rule three.",
    'lucia': "I just want this night to be over. It's Mom's funeral and he's complaining about pizza. Whatever. I'm not eating that. It looks disgusting.",
    'manny': "Twelve years in this kitchen, man. Twelve years! I know every oven, every timer, every busted tile. And tonight? Tonight I just want to get home. That's it. Just breathe, Manny. Get home.",
    'toni': "Hiya, pals! It's me, Pepper Toni! Who's hungry? Ha ha! Extra cheese, extra pepperoni, and extra fun for the whole family! Come on down, I saved you a seat!",
    'announcer': "Hiya, pals! It's me, Pepper Toni! Who's hungry? Ha ha! Extra cheese, extra pepperoni, and extra fun for the whole family! Come on down, I saved you a seat!",
    'manager': "Listen, I run a tight ship here. You clock in on time, you smile at the customers, and you do not eat the breadsticks. That's it. That's the whole job. Got it?",
    'bree': "Oh my gosh, okay, so I have a calc test tomorrow and I'm closing again tonight. I'm so tired. Can somebody else please do the bathrooms this time?",
}
# how hard the second step of each reference clip acts
BOOT_EX = {'toni': 1.15, 'announcer': 1.15}
# ---------- direction: (who, start of the line) -> exaggeration, cfg weight, effect ----------
# exaggeration: 0.25 flat .. 0.5 normal .. 1.0 big .. 2.0 screaming. Lower cfg (0.3) slows and loosens the delivery for big moments.
DIRECT = [
    # the table wakes
    ('lucia', 'Mm\u2026 where', 0.5, 0.3, None),
    ('dad', 'Lucia? Lucia! Mija, look at me', 1.2, 0.3, None),
    ('alex', 'Dad? Where are we', 1.0, 0.35, None),
    ('grandpa', 'What the hell is this', 1.0, 0.35, None),
    ('uncle', 'Hey! HEY!', 1.5, 0.3, 'shout'),
    ('ruben', 'Why are there balloons', 1.1, 0.35, None),
    ('dad', 'Okay, that\u2019s it. Kids, up', 1.2, 0.35, 'shout'),
    ('lucia', 'Dad, stop! There\u2019s wires', 1.2, 0.35, None),
    ('uncle', 'Twelve pizzas?', 1.0, 0.38, None),
    ('ruben', 'No. No, no, no', 1.1, 0.35, None),
    ('grandpa', 'I know that walk', 0.85, 0.4, None),
    ('grandpa', 'This is about that damn rating', 1.05, 0.35, None),
    ('lucia', 'You told me to give him one star', 1.1, 0.35, None),
    ('lucia', 'It was just a stupid review', 1.0, 0.4, None),
    ('lucia', 'I\u2019m sorry. This is all my fault', 1.0, 0.35, None),
    ('grandpa', 'Oh, so now you listen to me', 0.95, 0.4, None),
    ('dad', 'Enough! Both of you', 1.1, 0.4, None),
    ('uncle', 'Yeah? Go tell that', 0.85, 0.42, None),
    ('dad', 'No. Mija, no', 0.9, 0.35, None),
    ('grandpa', 'Nothing to say? Typical', 0.7, 0.45, None),
    ('dad', 'Alex. Alex, look at me', 0.9, 0.38, None),
    ('alex', 'I know, Dad. I know', 0.85, 0.4, None),
    ('ruben', 'Okay. Horror movie rules', 1.0, 0.4, None),
    ('lucia', 'Dad? What do we do', 0.8, 0.4, None),
    ('dad', 'I don\u2019t know, mija', 0.85, 0.4, None),
    # the first pizza
    ('uncle', 'Hey. What about her', 0.9, 0.4, None),
    ('lucia', '...One star', 0.55, 0.35, None),
    ('alex', 'Lucia?', 1.0, 0.35, None),
    ('lucia', 'It\u2019s okay, Alex', 0.75, 0.4, None),
    ('lucia', 'Wait. Check it first', 0.8, 0.4, None),
    ('lucia', 'You don\u2019t have to do this', 1.1, 0.35, None),
    ('alex', 'Dad\u2026 there\u2019s seeds', 1.4, 0.3, None),
    ('alex', 'No seeds. Just pepperoni', 0.75, 0.4, None),
    ('dad', 'Okay! Okay! Just eat around them', 1.3, 0.3, None),
    ('dad', 'Lucia, stop. Don\u2019t', 0.9, 0.4, None),
    ('dad', 'That\u2019s it. That\u2019s it, mijo', 0.95, 0.35, None),
    ('dad', 'ALEX! His pen', 1.9, 0.25, 'shout'),
    # Lucia looking around
    ('lucia', 'Sesame. He can\u2019t even touch it', 0.65, 0.45, None),
    ('lucia', 'Wires going under every chair', 0.85, 0.4, None),
    ('lucia', '\u201cRamirez, party of six', 0.7, 0.45, None),
    # Manny
    ('manny', 'Still in the walk-in', 0.75, 0.4, None),
    ('manny', 'It\u2019s open. Okay', 0.85, 0.38, None),
    ('manny', 'Don\u2019t look at them', 0.85, 0.35, None),
    ('manny', 'They were alive at ten', 0.9, 0.35, None),
    ('manny', 'He\u2026 forgives me', 0.9, 0.35, None),
    ('manny', 'Here he comes', 0.85, 0.4, None),
    ('manny', 'There\u2019s a whole family', 0.85, 0.38, None),
    ('manny', 'Kiddie Pie. Like the menu', 0.75, 0.42, None),
    ('manny', 'Locked. The grate', 0.8, 0.42, None),
    # Toni's mascot voice: sunny by default; flatter where the moment is grim
    ('toni', 'Ramirez, party of five', 0.6, 0.45, 'toon'),
    ('toni', 'That\u2019s not what they ordered', 0.8, 0.45, 'toon'),
    ('toni', 'Three strikes', 1.2, 0.35, 'toon'),
    ('toni', 'Hi, team!', 1.2, 0.35, 'toon'),
    ('toni', 'Today we\u2019re making', 1.2, 0.35, 'toon'),
    ('toni', 'Stretch it!', 1.2, 0.35, 'toon'),
    ('toni', 'Give it a pepperoni', 1.2, 0.35, 'toon'),
    ('toni', 'TONI\u2019S FAMOUS SEEDS', 1.2, 0.35, 'toon'),
    ('toni', 'Kids LOVE', 1.2, 0.35, 'toon'),
    ('toni', 'Remember: FAMILY', 1.2, 0.35, 'toon'),
    ('announcer', 'Pepper Toni', 1.2, 0.35, 'toon'),
    # ---- the cold open ----
    ('manny', 'Last case of mozz', 0.55, 0.45, None),
    ('manny', 'Hey! Hey, open up', 1.3, 0.32, 'shout'),
    ('manny', 'It won\u2019t move', 0.9, 0.38, None),
    ('manny', 'Devon! DEVON!', 1.8, 0.25, 'shout'),
    ('manny', 'Earbuds', 0.9, 0.38, None),
    ('manny', 'No. No, no, no, no', 1.4, 0.3, None),
    ('bree', 'Devon? DEVON!', 1.8, 0.25, 'shout'),
    ('bree', 'Manny?! Why won\u2019t', 1.7, 0.25, 'shout'),
    ('manny', 'The pin!', 1.6, 0.28, 'shout'),
    ('bree', 'I can\u2019t find it', 1.6, 0.28, None),
    ('manny', 'Bree\u2026 oh God', 1.0, 0.32, None),
    ('manny', 'No bars', 0.9, 0.35, None),
    ('manager', '\u2014sir. Sir.', 0.6, 0.45, None),
    ('manager', 'Cheap old bastard', 0.5, 0.45, None),
    ('manager', 'Devon? Oh, Jesus', 1.3, 0.3, None),
    ('manager', 'Okay. Okay, buddy', 1.3, 0.3, None),
    ('manager', 'Wait\u2014 WAIT', 1.9, 0.25, 'shout'),
    ('manny', 'Kid\u2026 what did you do', 1.0, 0.3, None),
    ('toni', 'Time for your performance', 1.1, 0.4, 'toon'),
    ('toni', 'Keep the ovens on', 1.1, 0.4, 'toon'),
    # ---- the wake ----
    ('grandpa', 'Forty minutes. Forty', 0.8, 0.4, None),
    ('uncle', 'You could\u2019ve let me cater', 0.6, 0.45, None),
    ('grandpa', 'With what money', 0.8, 0.4, None),
    ('uncle', 'Wow. Okay.', 0.5, 0.45, None),
    ('dad', 'Can we not do this', 0.85, 0.38, None),
    ('ruben', 'Is your grandpa', 0.6, 0.45, None),
    ('alex', 'Yeah. He\u2019s nicer', 0.55, 0.45, None),
    ('dad', 'Hey. You doing okay', 0.6, 0.42, None),
    ('dad', 'Yeah. Me too.', 0.55, 0.42, None),
    ('dad', 'No. But I\u2019ve got you', 0.8, 0.38, None),
    ('dad', 'Pizza at her own wake', 0.65, 0.42, None),
    ('grandpa', 'The good place', 0.6, 0.45, None),
    ('dad', 'That\u2019s okay. You don\u2019t', 0.6, 0.42, None),
    ('lucia', 'He\u2019s running a few', 0.5, 0.45, None),
    ('grandpa', 'A few minutes!', 1.0, 0.38, None),
    ('uncle', 'Bet he loved you', 0.55, 0.45, None),
    ('dad', 'Lucia, can you get that', 0.55, 0.45, None),
    ('grandpa', 'And don\u2019t you tip', 0.8, 0.42, None),
    ('lucia', 'Two dollars? Grandpa', 0.85, 0.4, None),
    ('grandpa', 'Plenty. Go.', 0.7, 0.45, None),
    ('lucia', 'Um. Hi.', 0.4, 0.45, None),
    ('lucia', '\u2026Thanks?', 0.45, 0.45, None),
    ('grandpa', 'Is that him?', 1.0, 0.38, 'shout'),
    ('grandpa', 'Give it here', 0.6, 0.45, None),
    ('grandpa', 'Cold. Of course', 0.7, 0.42, None),
    ('grandpa', 'Lucia. Give him one star', 0.7, 0.42, None),
    ('lucia', 'Grandpa, he was just late', 0.7, 0.42, None),
    ('grandpa', 'One star. Bad ratings', 0.75, 0.42, None),
    ('dad', 'Pop. Come on.', 0.6, 0.42, None),
    ('grandpa', 'My money. Do it', 0.8, 0.42, None),
    ('grandpa', 'Five? For cold pizza', 1.0, 0.38, None),
    ('grandpa', 'One. Star.', 0.9, 0.4, None),
    ('grandpa', 'Now write', 0.6, 0.45, None),
    ('lucia', 'Sorry, whoever you are', 0.45, 0.45, None),
    ('dad', 'Okay. Eat, everybody', 0.55, 0.45, None),
    ('grandpa', 'Princess. More for us', 0.6, 0.45, None),
    ('grandpa', 'More for us', 0.6, 0.45, None),
    ('lucia', 'He texted me', 0.6, 0.42, None),
    ('uncle', 'Creepy.', 0.5, 0.45, None),
    ('grandpa', 'Good. He should be sorry', 0.6, 0.45, None),
    ('alex', 'It tastes kind of weird', 0.55, 0.45, None),
    ('ruben', 'That\u2019s how you know', 0.6, 0.45, None),
    ('ruben', 'In horror movies', 0.75, 0.42, None),
    ('alex', 'Shut up, Ruben', 0.6, 0.45, None),
    ('uncle', 'Man, I\u2019m wiped', 0.45, 0.5, None),
    ('grandpa', 'Hey. HEY. Sit up', 1.1, 0.35, None),
    ('alex', 'Lucia? I feel', 0.6, 0.4, None),
    ('ruben', 'Guys? Guys, this isn\u2019t', 1.1, 0.35, None),
    ('dad', 'Something\u2019s in the', 1.0, 0.35, None),
    ('lucia', 'Dad? DAD!', 1.8, 0.25, 'shout'),
    ('lucia', 'Dad. Dad, wake up', 1.3, 0.3, None),
    ('lucia', 'No. No, no, no. Not now', 1.4, 0.3, None),
    ('lucia', 'No, no, no, no\u2026', 1.0, 0.32, None),
    ('uncle', 'Mmh\u2026 Pop?', 0.5, 0.45, None),
    ('lucia', 'Dad\u2026?', 1.0, 0.35, None),
    ('lucia', 'He\u2019s breathing', 0.9, 0.35, None),
    ('lucia', 'The garage door', 0.85, 0.38, None),
    ('lucia', 'Is that\u2026 a card', 0.9, 0.35, None),
    ('lucia', 'He\u2019s going back', 1.0, 0.35, None),
    ('lucia', 'Dad picked the one', 0.55, 0.45, None),
    ('lucia', 'I\u2019m fine.', 0.45, 0.45, None),
    ('lucia', 'No. Are you?', 0.6, 0.42, None),
    ('lucia', 'Mom would\u2019ve hated', 0.55, 0.45, None),
    ('lucia', 'Sorry. My grandpa', 0.5, 0.45, None),
    ('lucia', 'You\u2019re really late', 0.6, 0.45, None),
    ('lucia', 'I gotta go', 0.5, 0.45, None),
    ('lucia', 'I\u2019m not eating six', 0.7, 0.42, None),
    ('lucia', 'I\u2019m not hungry', 0.45, 0.45, None),
    ('lucia', 'I can\u2019t leave them', 0.8, 0.38, None),
    ('toni', 'You wrote: late and cold', 0.9, 0.42, 'toon'),
    ('toni', 'I\u2019m saying a lot now', 0.75, 0.45, 'toon'),
    ('toni', 'Your order is on its way', 1.0, 0.42, 'toon'),
]
def direction(who, text):
    for w, start, ex, cfg, fx in DIRECT:
        if w == who and text.startswith(start): return ex, cfg, fx
    c = CAST[who]
    return c['ex'], 0.42 if c.get('fx') == 'toon' else 0.45, c.get('fx')

EXTRA = [('announcer', "Pepper Toni's! Where family comes first!")]

def fnv(s):
    """FNV-1a over UTF-16 code units, exactly like the game's voKey (so an emoji hashes the same in both)"""
    h = 0x811c9dc5
    b = s.encode('utf-16-le')
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8); h = (h * 0x01000193) & 0xffffffff
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
        for m in re.finditer(r"\btoniSay\(", s):
            expr, _ = arg_span(s, m.end())
            lines += [('toni', t) for t in js_strings(expr)]
        for m in re.finditer(r"\b(MINUTES_LINE|TAPE)\s*=\s*\[", s):
            expr = s[m.end():s.index('];', m.end())]
            lines += [('toni', t) for t in js_strings(expr) if '#' not in t]
    seen, out = set(), []
    for l in lines + EXTRA:
        if l not in seen: seen.add(l); out.append(l)
    return out

# how the names are said: respelled so the models can't guess wrong (Lucia = loo-SEE-ah, mijo = MEE-ho, mija = MEE-ha)
PRON = [(r'\bLucia\b', 'Lucee-uh'), (r'\bmijo\b', 'meeho'), (r'\bMijo\b', 'Meeho'), (r'\bmija\b', 'meeha'), (r'\bMija\b', 'Meeha')]
EMOJI = {'\U0001F44D': 'thumbs up', '\U0001F620': 'angry face', '\U0001F355': 'pizza', '\u2b50': 'star', '\U0001F642': 'slightly smiling face', '\U0001F60A': 'smiling face'}
def spoken(text, for_kokoro=True, respell=True):
    t = text
    for k, v in EMOJI.items():
        if k in t: t = re.sub(r'\.?\s*' + k, '. ' + v.capitalize() + '.', t)
    t = t.replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"')
    if respell:
        for a, b in PRON: t = re.sub(a, b, t)
    t = re.sub('\u2014$', '!' if '!' in t else '.', t)
    t = t.replace('\u2014', ', ').replace('\u2026', '...').replace(':)', '').replace('!!', '!')
    t = re.sub(r"\b([A-Z]{2,}(?:'[A-Z]+)?)\b", lambda m: m.group(1).capitalize(), t)   # shouting reads as words, not letters
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

def kokoro_ref(who):
    ref = cache / f'ref-{who}-{fnv(json.dumps(CAST[who]) + REF_TEXT[who])}.wav'
    if not ref.exists():
        print('reference clip', who, flush=True); kokoro(who, REF_TEXT[who], ref)
    return ref
def line_ref(who):
    """a reference clip cut from lines this character already has in the game (the longest ones, about ten seconds),
    so a line recorded today sounds like the lines recorded before. Toni's lines have the cartoon lift undone first."""
    if not OLD: return None
    mine = sorted([m for m in OLD_MANIFEST if m['who'] == who and m['key'] in OLD], key=lambda m: -len(m['text']))
    if len(mine) < 3: return None
    ref = cache / f'ref3-{who}-{fnv("".join(m["key"] for m in mine[:8]))}.wav'
    if ref.exists(): return ref
    with tempfile.TemporaryDirectory() as td:
        parts, total = [], 0.0
        for m in mine[:8]:
            mp3 = pathlib.Path(td) / f'{m["key"]}.mp3'; mp3.write_bytes(base64.b64decode(OLD[m['key']]))
            wav = pathlib.Path(td) / f'{m["key"]}.wav'
            af = [f'asetrate={int(22050 / TOON)}', 'aresample=22050', f'atempo={TOON:.4f}'] if who == 'toni' else ['anull']
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(mp3), '-af', ','.join(af + ['apad=pad_dur=0.35']), '-ar', '24000', '-ac', '1', str(wav)], check=True)
            parts.append(wav); total += float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(wav)], capture_output=True, text=True).stdout or 0)
            if total >= 10: break
        lst = pathlib.Path(td) / 'list.txt'; lst.write_text(''.join(f"file '{p}'\n" for p in parts))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c', 'copy', str(ref)], check=True)
    print('reference clip from recorded lines', who, f'{total:.1f}s', flush=True)
    return ref
def reference(who):
    """the clip every line clones: for the established cast, their own recorded lines (line_ref); for anyone new,
    Chatterbox re-reading REF_TEXT with feeling from the Kokoro clip, best of three takes."""
    who = CAST[who].get('same', who)
    if KOKORO_ONLY: return kokoro_ref(who)
    lr = line_ref(who)
    if lr: return lr
    ex = BOOT_EX.get(who, 0.8)
    ref = cache / f'ref2-{who}-{fnv(json.dumps(CAST[who]) + REF_TEXT[who] + str(ex))}.wav'
    if not ref.exists():
        best = None
        for k in range(3):
            cand = ref.with_name(ref.stem + f'.c{k}.wav')
            if not cand.exists():
                print('expressive reference clip', who, 'take', k + 1, flush=True)
                chatterbox(who, REF_TEXT[who], cand, ex, 0.4, seed=k, prompt=kokoro_ref(who))
            sc, got = take_score(cand, REF_TEXT[who])
            print(f'   heard ({sc}): {got}', flush=True)
            if best is None or sc > best[0]: best = (sc, cand)
            if sc >= 0.9: break
        ref.write_bytes(best[1].read_bytes())
    return ref

_cb = None
def chatterbox(who, text, wav_out, ex, cfg, seed=0, prompt=None):
    global _cb
    import torch, torchaudio
    if _cb is None:
        from chatterbox.tts import ChatterboxTTS
        torch.set_num_threads(max(1, os.cpu_count() or 1))
        _cb = ChatterboxTTS.from_pretrained(device='cpu')
    torch.manual_seed(int(fnv(who + text), 16) % 100000 + seed * 7919)   # same line, same take; a new seed for a retake
    wav = _cb.generate(spoken(text, for_kokoro=False), audio_prompt_path=str(prompt or reference(who)), exaggeration=ex, cfg_weight=cfg, temperature=0.8)
    torchaudio.save(str(wav_out), wav, _cb.sr)

TOON = 1.07   # the mascot's lift: pitch and formants up a little, at the same speed, like a cartoon voice
FX = {
    None: [],
    'shout': ['acompressor=threshold=-24dB:ratio=6:attack=2:release=60', 'volume=2.2', 'alimiter=limit=0.9'],
    'toon': ['asetrate=24000*%s' % TOON, 'aresample=24000', 'atempo=%.4f' % (1 / TOON), 'treble=g=3:f=3500', 'acompressor=threshold=-22dB:ratio=4:attack=3:release=60'],
}
def finish(wav, dst, fx):
    af = ['aresample=24000', 'highpass=f=80'] + FX[fx] + ['acompressor=threshold=-20dB:ratio=3:attack=5:release=80', 'loudnorm=I=-17:TP=-2:LRA=11',
          'silenceremove=start_periods=1:start_threshold=-50dB', 'areverse', 'silenceremove=start_periods=1:start_threshold=-50dB', 'areverse']
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-af', ','.join(af), '-ac', '1', '-ar', '22050',
                    '-c:a', 'libmp3lame', '-b:a', '40k', str(dst)], check=True)

# ---------- levelling: every line lands at the same loudness (finish()'s loudnorm is loose on short clips) ----------
TARGET_LUFS = -17.0
def leveled(src):
    """src set to exactly TARGET_LUFS (integrated; RMS for clips under half a second), peaks limited. Cached beside it."""
    out = src.with_name(src.stem + f'.lv{int(-TARGET_LUFS * 10)}.mp3')
    if out.exists() and out.stat().st_mtime >= src.stat().st_mtime: return out
    import numpy as np, librosa, pyloudnorm
    y, sr = librosa.load(str(src), sr=22050)
    L = pyloudnorm.Meter(sr).integrated_loudness(y) if len(y) > sr * 0.5 else 20 * np.log10(np.sqrt(np.mean(y ** 2)) + 1e-9) - 0.7
    gain = max(-12.0, min(12.0, TARGET_LUFS - L)) if np.isfinite(L) else 0.0
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-af', f'volume={gain:.2f}dB,alimiter=limit=0.84:attack=2:release=40',
                    '-ac', '1', '-ar', '22050', '-c:a', 'libmp3lame', '-b:a', '40k', str(out)], check=True)
    return out

# ---------- checking each take: a speech recognizer must hear the words that were written ----------
_w = None
# names the recognizer spells its own way: heard as these, they count as said right
HOMO = {'brie': 'bree', 'devin': 'devon', 'reuben': 'ruben', 'toney': 'toni', 'tony': 'toni', 'mozzarella': 'mozz', 'moz': 'mozz', 'mots': 'mozz'}
NUM = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'.split()
def words(t):
    out = []
    for w in re.findall(r"[a-z0-9']+", t.lower().replace('\u2019', "'")):
        if w.isdigit() and int(w) <= 20: w = NUM[int(w)]
        w = w.strip("'"); out.append(HOMO.get(w, w))
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
_ph = None
def phones(path):
    """the phones a wav2vec2 phoneme recognizer hears, as espeak IPA"""
    global _ph
    import torch, librosa
    from transformers import Wav2Vec2ForCTC, Wav2Vec2PhonemeCTCTokenizer, Wav2Vec2FeatureExtractor
    if _ph is None:
        M = 'facebook/wav2vec2-lv-60-espeak-cv-ft'
        _ph = (Wav2Vec2PhonemeCTCTokenizer.from_pretrained(M, do_phonemize=False), Wav2Vec2FeatureExtractor.from_pretrained(M), Wav2Vec2ForCTC.from_pretrained(M).eval())
    tok, fe, model = _ph
    try: y, _ = librosa.load(str(path), sr=16000)
    except Exception: return ''
    with torch.no_grad(): logits = model(fe(y, sampling_rate=16000, return_tensors='pt').input_values).logits
    return tok.decode(torch.argmax(logits, -1)[0])
# each name and the phones it must come out as (loo-SEE-ah, MEE-ho, MEE-ha; never loo-CHEE-ah or MEE-jo)
NAMES = [(r'\bLucia\b', r'l ?\S* ?s ?(i|iː|ɪ) ?(j ?)?(ə|a|ɐ|ʌ|ɑ|æ)'), (r'\b[Mm]ijo\b', r'm ?(i|iː|ɪ) ?(h|x|ç) ?(o|oʊ|ɔ|ʊ|ə|u)'), (r'\b[Mm]ija\b', r'm ?(i|iː|ɪ) ?(h|x|ç) ?(a|ɑː|ɑ|ɐ|æ|ə|ʌ)')]
def names_ok(path, text):
    need = [(len(re.findall(w, text)), ph) for w, ph in NAMES if re.search(w, text)]
    if not need: return True, ''
    got = phones(path)
    return all(len(re.findall(ph, got)) >= min(n, 2) for n, ph in need), got
def take_score(path, text):
    import difflib
    sc, got = words_score(path, text)
    ok, ph = names_ok(path, text)
    if not ok: return round(sc * 0.5, 3), got + '  [names wrong: ' + ph + ']'
    return sc, got
def words_score(path, text):
    import difflib
    a, b = words(spoken(text, respell=False)), words(heard(path))
    a2 = words(spoken(text))
    wr = max(difflib.SequenceMatcher(None, a, b).ratio(), difflib.SequenceMatcher(None, a2, b).ratio())
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

OLD, OLD_MANIFEST = {}, []
MAX_NEW = int(sys.argv[sys.argv.index('--max') + 1]) if '--max' in sys.argv else 0
RENDERED = [0]
def load_old():
    """what 05-vodata.js and voices.json already hold"""
    f = root / 'src/js/05-vodata.js'
    if f.exists():
        t = f.read_text(); i = t.index('const VO_DATA=') + len('const VO_DATA='); OLD.update(json.loads(t[i:t.rindex(';')]))
    mf = root / 'tools/voices.json'
    if mf.exists(): OLD_MANIFEST.extend(json.loads(mf.read_text()))
def main():
    load_old()
    old_dir = {m['key']: (m['exaggeration'], m['cfg'], m['fx']) for m in OLD_MANIFEST}
    lines = extract()
    data, manifest = {}, []
    engine = 'kokoro' if KOKORO_ONLY else 'chatterbox'
    for who, text in lines:
        key = fnv(who + '|' + text)
        ex, cfg, fx = direction(who, text)
        if key in OLD and old_dir.get(key) == (ex, cfg, fx) and '--redo' not in sys.argv:
            data[key] = OLD[key]; manifest.append(next(m for m in OLD_MANIFEST if m['key'] == key)); continue
        take = fnv(json.dumps([engine, 2, CAST[who], REF_TEXT.get(CAST[who].get('same', who)), ex, cfg, fx, spoken(text, False)]))
        dst = cache / f'{key}-{take}.mp3'
        ok = dst.with_suffix('.ok')
        if (ONLY is None or ONLY == who) and not ok.exists():
            # --max N: stop (exit 3) after N new lines, so a long session can restart the process before memory runs out
            RENDERED[0] += 1
            if MAX_NEW and RENDERED[0] > MAX_NEW: print('stopping after', MAX_NEW, 'new lines', flush=True); sys.exit(3)
            best = None
            for attempt in range(8):
                cand = dst if attempt == 0 else dst.with_name(f'{dst.stem}.t{attempt}.mp3')
                if not cand.exists():
                    e = ex if attempt < 3 or attempt >= 5 else max(0.3, ex - 0.3)
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
        data[key] = base64.b64encode(leveled(dst).read_bytes()).decode()
        manifest.append({'key': key, 'who': who, 'text': text, 'exaggeration': ex, 'cfg': cfg, 'fx': fx, 'take': dst.name})
    js = ('/* GENERATED by tools/voices.py: the cast\'s recorded lines, base64 MP3 keyed by fnv("who|text"). Do not edit. */\n'
          'const VO_DATA=' + json.dumps(data, separators=(',', ':')) + ';\n')
    (root / 'src/js/05-vodata.js').write_text(js)
    (root / 'tools/voices.json').write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
    print(len(data), 'lines,', len(js) // 1024, 'KB')

if __name__ == '__main__':
    main()
