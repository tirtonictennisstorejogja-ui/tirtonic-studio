#!/usr/bin/env python3
"""Hari pindah ke Tirtonichub — dijalankan Zaki di laptop ini:

    python3 tools/pindah-ke-hub.py

1. Mengunci Firebase jadi hanya-baca (firestore.freeze.rules), supaya tidak ada data baru tertinggal.
2. Ekspor terakhir semua data ke ~/Desktop/pindah-media/ekspor.json.
3. Membuat peta email (Gmail lama -> akun @tirtonichub.com) + anggota baru (Salma) dan PERINTAH-ALDO.txt.
Folder ~/Desktop/pindah-media lalu diberikan ke Aldo untuk diimpor di PC server.
Opsi --tanpa-kunci: lewati langkah 1 (hanya untuk uji).
"""
import json, os, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = pathlib.Path.home() / "Desktop" / "pindah-media"
PETA = {  # email lama -> email Tirtonichub (aldo.assadad sengaja tidak ikut: bukan tim media)
    "mzakiramadhan261003@gmail.com": "zaki@tirtonichub.com",
    "rayhanadinataputra13@gmail.com": "rayhan@tirtonichub.com",
    "ruminkvv@gmail.com": "aulia@tirtonichub.com",
    "salma@tirtonichub.com": "salma@tirtonichub.com",
}
BARU = {  # anggota media yang belum ada di Firebase
    "members/salma@tirtonichub.com": {"name": "Salma", "code": "S", "role": "member", "idcc": False, "email": "salma@tirtonichub.com"},
}
ADMIN = "zaki@tirtonichub.com"

OUT.mkdir(parents=True, exist_ok=True)
if "--tanpa-kunci" not in sys.argv:
    print("1/3 Mengunci media.tirtonichub.com (hanya-baca)…")
    r = subprocess.run([os.path.expanduser("~/.local/bin/firebase"), "deploy", "--only", "firestore:rules", "--config", "firebase.freeze.json"], cwd=ROOT)
    if r.returncode:
        sys.exit("Gagal mengunci Firebase. Tidak ada yang diubah; coba lagi.")
print("2/3 Ekspor data terakhir…")
r = subprocess.run([sys.executable, str(ROOT / "tools" / "export-firebase.py"), str(OUT / "ekspor.json")])
if r.returncode:
    sys.exit("Gagal ekspor.")
print("3/3 Menyiapkan peta email & perintah untuk Aldo…")
data = json.load(open(OUT / "ekspor.json", encoding="utf-8"))
for p, d in BARU.items():
    data["docs"].setdefault(p, d)
json.dump(data, open(OUT / "ekspor.json", "w", encoding="utf-8"), ensure_ascii=False)
json.dump(PETA, open(OUT / "peta.json", "w"), indent=2)
cmd = f"""PINDAH DATA MEDIA KE TIRTONICHUB — jalankan di PC server, di folder repo Tirtonichub (DEPLOY_DIR).
Salin dulu folder pindah-media ini ke PC, misalnya C:\\pindah-media

1) Salin file ke dalam container:
   docker compose cp C:\\pindah-media\\ekspor.json web:/tmp/ekspor.json
   docker compose cp C:\\pindah-media\\peta.json web:/tmp/peta.json

2) Uji dulu (tidak menulis apa pun):
   docker compose exec web node --import tsx prisma/studio-import.mts /tmp/ekspor.json /tmp/peta.json --dry-run --admin {ADMIN}

3) Kalau tidak ada "Akun Tirtonichub belum ada", jalankan impor:
   docker compose exec web node --import tsx prisma/studio-import.mts /tmp/ekspor.json /tmp/peta.json --admin {ADMIN}
   Harus muncul: "Selesai: ... dokumen ditulis, 0 gagal."  (aman diulang)

4) Buka https://tirtonichub.com/studio (dari HP pakai data seluler) dan cek bersama Zaki.
"""
(OUT / "PERINTAH-ALDO.txt").write_text(cmd, encoding="utf-8")
n = len(data["docs"])
print(f"Selesai. {n} dokumen siap di {OUT}. Berikan folder itu ke Aldo (PERINTAH-ALDO.txt).")
