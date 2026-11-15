"""Photo faces for the cast, Puppet Combo style: a fictional, photoreal face per character, laid flat on a low-poly head.

Each face is generated (nobody real) with Realistic Vision 5.1, a photoreal Stable Diffusion 1.5 model
(CreativeML OpenRAIL-M), sped up with the LCM LoRA so a face takes about a minute on a CPU.
Then, per character:
  neutral  -- the base portrait (txt2img), front-on, flat light, plain background
  fear / angry / sad -- the same face with a light img2img pass, so it stays the same person
Each image is aligned on the eyes (OpenCV's YuNet face detector), the plain background is keyed out and filled with
hair above and skin below, and the result is saved as a small JPEG atlas in tools/faces/<who>-<expr>.jpg, with the
eye and mouth positions in tools/faces/landmarks.json. Blinking and talking are drawn in the game from those positions.
tools/faces_pack.py packs them into src/js/06-facedata.js.

Usage: python3 tools/faces.py [who ...] [--expr neutral,talk,...] [--seed N]
Needs: pip install diffusers transformers peft opencv-python pillow rembg; YuNet's model file (see YUNET)
"""
import sys, pathlib, json
import numpy as np
from PIL import Image, ImageFilter

root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'tools' / 'faces'; out.mkdir(exist_ok=True)
args = [a for a in sys.argv[1:] if not a.startswith('--')]
EXPRS = (sys.argv[sys.argv.index('--expr') + 1].split(',') if '--expr' in sys.argv else ['neutral', 'fear', 'angry', 'sad'])
SEED = int(sys.argv[sys.argv.index('--seed') + 1]) if '--seed' in sys.argv else 0

# who they are, for the portrait. Fictional people; the Ramirez family dressed for a funeral.
FACE = {
    'dad': dict(seed=11, desc='45 year old Mexican-American man, short black hair, thick black mustache, light stubble, tired eyes, black suit jacket, white shirt'),
    'grandpa': dict(seed=21, desc='75 year old Mexican-American man, bald with thin white hair on the sides, bushy white eyebrows, wrinkled face, wire-rimmed glasses, grumpy, grey suit'),
    'uncle': dict(seed=31, desc='42 year old Mexican-American man, slicked-back black hair, heavy stubble, smug, black shirt, dark blazer, gold chain'),
    'alex': dict(seed=41, desc='12 year old Mexican-American boy, short black hair, round face, white dress shirt'),
    'ruben': dict(seed=51, desc='11 year old Mexican-American boy, messy black hair, black rectangular glasses, dark t-shirt'),
    'lucia': dict(seed=61, desc='16 year old Mexican-American girl, long black hair pulled back in a ponytail, dark eyes, black dress'),
    'manny': dict(seed=71, desc='38 year old Mexican-American man, short black hair, full short black beard, red work shirt, pizza cook'),
    # Toni: the stocking mask from Jordan's reference picture (tools/faces/toni-ref.jpg, kept out of git), cropped from its
    # left half. The detector can't read a mask, so the eyes and smile are marked by hand. His mask never changes, and the
    # back of his head takes the bare stocking at the neck, not the top band (that's his hat).
    'toni': dict(only='neutral', source='toni-ref.jpg', crop=(0, 0, 704, 768), back=[0.03, 0.1],
                 marks=dict(eyeR=[342.5, 177.5], eyeL=[421, 182.5], nose=[381.5, 215], mouthR=[322.5, 235], mouthL=[435, 240])),
}
EXPR = {
    'fear': ('terrified screaming face, eyes wide open in horror, eyebrows raised high, mouth wide open', 0.62),
    'angry': ('furious angry face, deeply furrowed brow, shouting, bared teeth', 0.6),
    'sad': ('grieving crying face, teary red eyes, eyebrows raised in the middle, frowning mouth', 0.58),
}
POS = 'RAW photo, close-up passport photo of a {desc}, head and shoulders, facing the camera straight on, {mood}, even flat lighting, plain light grey studio background, sharp focus, dslr, film grain'
NEG = 'cartoon, cgi, 3d render, painting, drawing, anime, deformed iris, deformed pupils, profile, tilted head, looking away, hat brim shadow, text, watermark, blurry, cropped head, extra eyes, bad anatomy'

_pipe = {}
def pipes():
    if _pipe: return _pipe['t2i'], _pipe['i2i']
    import torch
    from diffusers import StableDiffusionPipeline, StableDiffusionImg2ImgPipeline, LCMScheduler, AutoencoderKL
    torch.set_num_threads(2)
    vae = AutoencoderKL.from_pretrained('stabilityai/sd-vae-ft-mse')
    t2i = StableDiffusionPipeline.from_pretrained('SG161222/Realistic_Vision_V5.1_noVAE', vae=vae, safety_checker=None, requires_safety_checker=False)
    t2i.scheduler = LCMScheduler.from_config(t2i.scheduler.config)
    t2i.load_lora_weights('latent-consistency/lcm-lora-sdv1-5'); t2i.fuse_lora()
    t2i.set_progress_bar_config(disable=True); t2i.enable_attention_slicing(); t2i.vae.enable_slicing()
    i2i = StableDiffusionImg2ImgPipeline(**t2i.components); i2i.set_progress_bar_config(disable=True)
    _pipe.update(t2i=t2i, i2i=i2i); return t2i, i2i

def gen(who, expr):
    import torch
    t2i, i2i = pipes(); f = FACE[who]
    g = torch.Generator().manual_seed(f['seed'] + SEED * 1000)
    if expr == 'neutral':
        mood = 'neutral expression, mouth closed, eyes open looking at the camera'
        return t2i(f.get('prompt') or POS.format(desc=f['desc'], mood=mood), negative_prompt=NEG, num_inference_steps=7, guidance_scale=1.6,
                   width=512, height=576, generator=g).images[0]
    base = Image.open(out / f'{who}-neutral.png').convert('RGB')
    mood, strength = EXPR[expr]
    return i2i(POS.format(desc=f['desc'], mood=mood), image=base, negative_prompt=NEG, num_inference_steps=10, strength=strength,
               guidance_scale=1.6, generator=g).images[0]

# ---------- crop to the face, key out the background ----------
# The atlas is 256x256 and covers the head at one scale both ways (crown at the top, chin at the bottom):
# eyes 70 px apart, eye line at y=120. The head mesh's front projection uses the same layout (see 50-chars.js).
ATLAS, EYE_DIST, EYE_Y = 256, 70.0, 120.0
YUNET = pathlib.Path(__import__("os").environ.get("YUNET", "/home/claude/models/yunet.onnx"))   # opencv_zoo face_detection_yunet_2023mar.onnx
def landmarks(img):
    """eyes, nose and mouth corners of the biggest face, from OpenCV's YuNet detector"""
    import cv2
    a = np.array(img.convert('RGB'))[:, :, ::-1].copy()
    d = cv2.FaceDetectorYN.create(str(YUNET), '', (a.shape[1], a.shape[0]), 0.6)
    n, f = d.detect(a)
    if f is None or not len(f): return None
    f = max(f, key=lambda r: r[2] * r[3])
    return dict(eyeR=[float(f[4]), float(f[5])], eyeL=[float(f[6]), float(f[7])], nose=[float(f[8]), float(f[9])],
                mouthR=[float(f[10]), float(f[11])], mouthL=[float(f[12]), float(f[13])])

def transform(lm):
    """similarity transform (scale, rotation, shift) from the photo to the atlas: eyes level, 70 px apart, centred"""
    e0, e1 = np.array(lm['eyeR']), np.array(lm['eyeL'])
    c = (e0 + e1) / 2; v = e1 - e0
    sc = EYE_DIST / np.linalg.norm(v); ang = np.arctan2(v[1], v[0])
    ca, sa = np.cos(-ang) * sc, np.sin(-ang) * sc
    M = np.array([[ca, -sa, 0], [sa, ca, 0]])
    M[:, 2] = np.array([ATLAS / 2, EYE_Y]) - M[:, :2] @ c
    return M

_seg = None
def person_mask(img):
    """1 where the person is, from rembg's u2net human-segmentation model"""
    global _seg
    from rembg import remove, new_session
    if _seg is None: _seg = new_session('u2net_human_seg')
    return np.array(remove(img, session=_seg, only_mask=True)).astype(np.float32) / 255

def atlas(who, expr, img, M):
    import cv2
    a = cv2.warpAffine(np.array(img.convert('RGB')), M, (ATLAS, ATLAS), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REPLICATE)
    m = cv2.warpAffine(person_mask(img), M, (ATLAS, ATLAS), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    # the backdrop is painted over by stretching each row's outermost hair or skin sideways (and the top row of hair
    # upward), the way a side view would smear on a PS1 head
    keep = m > 0.5; f = a.copy(); rows = [y for y in range(ATLAS) if keep[y].sum() > 4]
    for y in range(ATLAS):
        yy = min(rows, key=lambda r: abs(r - y)) if rows else y
        xs = np.nonzero(keep[yy])[0]
        if not len(xs): continue
        l, r = xs[0] + 2, xs[-1] - 2
        row = a[yy].copy()
        if yy != y: f[y] = row
        f[y, :l] = row[l]; f[y, r + 1:] = row[r]
        if yy != y: f[y, l:r + 1] = row[l:r + 1]
    soft = cv2.GaussianBlur(f, (7, 7), 0)
    w = cv2.GaussianBlur(keep.astype(np.float32), (5, 5), 0)[..., None]
    a = (a * w + soft * (1 - w)).astype(np.uint8)
    res = Image.fromarray(a)
    res.save(out / f'{who}-{expr}.jpg', quality=88)
    return res

def head_guess(img):
    """where the eyes and mouth would be, from the cut-out head alone (for a masked face the detector can't read)"""
    m = person_mask(img) > 0.5
    rows = np.nonzero(m.any(axis=1))[0]; top = rows[0]
    # head width: the cut-out's width a third of the way down the head
    yw = int(top + 0.33 * (rows[-1] - top) * 0.6); xs = np.nonzero(m[yw])[0]; w = xs[-1] - xs[0]; cx = (xs[0] + xs[-1]) / 2
    ey = top + w * 0.72; ed = w * 0.42; my = ey + w * 0.55
    return dict(eyeR=[cx - ed / 2, ey], eyeL=[cx + ed / 2, ey], nose=[cx, ey + w * 0.3], mouthR=[cx - w * 0.2, my], mouthL=[cx + w * 0.2, my])

def atlas_landmarks(lm, M):
    return {k: [round(float(v), 1) for v in (M[:, :2] @ np.array(p) + M[:, 2])] for k, p in lm.items()}

if __name__ == '__main__':
    import gc
    who_list = args or list(FACE)
    # 1: generate what's missing (the image model alone takes most of the memory, so it goes before the rest)
    for who in who_list:
        for expr in EXPRS:
            if FACE[who].get('only') and expr != FACE[who]['only']: continue
            png = out / f'{who}-{expr}.png'
            if not png.exists() and FACE[who].get('source'):
                Image.open(out / FACE[who]['source']).convert('RGB').crop(FACE[who]['crop']).save(png); continue
            if not png.exists():
                print('generating', who, expr, flush=True); gen(who, expr).save(png); gc.collect()
    _pipe.clear(); gc.collect()
    # 2: align, cut out and save the atlases
    lf = out / 'landmarks.json'
    marks = json.loads(lf.read_text()) if lf.exists() else {}
    for who in who_list:
        img = Image.open(out / f'{who}-neutral.png').convert('RGB'); lm = FACE[who].get('marks') or landmarks(img)
        if lm is None: lm = head_guess(img); print('  no face found for', who, '- placing it from the cut-out head')
        # every expression uses the neutral face's alignment, so the face doesn't jump between frames
        M = transform(lm); marks[who] = atlas_landmarks(lm, M)
        if FACE[who].get('back'): marks[who]['back'] = FACE[who]['back']
        for expr in EXPRS:
            if not (out / f'{who}-{expr}.png').exists(): continue
            atlas(who, expr, Image.open(out / f'{who}-{expr}.png').convert('RGB'), M); print('  ok', who, expr, flush=True)
    lf.write_text(json.dumps(marks, indent=1))
