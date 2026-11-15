"""Fabric textures for the cast's clothes, so the bodies read as real cloth next to the photo faces.

Woven from numbers, not generated: the image model only ever drew swirled drapes (and once a watermark), which tile
badly. Each fabric is a weave (twill, plain, jersey knit, denim or sheer nylon) with fibre noise, slub and soft
mottling, in the cloth's own colour, made to tile, and saved as tools/fabrics/<name>.jpg (128x128).
tools/faces_pack.py packs them into src/js/06-facedata.js; 50-chars.js paints collars, ties, buttons and cuffs over them.

Usage: python3 tools/fabrics.py
"""
import pathlib
import numpy as np
from PIL import Image

out = pathlib.Path(__file__).resolve().parent / 'fabrics'; out.mkdir(exist_ok=True)
N = 128
FABRIC = {   # name: (weave, colour, contrast)
    'suit_black':   ('twill',  (34, 34, 40),   1.0),
    'suit_grey':    ('twill',  (78, 78, 84),   0.9),
    'suit_dark':    ('twill',  (50, 50, 58),   0.9),
    'shirt_white':  ('plain',  (226, 222, 212), 0.55),
    'jersey_black': ('jersey', (28, 28, 31),   1.0),
    'shirt_red':    ('twill',  (172, 38, 28),  0.8),
    'denim_dark':   ('denim',  (40, 46, 64),   1.0),
    'stocking':     ('nylon',  (160, 128, 100), 0.7),
    'apron_black':  ('canvas', (30, 30, 30),   1.0),
}

def noise(rng, scale):
    """smooth, tiling value noise: random grid, upsampled with wrap-around cosine blending"""
    g = rng.random((scale, scale))
    x = np.linspace(0, scale, N, endpoint=False)
    i0 = np.floor(x).astype(int); f = x - i0; f = (1 - np.cos(f * np.pi)) / 2; i1 = (i0 + 1) % scale
    rows = g[i0][:, i0] * (1 - f)[None, :] + g[i0][:, i1] * f[None, :]
    rows2 = g[i1][:, i0] * (1 - f)[None, :] + g[i1][:, i1] * f[None, :]
    return rows * (1 - f)[:, None] + rows2 * f[:, None]

def weave(kind, rng):
    y, x = np.mgrid[0:N, 0:N]
    if kind == 'twill':     # diagonal ribs, 2 px apart, broken up a little
        w = np.sin((x + y) * np.pi / 2) * 0.5 + np.sin(x * np.pi) * 0.15
    elif kind == 'plain':   # a fine over-under grid
        w = (np.sin(x * np.pi) * np.sin(y * np.pi)) * 0.6
    elif kind == 'jersey':  # knit: little vertical V columns
        w = np.sin(x * np.pi / 1.5) * 0.4 + np.sin((y + (x % 3)) * np.pi / 1.5) * 0.25
    elif kind == 'denim':   # strong twill with white weft showing through
        w = np.sin((x - y) * np.pi / 2) * 0.7
    elif kind == 'nylon':   # sheer, almost no weave, a faint sheen
        w = np.sin(x * np.pi / 1.2) * 0.08
    else:                   # canvas: a coarse basket weave
        w = np.sign(np.sin(x * np.pi / 2)) * np.sign(np.sin(y * np.pi / 2)) * 0.35
    return w

def make(name):
    kind, col, k = FABRIC[name]
    rng = np.random.default_rng(sum(ord(c) * (i + 1) for i, c in enumerate(name)))   # the same cloth every run
    col = np.array(col, np.float32)
    w = weave(kind, rng)
    fibre = rng.normal(0, 1, (N, N)) * 0.35
    slub = (noise(rng, 32) - 0.5) * 0.8                    # uneven threads
    mottle = (noise(rng, 8) - 0.5) * 1.2 + (noise(rng, 4) - 0.5) * 0.8   # wear and shine, soft
    lum = (w * 0.6 + fibre + slub) * 7 * k + mottle * (5 if kind == 'plain' else 9)
    a = col[None, None, :] + lum[..., None] * (1 + col[None, None, :] / 255)
    if kind == 'denim':     # the white weft
        a += (np.clip(np.sin((np.mgrid[0:N, 0:N][1] + np.mgrid[0:N, 0:N][0]) * np.pi / 2), 0, 1) * 18)[..., None] * np.array([0.8, 0.85, 1.0])
    if kind == 'nylon':     # runs and dirt
        for _ in range(3):
            cx = rng.integers(0, N); L = rng.integers(20, 60); y0 = rng.integers(0, N)
            for yy in range(L): a[(y0 + yy) % N, cx % N] *= 0.82
        a *= (1 - np.clip((noise(rng, 6) - 0.6) * 0.6, 0, 0.1))[..., None]   # soft grime
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))

if __name__ == '__main__':
    for name in FABRIC:
        make(name).save(out / f'{name}.jpg', quality=90); print('ok', name)
