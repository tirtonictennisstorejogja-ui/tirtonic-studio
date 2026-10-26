# CLAUDE.md — Tirtonic Studio

Panduan untuk Claude Code saat mengerjakan repo ini. Baca seluruh file ini sebelum mengubah kode.
Pemilik proyek: **Zaki** (kepala media / admin). Bahasa komunikasi dan seluruh teks di website: **Bahasa Indonesia** yang santai-profesional. Pengguna bukan programmer: jelaskan hasil dengan bahasa sederhana, tanpa istilah teknis yang tidak perlu.

## 1. Apa ini

Tirtonic Studio adalah website internal tim media **Tirtonic Tennis Store (Yogyakarta)** untuk mengelola produksi konten Instagram: barang masuk → produksi (foto/video) → editing → siap → tayang. Website ini dipakai setiap hari oleh 4 orang di laptop dan HP.

Alamat utama: `https://media.tirtonichub.com` → **Firebase Hosting** proyek `tirtonic-studio` (juga `https://tirtonic-studio.web.app`; `studio.tirtonichub.com` sempat disiapkan tetapi sertifikat HTTPS-nya belum jadi, jadi dipakai `media`). Alamat baru harus ditambahkan di Firebase → Authentication → Authorized domains agar login Google jalan. Hosting otomatis dari GitHub: setiap push ke `main` yang mengubah `website/**` atau `firebase.json` menjalankan `.github/workflows/firebase-hosting-merge.yml` (GitHub Actions) yang memasang folder `website` ke Firebase Hosting (kunci layanan ada di GitHub Secrets `FIREBASE_SERVICE_ACCOUNT_TIRTONIC_STUDIO`, jangan pernah di repo). Lihat hasilnya di tab Actions repo. Cadangan manual: `~/.local/bin/firebase deploy --only hosting` (aturan cache di `firebase.json`). Perubahan `firestore.rules` TIDAK ikut otomatis (lihat §6). Netlify (`mediadesk-tirtonic.netlify.app`) tidak dipakai lagi (kreditnya habis Oktober 2026). Fungsi AI (`/api/idcc-ai`) **tidak aktif** di Firebase Hosting (paket Spark tanpa Cloud Functions); Zaki menunda AI dan berencana memakai n8n untuk Analisis IDCC. Kode fungsi tetap di `lib/` + `functions/` (siap untuk Cloudflare Pages) dan `netlify/`. DNS domain tirtonichub.com dikelola di AntMedia Host.

## 2. Tim dan aturan kerja (dipakai oleh mesin penjadwalan)

| Kode | Nama | Peran utama | Libur |
|---|---|---|---|
| Z | Zaki | Admin, planning, cek file, upload/penjadwalan Meta, editor video produk & katalog, talent cadangan | Kamis |
| R | Rayhan | Foto katalog & IG, syuting video produk, editor review/IG | Selasa, Kamis |
| A | Aulia | Syuting review/event/IDCC, analis IDCC, penulis skrip | Kamis, Jumat |
| S | Salma | Talent foto IG, video produk & review, penulis skrip | Kamis, Jumat |

- Jam kerja: 10.00–11.30 dan 13.00–15.00. Kamis seluruh tim libur (`isOff`), konten tetap tayang lewat penjadwalan.
- Kapasitas per hari: `SHOOT_CAP`, `EDIT_CAP` (jam per orang), `TYPE_CAP` (konten per jenis), durasi `SHOOT_H` / `EDIT_H`. Libur per orang: `OFF`.
- Jobdesk utama + pengganti: `DEFAULT_JOB` (bisa diubah admin di tab Panduan, tersimpan di `settings/main.jobdesk`, dibaca lewat `job(type)`).
- **Louis2 (pembaruan dari Louis1, ready oriented, sejak 26 Okt 2026)**: kode EX/LS/JP+/JP dari Louis1 tetap dipakai. Setiap konten barang baru punya tanggal wajib Ready `readyBy` (= `due`) berupa **jangka waktu** (bukan hari tetap) dalam hari kalender sejak hari barang datang menurut jam datang (sebelum/sesudah 15.00, `items.arrivedAfter15`, formulir `#fTime`) dan kode Louis1, tabel `L2_R` (urutan EX, LS, JP+, JP):
  - Sebelum 15.00: katalog H · Foto IG H+1/1/2/3 · Video produk H+2/2/3/5 · Video review H+3/3/4/4.
  - Sesudah 15.00: katalog H+1 · Foto IG H+2/2/4/6 · Video produk H+3/3/4/4 · Video review H+5/5/6/6.
  - Saat kapasitas bentrok, urutan prioritas tetap EX → LS → JP+ (stok >10) → JP (`prioOf` di penyeimbang).
  - `planBatch` menjadwalkan syuting/edit supaya selesai ≤ R (`l2Ready`, `l2Start`); JP+/JP mulai paling cepat 1 hari kerja sebelum R. **Tanggal tayang tidak diisi otomatis** (`postAt` kosong): admin menarik konten Ready ke Kalender tayang di Content Queue.
- Jenis konten (`TYPES`): `ktl` katalog, `igf` foto IG, `vpr` video produk, `vrv` video review, `idf` foto IDCC, `idc` video IDCC, `evt` event, `khs` khusus, `cmp` campaign. Yang tayang di IG: `POSTED`.
- Kategori: sepatu, raket, tas, baju, celana, aksesoris, lainnya (`CATS`, `CATLBL`). Sepatu/baju/celana punya gender ukuran Men/Women/Unisex (`GENDER_CATS`).

### Jadwal tayang Instagram
- 4 slot per hari: **09.00 foto, 12.00 video, 15.00 foto, 18.00 video** (`SLOT_TIMES`, `CAP={foto:2,video:2}`).
- Video slot boleh jenis apa pun. **Pengacak variasi**: `findSlot`/`pickPost` menghindari jenis video yang sama dua kali sehari (boleh geser ≤3 hari), dan `dayPlan(d)` menyusun jam supaya jam yang sama tidak diisi jenis/kategori yang sama seperti 1–2 hari sebelumnya. `timeOf(t)` mengembalikan jam tayang. Jam yang sudah dikunci (`postTime`) tidak diacak.
- Event: video payday tayang tgl 23 (untuk gajian tgl 25), tanggal kembar (11.11 dst.) tayang H-2. IDCC: 1 slot video per minggu (bawaan Rabu, `settings.idccDay`). Event/IDCC memakai satu slot video hari itu.

### Tahap Workflow Hub (status konten)
`STAGES = Terdata → Diproduksi → Editing → Ready → Tayang`
- **Terdata**: tercatat, masuk pantauan. **Diproduksi**: sedang syuting. **Editing**. **Ready**: file final sudah di Google Drive (`driveUrl` wajib untuk jenis yang tayang). **Tayang**: sudah di Instagram.
- Di tahap Ready, Zaki menandai `checked` (Dicek Zaki), membuat caption, lalu menjadwalkan di Meta Business Suite secara manual dan menekan "Sudah dijadwalkan di Meta" di **Detail kartu** (`metaHtml`, klik ditangani `metaAction`; `metaAt`, `postTime`). Antrian upload Meta di Kalender sudah dihapus (v5.5). `maintainStatuses()` (berjalan di akun admin) memindahkan ke Tayang otomatis setelah jam tayang lewat.
- Status lama (sebelum v5.2) dipetakan oleh `OLD_STATUS` di `splitTasks()`; jangan hapus pemetaan ini.
- Anggota hanya boleh memindahkan sampai Ready (`MEMBER_STAGES`), tidak boleh mengubah kartu yang sudah `metaAt`.
- Deadline per orang: `deadlinesOf(t)` / `deadlineFor(t)` (tulisan merah di kartu). Deadline Ready: `fileDue(t)` = `readyBy` (Louis2); konten lama tanpa `readyBy` = 2 hari kerja sebelum `postAt`. Tampil sebagai "Deadline Ready" di kartu dan Watchlist sampai Ready.
- Konten hangus 1 bulan setelah dibuat (`expiryOf`, `isExpired`), tetap bisa dilihat sebagai arsip.

## 3. Struktur repo

```
website/index.html            Seluruh aplikasi: HTML + CSS + JS dalam SATU file (tanpa build, tanpa framework)
website/config.js             Konfigurasi Firebase (apiKey Firebase memang publik) + adminEmails
website/logo.png, favicon*, apple-touch-icon.png, icon-*.png, manifest.webmanifest
lib/idcc-ai.mjs               Logika fungsi server AI (Claude API): mode nilai/ringkas (Analisis IDCC) dan caption; `handle(req, env)`
functions/api/idcc-ai.js      Pintu masuk Cloudflare Pages Functions → POST /api/idcc-ai
netlify/functions/idcc-ai.mjs Pintu masuk Netlify (cadangan) → lib/idcc-ai.mjs
netlify.toml                  Konfigurasi Netlify (cadangan): publish = "website", /api/* → fungsi
firestore.rules               Aturan keamanan Firestore (TIDAK otomatis terpasang saat push, lihat §6)
firebase.json, .firebaserc    Konfigurasi Firebase CLI (hanya untuk Publish rules ke proyek tirtonic-studio)
tools/                        Alat uji lokal (fake Firebase + data contoh), tidak dipakai produksi
PANDUAN.md                    Panduan untuk manusia (pemasangan & pemakaian)
```

### Peta kode index.html (cari dengan nama fungsi)
- Masuk & peran: `boot`, `start`, `applyRole`, `showLogin`, `loginReveal` (animasi login).
- Navigasi: `setTab` (panel `p-home`, `p-masuk` = Barang, `p-pipeline` = Workflow Hub, `p-queue` = Content Queue (grafik `#hStats`, lalu `.qgrid`: Kalender tayang `#qCal` + Watchlist semua barang `#genWatch` di kiri, Konten ready `#qrList` di kanan; `renderQueue`, tarik-lepas `data-qtid` → `openSched` dialog `#sdlg` pilih tanggal & jam (`SLOT_TIMES` atau jam lain) → `postAt`/`postTime`; tombol Jadwalkan untuk HP; saran tayang `suggOf` = tanggal R; hanya `S.isAdmin` yang bisa menjadwalkan), `p-kalender` = Kalender (kalender pribadi `#pcalSec` di atas, kalender produksi & tayang `#homeCal` di bawah), `p-idcc`, `p-jumat` = Laporan Admin, `p-panduan`, `p-tim`), menu `nav.tabs` disembunyikan tetapi tetap di DOM (dipakai `setTab`, `applyRole`, `cntOpen`). Yang terlihat: menu kotak di Beranda (`renderHomeMenu`, `#hMenu`) dan **kolom ikon kiri** `#lRail` (`renderRail`, `railSync`; selalu tampil di halaman selain Beranda, di Beranda muncul halus saat `#hMenu` ter-scroll lewat, kelas `body.railon`; di HP ≤820px menjadi bilah mendatar di bawah judul). `#hMenu` berjalan pelan kiri↔kanan (berhenti saat disentuh/kursor), tombol `#hMenuPrev`/`#hMenuNext`. Tombol **Kembali** `#backBtn` di semua halaman selain Beranda (`S.hist`, `goBack`, `history.pushState`). `#homeCal` dipindah oleh `setTab` antara `#calSlotHome` (Beranda, di bawah Jadwal tayang hari ini) dan `#calSlotKal`. Logo `#goHome` kembali ke Beranda. Profil, Tampilan, Keluar di tombol avatar kanan atas (`#prof` → `#profPop`).
- Kalender (produksi/tayang `renderCal`, pribadi `renderPcal`): isi kotak tanggal berupa pil berwarna `cpill(cls,ic,txt,plan,pre,sty)` (dot/ikon + keterangan; di HP ≤640px hanya dot). Workflow Hub: kolom Terdata dikelompokkan per tanggal produksi `terdataGroups` (`details.kgrp`, status buka-tutup `S.kOpen`). Watchlist saya per jenis bisa dibuka-tutup (`details.wtype`, localStorage `ts-wopen`). Kartu Content Queue menampilkan stok barang (`.wstock`). Tombol Kembali menempel (sticky) saat scroll. Semua konfirmasi hapus memakai dialog tengah layar berlatar buram `confirmDlg(msg)` (Ya/Tidak, `#cdlg`). Detail hari di Beranda: Rencana syuting & Rencana editing kanan-kiri (`.dsplit`, `.dcat`); "Batas siap hari ini" dihapus.
- Render: `renderAll`, `renderHome`, `renderWatch` (+ `watchGroups`, `watchTile`), `renderBoard` + `cardInner` (kartu kanban), `renderCal`, `renderDay`, `renderItems`, `renderReports`, `renderTeam`, `renderWeeks`.
- **Louis1** (kode barang, `items.tier` = `EX` Eksklusif Produk / `LS` Limited Stock / `JP` Jumlah Produk, plus `items.seasonal`): semua kode mendapat konten lengkap `L1_TYPES` (ktl+igf+vpr+vrv); bedanya urutan & jarak jadwal, `rankOfItem` (EX 0, LS 1, JP stok >10 = JP+ 2, JP 3), `rankOfTask`, `prioOf` (peringkat × 20). EX/LS boleh memakai jam & slot milik JP (`bumpable`, `slotUse(skip)`, `capState(skip)`); penyeimbang langkah 4 menggeser JP dari hari yang kelebihan slot. JP tidak digeser melewati 7 (JP+) / 10 (JP) hari kerja sejak datang (`JP_WAIT`, `jpAtLimit`), kecuali ada EX/LS musiman yang belum tayang (`seasonalActive`). EX/LS: file final siap H-1 sebelum tayang (`postGap`). JP stok ≤10: Foto IG/Video produk/Video review syuting mulai H+3 dan tayang paling cepat H+5 hari kerja (`JP_LOW`), tidak menggeser jadwal lain. Ubah kode: pilihan cepat `[data-act="tier"]` di kartu Daftar barang atau Edit kartu → `reTier` menambah konten yang belum ada dan menghitung ulang jadwal igf/vpr/vrv yang masih Terdata (tidak dikunci, belum Meta) mulai hari ini (`planBatch(rows,base,order,excl)`). Kode terlihat di Daftar barang dan kartu Content Queue (`louisChip`); hanya admin penuh yang memberi/mengubah kode (formulir `#fTier`, edit kartu; Admin 2 otomatis JP; dijaga juga di `firestore.rules`). Barang lama tanpa kode = JP; `hot` tetap diisi (tier ≠ JP) untuk laporan.
- Penjadwalan: `planBatch` (barang baru), `planOld` (stok lama/IDCC), `scheduleShoot`, `scheduleEdit`, `capState`, `slotUse`, `findSlot`, `pickPost`, `pickIdcc`, `dayPlan`, penyeimbang otomatis `computeBalance` / `runBalance` / `queueBalance`.
- Tab Barang (`p-masuk`): pilihan `#itemView` 1. Barang masuk (`#inView`) / 2. Daftar barang (`#listView`). Formulir Catat barang wajib lengkap termasuk foto (`itemFormMissing`, `checkItemForm`). Kartu barang bisa diedit (`itemEditHtml`, draf di `S.editItem`; ganti nama/kategori ikut memperbarui `title`/`cat` tugasnya). Daftar barang: filter kategori `S.iCat` → merek `S.iBrand` (`brandOf` = kata pertama nama, `BRAND2` untuk merek dua kata), urutan `S.iSort` (nama A–Z dengan pemisah huruf, tanggal datang, stok), `renderItemFilters`, kartu `itemCardHtml`.
- Animasi scroll seluruh situs: `RV_SEL` + `rvIO` (IntersectionObserver) memberi kelas `.rv`/`.rv-in` (fade in saat masuk layar, fade out saat keluar); mati otomatis bila prefers-reduced-motion.
- Data: `newTask`, `saveItem`, `setStatus`, `fileName` (format nama file), foto `makePhoto`/`savePhoto`/`thumbHtml`.
- AI: `aiCall` → `/api/idcc-ai`; PDF finance dibaca di browser dengan pdf.js (`parseAccurate`, `aggregate`); caption `fillTemplate` + `settings.captionTemplate`.
- Tema tampilan per perangkat: `applyTheme`, `THEMES` (localStorage `ts-theme`; daftar juga di skrip kepala halaman). 10 tema: Terang, Gelap, Glass, Gradasi, Midnight, Ocean, Sunset, Candy, Forest, Aurora (5 terakhir berlatar animasi `skinDrift`).
- Beranda: sapaan = judul + ringkasan pribadi `#hMe` (tugas sekarang, deadline hari ini, terlambat, "Berikutnya"), menu kotak `renderHomeMenu`, Watchlist saya dikelompokkan per jenis konten (`#mGrid .wtype`), Jadwal tayang hari ini, Kalender produksi & tayang. Grafik dan Watchlist semua barang ada di Content Queue. Mode TV sudah dihapus.
- Kalender pribadi (`renderPcal`, `renderPcDay`, `pcListen`): hanya pemiliknya, data di `pcal/{email}` (warna kalender) dan `pcal/{email}/events` (date, title, time, color, note); warna dari `AV_COLORS`. Aturan: `firestore.rules` match `/pcal/{email}` (admin pun tidak bisa baca).
- Foto barang dipotong potret 2:3 (`PHOTO_R`, `toJpeg(img,max,q,r)`); bingkai `.ph` mengikuti 2:3.
- Bahasa per perangkat (`LANG`, localStorage `ts-lang`, pilihan di panel avatar): mode Inggris menerjemahkan teks tampilan lewat kamus `I18N_EN` + `MutationObserver` (kunci memakai {n} angka, {d} tanggal, {p} nama, {e} email, {m} bulan). **Setiap menambah/mengubah teks tampilan, tambahkan terjemahannya di `I18N_EN`.** Data tim tidak diterjemahkan (`I18N_SKIP`), pesan WhatsApp selalu bahasa Indonesia (`inID`).
- Profil (klik avatar di menu): `profPop`, `renderProfPop`, `avSave`, `avInner`; foto profil kecil `avPhoto` (JPEG ≤60 KB), avatar hewan beranimasi `AV_ANIMALS` → `avAnimal`, warna `AV_COLORS` → `avColor` (semua di `members/{email}`; daftar nilai harus sama dengan `firestore.rules`). Catatan pribadi `#pNotes` tersimpan otomatis di `pcal/{email}.notes` (`pcSaveDoc`, selalu kirim color+notes+updatedAt).
- Peran: `member`, `admin2` (Admin 2: seperti admin tanpa Laporan Admin & Tim & Aktivitas, Workflow Hub hanya kontennya sendiri; `S.isAdmin2`, `S.full` = admin penuh; rules `isStaff()`), `admin`.

### Firestore (koleksi)
`members/{email}` (name, code, role, idcc, phone, avColor/avAnimal/avPhoto — satu-satunya isian yang boleh diubah pemiliknya sendiri) · `pcal/{email}` (color, notes) + `pcal/{email}/events` (kalender pribadi & catatan, hanya pemilik) · `items` · `photos/{itemId}` · `tasks` · `settings/main` · `logs/balance` · `locks` · `reports` · `idcc` · `public/login` (gambar latar login, dibaca sebelum login).

## 4. Aturan penting (jangan dilanggar)

1. **Jangan pernah menaruh rahasia di repo**: kunci API Anthropic hanya di variabel hosting `ANTHROPIC_API_KEY` (Cloudflare Pages → Settings → Variables and Secrets, tipe Secret). Jangan minta pengguna menempelkan kunci di chat.
2. **Hak akses dijaga di dua tempat**: tampilan (`applyRole`, `S.isAdmin`, `mine(t)`) DAN `firestore.rules`. Setiap perubahan siapa-boleh-apa harus mengubah keduanya, lalu ingatkan pengguna untuk **Publish** rules di Firebase Console.
3. Tetap satu file `index.html`, tanpa build step, tanpa framework. Library eksternal hanya bila benar perlu (sekarang: Firebase compat 10.12.2 dari gstatic, pdf.js 3.11.174 dari cdnjs, Google Fonts Plus Jakarta Sans).
4. Pertahankan gaya visual: token warna di `:root` (navy `--navy`, lime `--ball`, warna tahap `--st-1..5`, warna jenis `--t-*`), mode gelap, 10 tema. Semua warna lewat token, bukan warna literal yang hanya cocok di satu tema.
5. Harus nyaman di **HP** (lebar ~390px) dan laptop: tidak boleh ada scroll menyamping di halaman.
6. Data anggota tim adalah data nyata. Jangan menghapus atau menulis ulang data massal tanpa persetujuan Zaki. Migrasi data harus aman dijalankan berulang.
7. Teks yang terlihat pengguna: Bahasa Indonesia, singkat, jelas. Nama menu: Beranda, Barang, Workflow Hub, Content Queue, Kalender, Analisis IDCC, Laporan Admin, Panduan, Tim & Aktivitas.

## 5. Cara menguji sebelum commit

```bash
python3 tools/make-test-page.py                      # membuat _test/ dengan Firebase tiruan + data contoh
python3 -m http.server 8765 --directory _test        # buka http://localhost:8765/ (Zaki) atau /#rayhan, /#aulia, /#salma
```
- `tools/fake-firebase.js` meniru Firebase di memori dan **mencatat pelanggaran aturan** di `window.__VIOLATIONS` (tiruan dari firestore.rules; perbarui juga bila rules berubah).
- Cek minimal: tidak ada error di console, tidak ada scroll menyamping di 390px dan 1366px, mode terang & gelap, sebagai admin, Admin 2 (Aulia di data contoh), dan anggota.
- Cek sintaks fungsi: `~/.local/node/bin/node --check lib/idcc-ai.mjs` (Node.js terpasang di `~/.local/node`). Simulasi Cloudflare Pages lengkap dengan fungsi AI: `npx wrangler@4 pages dev website --port 8788` (folder `.wrangler/` jangan di-commit).
- Jangan commit folder `_test/`.

## 6. Yang tidak bisa dilakukan dari repo (harus dikerjakan pengguna)

- **Publish `firestore.rules`**: setiap kali file ini berubah. Di laptop Zaki bisa dari Claude Code (minta izin Zaki dulu): `~/.local/bin/firebase deploy --only firestore:rules --dry-run` untuk cek, lalu tanpa `--dry-run` untuk Publish (Firebase CLI sudah login sebagai pemilik proyek). Cara manual: Firebase Console → Firestore Database → Rules → tempel → Publish.
- Custom domain di Firebase Console → Hosting, catatan DNS (CNAME) di AntMedia (cPanel → Zone Editor, bukan menu DNS Management di Client Area), dan Authorized domains di Firebase Authentication. Kunci AI (`ANTHROPIC_API_KEY`) hanya diperlukan bila fungsi AI dijalankan lagi di hosting yang mendukung fungsi server.
- Akun tim dan izin IDCC diatur di website (Tim & Aktivitas), bukan di kode.

## 7. Rencana / ide yang pernah dibahas

- n8n untuk otomasi terjadwal (WhatsApp planning Jumat 16.00, deteksi file baru di Google Drive → Ready). AI website tetap lewat fungsi server (`/api/idcc-ai`).
- Upload otomatis ke Instagram lewat Meta API sengaja TIDAK dibuat; alurnya manual lewat Meta Business Suite dengan bantuan "Antrian upload".
