#!/usr/bin/env python3
"""Salin UI Tirtonic Studio ke repo Tirtonichub (public/studio/), mode backend 'hub'.

Pemakaian:  python3 tools/build-hub.py ~/Tirtonichub
- index.html: tanpa skrip Firebase, ditambah <base href="/studio/"> supaya aset relatif tetap benar.
- config.js : {backend:'hub'} (login, absen, dan data lewat /api/studio di Tirtonichub).
- ikon & logo ikut disalin; manifest ditulis ulang untuk /studio/ (ikon layar utama membuka Studio,
  bukan Beranda Tirtonichub). Versi Firebase (website/manifest.webmanifest) tidak berubah.
"""
import json, pathlib, re, shutil, sys

src = pathlib.Path(__file__).resolve().parent.parent / "website"
if len(sys.argv) != 2:
    sys.exit("Pakai: python3 tools/build-hub.py <folder repo Tirtonichub>")
dst = pathlib.Path(sys.argv[1]).expanduser() / "public" / "studio"
dst.mkdir(parents=True, exist_ok=True)

html = (src / "index.html").read_text(encoding="utf-8")
html, n = re.subn(r'<script src="https://www\.gstatic\.com/firebasejs/[^"]+"></script>\n?', "", html)
assert n >= 1, "skrip Firebase tidak ditemukan"
assert html.count("<head>") == 1
html = html.replace("<head>", '<head>\n<base href="/studio/">', 1)
(dst / "index.html").write_text(html, encoding="utf-8")
(dst / "config.js").write_text(
    "// Dibuat oleh tools/build-hub.py di repo tirtonic-studio. Jangan diedit di sini.\n"
    "window.MEDIA_DESK_CONFIG = { backend: 'hub' };\n", encoding="utf-8")
for f in src.iterdir():
    if f.suffix in {".png", ".ico", ".webmanifest", ".svg"}:
        shutil.copy2(f, dst / f.name)
print("UI disalin ke", dst)
man = json.loads((src / "manifest.webmanifest").read_text(encoding="utf-8"))
man.update({"id": "/studio/", "start_url": "/studio/", "scope": "/studio/"})
(dst / "manifest.webmanifest").write_text(json.dumps(man, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Manifest hub: start_url & scope = /studio/")
