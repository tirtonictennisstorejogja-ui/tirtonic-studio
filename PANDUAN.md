# Panduan Tirtonic Studio

Panduan untuk tim: cara memasang, memperbarui, dan memakai website Tirtonic Studio.
Alamat website: **mediadesk-tirtonic.netlify.app**

## Isi repo

| Folder / file | Fungsi |
|---|---|
| `website/` | Website (index.html, config.js, logo, ikon) |
| `netlify/functions/idcc-ai.mjs` | Penghubung ke AI (Analisis IDCC dan caption Instagram). Kunci API disimpan di Netlify, tidak pernah di repo |
| `netlify.toml` | Memberi tahu Netlify letak website dan fungsi AI |
| `firestore.rules` | Aturan keamanan database (dipasang manual di Firebase) |
| `tools/` | Alat uji coba lokal dengan data contoh, tidak dipakai website asli |
| `CLAUDE.md` | Penjelasan proyek untuk Claude Code |
| `PANDUAN.md` | File ini |

---

## Memperbarui website

Website diambil Netlify langsung dari GitHub. Setiap **Commit changes** di GitHub (manual atau oleh Claude Code) membuat Netlify memperbarui website sendiri dalam sekitar 1 menit (Netlify → Deploys → status **Published**).

**Unggah manual:** buka folder tujuan di GitHub → **Add file → Upload files** → **choose your files** → **Commit changes**. File bernama sama otomatis ditimpa. Pastikan nama file tepat (misalnya `index.html`, bukan `index 2.html`).

**Setiap kali `firestore.rules` berubah**, pasang juga di Firebase:
Firebase Console → proyek **tirtonic-studio** → **Firestore Database → Rules** → hapus isi lama → tempel isi baru → **Publish**.
Di laptop Zaki, Claude Code juga bisa mem-Publish-nya langsung (Firebase CLI sudah login); cukup minta "publish firestore.rules".

## Pemasangan awal (sudah dilakukan, untuk referensi)

1. **Firebase**: proyek `tirtonic-studio`, login Google aktif, Firestore dibuat, `firestore.rules` di-Publish, domain website ada di Authentication → Settings → Authorized domains.
2. **GitHub**: repo Private `tirtonic-studio` berisi folder dan file di atas.
3. **Netlify**: proyek `mediadesk-tirtonic` terhubung ke repo (Publish directory `website`, Functions directory `netlify/functions`). Jika muncul "unrecognized Git contributor", hubungkan akun GitHub lewat tombol **Link Git account** di halaman deploy.
4. **Kunci AI**: buat di console.anthropic.com (API Keys), simpan di Netlify → Project configuration → Environment variables sebagai `ANTHROPIC_API_KEY`, lalu Deploys → Trigger deploy. **Jangan tempel kunci di chat, file, atau GitHub.** Opsional: `AI_MODEL` (bawaan `claude-sonnet-5-5`).
5. **Akun tim**: login sebagai Zaki → Tim & Aktivitas → Akun tim. Centang **Boleh memakai Analisis IDCC** untuk Aulia.

---

## Menu

| Menu | Isi | Admin (Zaki) | Aulia | Rayhan, Salma |
|---|---|---|---|---|
| **Beranda** | Sapaan, angka ringkas, Watchlist saya, jadwal tayang hari ini, Watchlist semua barang (Mode TV) | Ya | Ya | Ya |
| **Barang Masuk** | Catat barang (satu, beberapa sekaligus, stok lama → konten) | Ya | – | – |
| **Workflow Hub** | Papan kerja 5 tahap | Semua konten | Konten sendiri | Konten sendiri |
| **Kalender** | Jadwal produksi, jadwal tayang, antrian upload Meta | Lihat & atur | Lihat | Lihat |
| **Analisis IDCC** | Baca PDF umur persediaan dari finance + rekomendasi AI | Ya | Ya (jika dicentang) | – |
| **Laporan Admin** | Laporan mingguan, planning + WhatsApp, laporan bulanan CEO | Ya | – | – |
| **Panduan** | Aturan kerja, jobdesk, penyesuaian otomatis | Lihat & ubah jobdesk | Lihat | Lihat |
| **Tim & Aktivitas** | Beban kerja, track per minggu, template caption, akun tim, latar login | Ya | – | – |

Menu berupa kotak-kotak di **Beranda**, tepat di bawah sapaan; geser ke kanan untuk melihat semuanya. Isinya menyesuaikan akun masing-masing. Dari halaman mana pun, klik **logo Tirtonic** di kiri atas untuk kembali ke Beranda. Klik **avatar Anda** di kanan atas untuk membuka **Profil** (warna avatar, tersimpan di akun), **Tampilan** (5 tema, berlaku per perangkat), dan **Keluar**.

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
3. Zaki membuka **Kalender → Antrian upload Meta Business Suite**: **Buka file**, unduh, **Salin caption**, jadwalkan di Meta Business Suite pada tanggal & jam yang tertera, lalu klik **Sudah dijadwalkan di Meta**.
4. Setelah jam tayang lewat, kartu pindah ke **Tayang** sendiri.

Tulisan merah di kartu adalah deadline orang yang sedang ditunggu. Konten aktif 1 bulan sejak dibuat, setelah itu menjadi arsip.

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
| Perubahan tidak muncul di website | Cek Netlify → Deploys sudah **Published**. Buka website di jendela Private atau muat ulang (Cmd + Shift + R). |
| Deploy **Failed**: unrecognized Git contributor | Klik **Link Git account** di halaman deploy, lalu Retry. |
| "Layanan AI belum diatur di server" | `ANTHROPIC_API_KEY` belum diisi di Netlify, atau belum Trigger deploy setelah mengisi. |
| "Akun Anda belum diizinkan memakai AI" | Centang akses IDCC untuk akun itu di Tim & Aktivitas. |
| Anggota gagal memindahkan kartu / menyimpan link Drive | `firestore.rules` terbaru belum di-Publish di Firebase. |
| "Domain website ini belum diizinkan" | Tambahkan domain di Firebase → Authentication → Settings → Authorized domains. |
| Ikon di Safari masih huruf "N" | Hapus `~/Library/Safari/Touch Icons Cache` dan `Favicon Cache`, buka ulang website, buat ulang bookmark. |
