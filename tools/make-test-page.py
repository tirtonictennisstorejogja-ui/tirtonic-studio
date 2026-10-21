#!/usr/bin/env python3
"""Buat salinan website untuk uji lokal tanpa Firebase asli.

Hasil: folder ./_test/ berisi index.html yang memakai tools/fake-firebase.js
(database tiruan di memori) dan tools/demo-seed.js (data contoh relatif ke hari ini).

Pakai:
    python3 tools/make-test-page.py
    python3 -m http.server 8765 --directory _test
    buka http://localhost:8765/            -> masuk sebagai Zaki (admin)
         http://localhost:8765/#rayhan     -> masuk sebagai Rayhan (anggota)
Folder _test/ jangan di-commit.
"""
import os, re, shutil
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
web = os.path.join(root, 'website')
out = os.path.join(root, '_test')
os.makedirs(out, exist_ok=True)
for f in os.listdir(web):
    if f not in ('index.html', 'config.js'):
        shutil.copy(os.path.join(web, f), os.path.join(out, f))
s = open(os.path.join(web, 'index.html'), encoding='utf-8').read()
s = re.sub(r'<script src="https://www.gstatic.com/firebasejs/[^"]+"></script>\n', '', s)
seed = open(os.path.join(root, 'tools', 'demo-seed.js'), encoding='utf-8').read()
fake = open(os.path.join(root, 'tools', 'fake-firebase.js'), encoding='utf-8').read()
cfg = 'window.MEDIA_DESK_CONFIG={firebase:{apiKey:"demo",authDomain:"demo",projectId:"demo"},adminEmails:["kepala@tirtonic.id"]};'
assert '<script src="config.js"></script>' in s, 'tag config.js tidak ditemukan di index.html'
s = s.replace('<script src="config.js"></script>', '<script>\n' + seed + '\n</script>\n<script>\n' + fake + '\n</script>\n<script>' + cfg + '</script>')
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(s)
print('OK ->', os.path.join(out, 'index.html'))
