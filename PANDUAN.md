# Tirtonic Studio v5: cara memasang

Isi repo:

| Folder / file | Fungsi |
|---|---|
| `website/` | Website Tirtonic Studio (index.html, config.js, logo.png, favicon.png) |
| `netlify/functions/idcc-ai.mjs` | Penghubung ke AI untuk Analisis IDCC. Kunci API disimpan di Netlify, tidak pernah di website |
| `netlify.toml` | Memberi tahu Netlify letak website dan fungsi AI |
| `firestore.rules` | Aturan keamanan database (versi baru, wajib di-Publish ulang) |

Mulai v5, website tidak lagi diunggah dengan Netlify Drop, karena fungsi AI hanya bisa berjalan jika Netlify mengambil file dari GitHub. Setelah langkah ini, setiap pembaruan cukup diunggah ke GitHub dan Netlify memperbarui website sendiri.

---

## 1. Pasang aturan database baru (5 menit)

1. Buka console.firebase.google.com → proyek **tirtonic-studio** → **Firestore Database** → tab **Rules**.
2. Hapus semua isinya, tempel seluruh isi `firestore.rules`, klik **Publish**.

Aturan baru menambahkan: gambar latar login, riwayat Analisis IDCC, dan izin terbatas untuk anggota IDCC (hanya menambah barang stok lama dan konten IDCC, tidak bisa mengubah atau menghapus data lain).

## 2. Unggah ke GitHub (10 menit)

1. Masuk github.com → tombol **+** kanan atas → **New repository**.
2. Nama: `tirtonic-studio`. Pilih **Private**. Klik **Create repository**.
3. Di halaman repo baru, klik tautan **uploading an existing file**.
4. Ekstrak zip ini di komputer. Buka folder `tirtonic-studio-v5`, pilih **semua isinya** (folder `website`, folder `netlify`, `netlify.toml`, `firestore.rules`, `PANDUAN.md`), lalu tarik ke halaman GitHub.
   Pastikan struktur folder ikut (GitHub menampilkan `website/index.html`, `netlify/functions/idcc-ai.mjs`).
5. Klik **Commit changes**.

## 3. Sambungkan Netlify ke GitHub (10 menit)

Pakai proyek Netlify yang sudah ada supaya alamat website tetap sama:

1. app.netlify.com → pilih proyek Tirtonic Studio → **Project configuration** → **Build & deploy** → **Link repository** (atau **Link to Git provider**).
2. Pilih **GitHub**, izinkan akses, pilih repo `tirtonic-studio`.
3. Isian build: **Base directory** kosong, **Build command** kosong, **Publish directory** `website`, **Functions directory** `netlify/functions` (biasanya sudah terisi otomatis dari `netlify.toml`).
4. Klik **Deploy**.

Jika menu Link repository tidak muncul, buat proyek baru: **Add new project → Import an existing project → GitHub**, lalu tambahkan domain baru itu di Firebase (**Authentication → Settings → Authorized domains**).

## 4. Buat kunci API AI (5 menit)

1. Buka **console.anthropic.com**, daftar/masuk dengan akun toko.
2. **Billing**: isi saldo (pembayaran per pemakaian; satu analisis 40 barang biasanya hanya beberapa ribu rupiah).
3. **API Keys → Create Key**, beri nama `tirtonic-studio`, salin kuncinya.

**Jangan tempel kunci ini di chat, di file website, atau di GitHub.**

## 5. Simpan kunci di Netlify

1. Netlify → proyek → **Project configuration → Environment variables → Add a variable**.
2. Key: `ANTHROPIC_API_KEY`, Value: kunci dari langkah 4. Simpan.
3. **Deploys → Trigger deploy → Deploy project** supaya kunci terbaca.

Opsional: variabel `AI_MODEL` untuk mengganti model AI (bawaan `claude-sonnet-5-5`).

## 6. Beri Aulia akses Analisis IDCC

Login sebagai admin → **Tim & Aktivitas → Akun tim** → edit Aulia → centang **Boleh memakai Analisis IDCC** → Simpan. Menu Analisis IDCC muncul di sidebar Aulia.

## 7. Ganti gambar latar halaman login

**Tim & Aktivitas → Tampilan halaman login → Unggah gambar**. Gambar otomatis dikecilkan. **Kembalikan bawaan** untuk kembali ke latar biru.

---

## Cara pakai Analisis IDCC

1. Minta finance mengekspor laporan **Umur Persediaan** dari ACCURATE ke PDF (boleh terpisah: sepatu, raket, tas).
2. Buka **Analisis IDCC** → **Pilih file PDF** → pilih semua file sekaligus.
3. Cek tabel file: kolom **Cocok** berarti total stok hasil baca sama dengan baris total laporan.
4. Atur kriteria (bawaan: stok umur > 90 hari minimal 5, total stok minimal 5). Klik **Analisis dengan AI**.
5. AI memberi rekomendasi per barang: Video IDCC, Foto IDCC, Foto + video, atau Pantau, beserta alasan dan ide konten. Rekomendasi bisa diubah.
6. Centang barang yang disetujui → **Pratinjau jadwal** → **Simpan & jadwalkan**. Konten masuk Pipeline dan kalender sesuai kapasitas tim.

Data yang dikirim ke AI hanya nama barang, varian, dan jumlah stok per umur (tanpa harga atau nilai rupiah). Website membaca PDF di browser; file PDF tidak diunggah ke mana pun.

## Masalah umum

| Pesan | Solusi |
|---|---|
| "Layanan AI belum diatur di server" | Langkah 5 belum dilakukan, atau belum deploy ulang setelah menambah kunci. |
| "AI tidak bisa dihubungi: HTTP 404" | Netlify belum tersambung ke GitHub (langkah 3), atau masih memakai Netlify Drop. |
| "Akun Anda belum diizinkan memakai AI" | Centang akses IDCC untuk akun itu (langkah 6). |
| Kolom "Selisih, periksa PDF" | Format PDF berbeda dari laporan Umur Persediaan biasa. Kirim contohnya untuk disesuaikan. |
| Gagal menyimpan konten IDCC (akses ditolak) | Aturan database baru belum di-Publish (langkah 1). |

## Hak akses menu

| Menu | Admin (Zaki) | Aulia (akses IDCC dicentang) | Anggota lain |
|---|---|---|---|
| Barang Masuk, Laporan Admin, Tim & Aktivitas | Ya | Tidak | Tidak |
| Analisis IDCC | Ya | Ya | Tidak |
| Pipeline, Kalender | Semua | Tugas sendiri + kalender tim | Tugas sendiri + kalender tim |
| Panduan | Lihat & ubah jobdesk | Lihat saja | Lihat saja |
