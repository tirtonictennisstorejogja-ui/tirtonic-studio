#!/usr/bin/env python3
"""Ekspor SEMUA data Firestore proyek tirtonic-studio ke satu file JSON (hanya membaca).

Pemakaian:  python3 tools/export-firebase.py <file-keluaran.json>
Memakai login Firebase CLI di laptop ini (~/.local/bin/firebase). Token tidak pernah dicetak.
Hasil: {"exportedAt": ms, "docs": {"items/abc": {...}, "pcal/x@y/events/z": {...}, ...}}
"""
import json, os, subprocess, sys, time, urllib.request, urllib.parse

PROJECT = "tirtonic-studio"
BASE = f"https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents"
TOP = ["members", "items", "photos", "tasks", "settings", "logs", "locks", "reports", "idcc", "public", "pcal"]

if len(sys.argv) != 2:
    sys.exit("Pakai: python3 tools/export-firebase.py <file-keluaran.json>")
# minta Firebase CLI memperbarui token aksesnya, lalu baca dari konfigurasinya
subprocess.run([os.path.expanduser("~/.local/bin/firebase"), "projects:list"], capture_output=True)
TOKEN = json.load(open(os.path.expanduser("~/.config/configstore/firebase-tools.json")))["tokens"]["access_token"]

def get(url):
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + TOKEN})
    with urllib.request.urlopen(req) as r:
        return json.load(r)

def val(v):
    k, x = next(iter(v.items()))
    if k in ("stringValue", "booleanValue", "timestampValue", "referenceValue", "bytesValue"):
        return x
    if k == "integerValue":
        return int(x)
    if k == "doubleValue":
        return float(x)
    if k == "nullValue":
        return None
    if k == "mapValue":
        return {kk: val(vv) for kk, vv in x.get("fields", {}).items()}
    if k == "arrayValue":
        return [val(i) for i in x.get("values", [])]
    if k == "geoPointValue":
        return x
    return x

def list_col(path):
    out, token = {}, ""
    while True:
        q = {"pageSize": "300"}
        if token:
            q["pageToken"] = token
        r = get(f"{BASE}/{path}?" + urllib.parse.urlencode(q))
        for d in r.get("documents", []):
            rel = d["name"].split("/documents/", 1)[1]
            out[rel] = {k: val(v) for k, v in d.get("fields", {}).items()}
        token = r.get("nextPageToken")
        if not token:
            return out

docs = {}
for col in TOP:
    got = list_col(col)
    docs.update(got)
    print(f"{col}: {len(got)}")
# subkoleksi kalender pribadi: pcal/{email}/events — juga untuk email yang hanya punya events
emails = {p.split("/")[1] for p in docs if p.startswith("members/") or p.startswith("pcal/")}
n = 0
for e in sorted(emails):
    got = list_col(f"pcal/{urllib.parse.quote(e, safe='@')}/events")
    docs.update(got)
    n += len(got)
print(f"pcal events: {n}")
with open(sys.argv[1], "w", encoding="utf-8") as f:
    json.dump({"exportedAt": int(time.time() * 1000), "project": PROJECT, "docs": docs}, f, ensure_ascii=False)
print("Tersimpan:", sys.argv[1], f"({len(docs)} dokumen)")
