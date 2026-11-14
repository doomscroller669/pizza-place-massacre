"""Stitch src/ into the single game page, game/pizza-place-massacre.html (the same file published as the Claude artifact),
then wrap it for the Android app (tools/build_index.py).
Usage: python3 tools/assemble.py"""
import pathlib, subprocess, sys
root = pathlib.Path(__file__).resolve().parent.parent
head = (root / 'src/head.html').read_text()
fonts = (root / 'src/fonts.css').read_text()
js = '\n'.join(p.read_text() for p in sorted((root / 'src/js').glob('*.js')))
page = ('<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n'
        '<style>:root{box-sizing:border-box}[hidden]:not([hidden=until-found i]){display:none!important}</style>\n'
        '<style>' + fonts + '</style>\n'
        + head +
        '\n<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n'
        '<script>\n(function(){\n' + js + '\n})();\n</script>\n</html>\n')
out = root / 'game/pizza-place-massacre.html'
out.write_text(page)
print('wrote', out, out.stat().st_size, 'bytes')
subprocess.run([sys.executable, str(root / 'tools/build_index.py'), str(out)], check=True)
