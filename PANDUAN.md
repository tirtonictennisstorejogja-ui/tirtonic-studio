# Panduan Tirtonic Studio

Panduan untuk tim: cara memasang, memperbarui, dan memakai website Tirtonic Studio.
Alamat website: **media.tirtonichub.com** (hosting Firebase Hosting, cadangan: tirtonic-studio.web.app)

## Isi repo

| Folder / file | Fungsi |
|---|---|
| `website/` | Website (index.html, config.js, logo, ikon) |
| `lib/idcc-ai.mjs`, `functions/` | Penghubung ke AI (Analisis IDCC dan caption Instagram). Kunci API disimpan di Cloudflare, tidak pernah di repo |
| `netlify/`, `netlify.toml` | Pengaturan hosting lama (Netlify), disimpan sebagai cadangan |
| `firestore.rules` | Aturan keamanan database (dipasang manual di Firebase) |
| `tools/` | Alat uji coba lokal dengan data contoh, tidak dipakai website asli |
| `CLAUDE.md` | Penjelasan proyek untuk Claude Code |
| `PANDUAN.md` | File ini |

---

## Memperbarui website

Website tayang dari **Firebase Hosting** (proyek tirtonic-studio) dan **otomatis diperbarui** setiap ada perubahan di folder `website` pada branch `main` GitHub (manual atau oleh Claude Code), biasanya dalam 1–2 menit. Cek di GitHub → tab **Actions** (centang hijau = berhasil) atau Firebase Console → Hosting → riwayat rilis. Aturan database (`firestore.rules`) tetap dipasang terpisah.

**Unggah manual:** buka folder tujuan di GitHub → **Add file → Upload files** → **choose your files** → **Commit changes**. File bernama sama otomatis ditimpa. Pastikan nama file tepat (misalnya `index.html`, bukan `index 2.html`).

**Setiap kali `firestore.rules` berubah**, pasang juga di Firebase:
Firebase Console → proyek **tirtonic-studio** → **Firestore Database → Rules** → hapus isi lama → tempel isi baru → **Publish**.
Di laptop Zaki, Claude Code juga bisa mem-Publish-nya langsung (Firebase CLI sudah login); cukup minta "publish firestore.rules".

## Pemasangan awal (sudah dilakukan, untuk referensi)

1. **Firebase**: proyek `tirtonic-studio`, login Google aktif, Firestore dibuat, `firestore.rules` di-Publish, domain website ada di Authentication → Settings → Authorized domains.
2. **GitHub**: repo Private `tirtonic-studio` berisi folder dan file di atas.
3. **Firebase Hosting**: website dipasang dari folder `website` ke proyek `tirtonic-studio` (otomatis lewat GitHub Actions, pengaturan di `firebase.json`). Domain **media.tirtonichub.com** ditambahkan di Firebase Console → Hosting → Add custom domain, lalu catatan **CNAME** `media` → `tirtonic-studio.web.app` dipasang di AntMedia lewat **cPanel → Zone Editor**, dan domainnya didaftarkan di Firebase → Authentication → Settings → Authorized domains.
4. **Kunci AI** (ditunda): fitur AI butuh hosting dengan fungsi server (misalnya Cloudflare Pages, kodenya sudah siap di `lib/` dan `functions/`) dan kunci `ANTHROPIC_API_KEY` dari console.anthropic.com yang disimpan di pengaturan hosting tersebut. **Jangan tempel kunci di chat, file, atau GitHub.**
5. **Akun tim**: login sebagai Zaki → Tim & Aktivitas → Akun tim. Centang **Boleh memakai Analisis IDCC** untuk Aulia.

---

## Menu

| Menu | Isi | Admin (Zaki) | Aulia (Admin 2) | Rayhan, Salma |
|---|---|---|---|---|
| **Beranda** | Ringkasan pribadi (tugas, deadline hari ini, terlambat, berikutnya), menu, Watchlist saya per jenis konten, jadwal tayang hari ini, kalender produksi & tayang | Ya | Ya | Ya |
| **Content Queue** | Grafik dan Watchlist semua barang per tahap | Ya | Ya | Ya |
| **Kalender** | Kalender pribadi (hanya bisa dilihat pemiliknya, pilihan warna) + kalender produksi & tayang tim | Kalender pribadi sendiri; jadwal tim: lihat & atur | Pribadi sendiri; jadwal tim: lihat | Pribadi sendiri; jadwal tim: lihat |
| **Barang** | 1. Barang masuk: catat barang (satu barang, atau stok lama → konten IDCC); semua isian termasuk foto wajib diisi. 2. Daftar barang: pilih kategori lalu merek, cari, dan urutkan (nama A–Z, tanggal datang terlama/terbaru, stok terbanyak/tersedikit); kartu bisa diedit | Ya | Ya | – |
| **Workflow Hub** | Papan kerja 5 tahap | Semua konten | Konten sendiri (bisa mengatur) | Konten sendiri |
| **Analisis IDCC** | Baca PDF umur persediaan dari finance + rekomendasi AI | Ya | Ya (jika dicentang) | – |
| **Laporan Admin** | Laporan mingguan, planning + WhatsApp, laporan bulanan CEO | Ya | – | – |
| **Panduan** | Aturan kerja, jobdesk, penyesuaian otomatis | Lihat & ubah jobdesk | Lihat | Lihat |
| **Tim & Aktivitas** | Beban kerja, track per minggu, template caption, akun tim, latar login | Ya | – | – |

Menu berupa kotak-kotak di **Beranda**, tepat di bawah sapaan, berjalan pelan ke kiri-kanan (berhenti saat disentuh; ada tombol panah). Saat Beranda di-scroll ke bawah, menu berpindah menjadi **kolom ikon kecil di kiri layar** (di HP: bilah ikon di bawah tulisan Tirtonic Studio); kolom ini selalu tampil di halaman lain. Tombol **Kembali** di atas setiap halaman membawa ke halaman sebelumnya. Isinya menyesuaikan akun masing-masing. Klik **logo Tirtonic** di kiri atas untuk kembali ke Beranda. Klik **avatar Anda** di kanan atas untuk membuka **Profil** (foto profil, avatar hewan beranimasi, warna avatar, **catatan pribadi** yang hanya bisa dibaca pemiliknya, bahasa), **Tampilan** (10 tema, sebagian beranimasi), dan **Keluar**.

**Admin 2** (diatur di Tim & Aktivitas → peran): bisa mencatat barang, mengatur konten, jadwal, dan pengaturan seperti admin, tetapi tidak melihat Laporan Admin dan Tim & Aktivitas, dan di Workflow Hub hanya melihat konten miliknya. Saat ini untuk Aulia.

## Louis2 (pembaruan Louis1: jadwal berdasarkan tanggal Ready)

Kode EX / LS / JP+ / JP dari Louis1 tetap dipakai. Saat mencatat barang, isi juga **Jam datang** (sebelum atau sesudah 15.00). Setiap konten otomatis mendapat tanggal **wajib Ready** (file final sudah di Drive). Angkanya adalah **jangka waktu sejak hari barang datang** (H = hari datang), bukan hari tetap; barang datang hari apa pun dihitung dengan cara yang sama. Saat jadwal tim penuh, urutan prioritas tetap EX → LS → JP+ → JP:

| Konten | Datang sebelum 15.00 (EX / LS / JP+ / JP) | Datang sesudah 15.00 (EX / LS / JP+ / JP) |
|---|---|---|
| Foto katalog | hari itu | besoknya |
| Foto Instagram | H+1 / H+1 / H+2 / H+3 | H+2 / H+2 / H+4 / H+6 |
| Video produk | H+2 / H+2 / H+3 / H+2 | H+3 / H+3 / H+4 / H+4 |
| Video review | H+3 / H+3 / H+4 / H+4 | H+5 / H+5 / H+6 / H+6 |

Kartu di Workflow Hub menampilkan **Deadline Ready**. Tanggal tayang tidak lagi diisi otomatis: konten yang sudah Ready masuk ke kotak **Konten ready** di Content Queue, lengkap dengan saran tanggal tayang (hari yang sama dengan tanggal Ready-nya). Admin menarik konten ke **Kalender tayang** (di HP: tombol Jadwalkan), lalu memilih jam tayang. Klik konten di kalender untuk mengubah jadwal atau mengembalikannya ke Konten ready.

## Louis1 (kode barang)

Setiap barang masuk diberi kode oleh admin (Zaki). Kode menentukan konten yang dibuat dan urutan jadwalnya:

| Kode | Arti | Konten | Urutan |
|---|---|---|---|
| **EX** | Eksklusif Produk | Lengkap: Katalog, Foto IG, Video produk, Video review | Paling dulu; boleh menggeser jadwal JP |
| **LS** | Limited Stock | Lengkap | Kedua; tayang secepatnya sebelum stok habis |
| **JP+** | Jumlah Produk, stok di atas 10 | Lengkap | Ketiga; ikut jadwal biasa, paling lama 7 hari kerja |
| **JP** | Jumlah Produk, stok 10 ke bawah | Lengkap | Terakhir; syuting mulai H+3, tayang paling cepat H+5, tidak menggeser jadwal lain, paling lama 10 hari kerja |

Batas 7/10 hari kerja untuk JP tidak berlaku selama masih ada barang EX/LS yang ditandai **Musiman** dan belum tayang. Kode terlihat oleh semua orang di kartu barang (Daftar barang dan Content Queue). Hanya admin yang bisa mengubahnya (pilihan kode langsung di kartu Daftar barang, atau tombol Edit); barang yang dicatat Admin 2 otomatis JP. Saat kode diubah, konten yang belum ada ditambahkan dan jadwal Foto IG, Video produk, dan Video review yang belum diproduksi dihitung ulang mulai hari itu.

## Alur kerja konten

| Tahap | Artinya | Siapa yang memindahkan |
|---|---|---|
| **Terdata** | Barang tercatat, masuk pantauan | otomatis saat barang dicatat |
| **Diproduksi** | Sedang syuting hari itu | anggota / admin |
| **Editing** | Sedang diedit | anggota / admin |
| **Ready** | File final sudah di Google Drive (link wajib ditempel) | anggota / admin |
| **Tayang** | Sudah di Instagram | otomatis setelah jam tayang di Meta lewat, atau admin |

1. Editor mengunggah file final ke Google Drive dengan nama file dari kartu, menempel link Drive di **Detail** kartu, lalu memindahkan kartu ke **Ready**.
2. Zaki mengecek file dan klik **Tandai sudah dicek**. Di **Detail → Caption Instagram**, tempel deskripsi dari toko online lalu klik **Buat caption dengan AI** (template diatur di Tim & Aktivitas).
3. Zaki membuka **Detail** kartu Ready di Workflow Hub: buka file Drive, unduh, **Salin caption**, jadwalkan di Meta Business Suite pada tanggal & jam yang tertera, lalu klik **Sudah dijadwalkan di Meta**.
4. Setelah jam tayang lewat, kartu pindah ke **Tayang** sendiri.

Tulisan merah di kartu adalah deadline orang yang sedang ditunggu. **Deadline** biru di kartu dan Watchlist adalah batas file final harus Ready: 2 hari kerja sebelum tayang. Foto barang otomatis dipotong potret 2:3. Di halaman selain Beranda, buka menu dengan mengarahkan kursor ke ujung kiri layar (laptop) atau tombol garis tiga di kiri atas (HP). Bahasa Indonesia/Inggris dipilih di panel avatar (berlaku per perangkat; pesan WhatsApp tetap bahasa Indonesia). Konten aktif 1 bulan sejak dibuat, setelah itu menjadi arsip.

## Jadwal tayang

- **09.00 foto · 12.00 video · 15.00 foto · 18.00 video** setiap hari. Video boleh jenis apa pun; website mengacak supaya jenis yang sama tidak tayang dua kali sehari dan jam yang sama tidak diisi jenis yang sama berturut-turut.
- Payday tayang tanggal 23, tanggal kembar tayang H-2, IDCC satu video per minggu (bawaan Rabu).
- Jadwal syuting dan editing mengikuti hari masuk dan kapasitas tiap orang. Jika penuh atau ada yang libur, website memindahkan tugas sendiri (lihat Panduan → Penyesuaian otomatis terakhir).

## Analisis IDCC

1. Minta finance mengekspor laporan **Umur Persediaan** dari ACCURATE ke PDF (boleh terpisah: sepatu, raket, tas).
2. **Analisis IDCC → Pilih file PDF** → pilih semua file. Kolom **Cocok** berarti total stok sama dengan baris total laporan.
3. Atur kriteria → **Analisis dengan AI** → centang barang yang disetujui → **Pratinjau jadwal** → **Simpan & jadwalkan**.

Yang dikirim ke AI hanya nama barang, varian, dan jumlah stok per umur (tanpa harga). File PDF dibaca di browser dan tidak diunggah.

## Masalah umum

| Masalah | Solusi |
|---|---|
| Perubahan tidak muncul di website | Cek GitHub → tab Actions: proses "Deploy ke Firebase Hosting" harus hijau. Kalau merah, buka lalu kirim tangkapan layarnya ke Claude Code. Buka website di jendela Private atau muat ulang (Cmd + Shift + R). |
| Deploy **Failed**: unrecognized Git contributor | Klik **Link Git account** di halaman deploy, lalu Retry. |
| Tombol AI (Analisis dengan AI, Buat caption dengan AI) gagal | Fitur AI sedang ditunda: Firebase Hosting paket gratis tidak menjalankan fungsi server. |
| "Akun Anda belum diizinkan memakai AI" | Centang akses IDCC untuk akun itu di Tim & Aktivitas. |
| Anggota gagal memindahkan kartu / menyimpan link Drive | `firestore.rules` terbaru belum di-Publish di Firebase. |
| "Domain website ini belum diizinkan" | Tambahkan domain di Firebase → Authentication → Settings → Authorized domains. |
| Ikon di Safari masih huruf "N" | Hapus `~/Library/Safari/Touch Icons Cache` dan `Favicon Cache`, buka ulang website, buat ulang bookmark. |
