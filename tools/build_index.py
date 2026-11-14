"""Make the Android app's offline copy of the game page (the same file published as the Claude artifact).
Usage: python3 tools/build_index.py [game/pizza-place-massacre.html]
Writes app/src/main/assets/index.html, pointing at the bundled three.min.js instead of the CDN."""
import sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src_path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'game/pizza-place-massacre.html'
src = src_path.read_text()
cdn = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
assert cdn in src, 'three.js script tag not found'
src = src.replace(cdn, 'three.min.js')
out = root / 'app/src/main/assets/index.html'
out.write_text(src)
print('wrote', out, out.stat().st_size, 'bytes')
