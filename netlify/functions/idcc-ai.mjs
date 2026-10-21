// Netlify Function: Analisis IDCC dengan AI (Claude API).
// Dipanggil website lewat POST /api/idcc-ai. Kunci API TIDAK pernah dikirim ke browser.
//
// Environment variables (Netlify > Project configuration > Environment variables):
//   ANTHROPIC_API_KEY  wajib, kunci dari console.anthropic.com
//   AI_MODEL           opsional, default claude-sonnet-5-5
//   FIREBASE_API_KEY   opsional, default apiKey proyek tirtonic-studio
//   FIREBASE_PROJECT   opsional, default tirtonic-studio
//   OWNER_EMAILS       opsional, dipisah koma; default email admin utama

const FB_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyCeEEzPHwRFbYgqAy4t-zRAd98obpy0KE4';
const FB_PROJECT = process.env.FIREBASE_PROJECT || 'tirtonic-studio';
const OWNERS = (process.env.OWNER_EMAILS || 'mzakiramadhan261003@gmail.com').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
const MODEL = process.env.AI_MODEL || 'claude-sonnet-5-5';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

async function whoIs(idToken) {
  const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FB_KEY, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idToken })
  });
  if (!r.ok) return null;
  const u = ((await r.json()).users || [])[0];
  if (!u || !u.email || u.emailVerified === false) return null;
  const email = u.email.toLowerCase();
  if (OWNERS.includes(email)) return { email, ok: true };
  // baca data anggota dengan token pengguna itu sendiri (aturan Firestore tetap berlaku)
  const m = await fetch(`https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents/members/${encodeURIComponent(email)}`, {
    headers: { authorization: 'Bearer ' + idToken }
  });
  if (!m.ok) return { email, ok: false };
  const f = (await m.json()).fields || {};
  const role = f.role && f.role.stringValue;
  const idcc = f.idcc && f.idcc.booleanValue === true;
  return { email, ok: role === 'admin' || idcc };
}

const SYSTEM = `Anda analis konten untuk Tirtonic, toko perlengkapan tenis di Yogyakarta. Tim media (Tirtonic Studio) membuat konten IDCC: konten Instagram untuk membantu menjual stok lama (stok yang lama tidak laku).
Data berasal dari laporan "Umur Persediaan" finance. Setiap barang sudah dikelompokkan per model; varian adalah ukuran, grip, atau warna.
Kolom: stok total, stok_lebih_90_hari (umur 91-120 dan >120 hari), stok_lebih_120_hari, umur_rata_hari (perkiraan), jumlah_varian.
Pedoman rekomendasi:
- "video": barang yang paling mendesak dan menarik ditunjukkan bergerak/dipakai (sepatu dan raket populer, stok lama banyak, banyak ukuran tersedia). Slot video IDCC hanya sekitar 1 per minggu, jadi pilih dengan ketat.
- "foto": layak diangkat tetapi cukup dengan foto (tas, raket atau sepatu dengan stok lama sedang).
- "keduanya": hanya untuk barang dengan stok lama sangat banyak.
- "pantau": stok lama sedikit, varian tinggal sisa ukuran yang sulit, atau sudah ada di pipeline.
Prioritas 1 = kerjakan minggu ini, 2 = dua minggu ke depan, 3 = bisa menunggu.
Tulis alasan singkat (maks. 25 kata) berdasarkan angka, dan ide konten konkret (maks. 20 kata) dalam Bahasa Indonesia santai-profesional. Jangan mengarang harga atau diskon.`;

const TOOL_NILAI = {
  name: 'hasil_penilaian',
  description: 'Kembalikan penilaian untuk SETIAP barang yang diberikan.',
  input_schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            rekomendasi: { type: 'string', enum: ['video', 'foto', 'keduanya', 'pantau'] },
            prioritas: { type: 'integer', enum: [1, 2, 3] },
            alasan: { type: 'string' },
            ide_konten: { type: 'string' }
          },
          required: ['id', 'rekomendasi', 'prioritas', 'alasan', 'ide_konten']
        }
      }
    },
    required: ['items']
  }
};
const TOOL_RINGKAS = {
  name: 'ringkasan',
  description: 'Ringkasan untuk admin media.',
  input_schema: { type: 'object', properties: { ringkasan: { type: 'string' } }, required: ['ringkasan'] }
};

async function askClaude(tool, userText, maxTokens) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 55000);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal: ctl.signal,
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL, max_tokens: maxTokens, system: SYSTEM,
        tools: [tool], tool_choice: { type: 'tool', name: tool.name },
        messages: [{ role: 'user', content: userText }]
      })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error('AI menolak permintaan (' + r.status + '): ' + ((j.error && j.error.message) || ''));
    const use = (j.content || []).find(c => c.type === 'tool_use');
    if (!use) throw new Error('AI tidak mengembalikan hasil terstruktur.');
    return use.input;
  } finally { clearTimeout(timer); }
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Gunakan POST.' });
  if (!process.env.ANTHROPIC_API_KEY) return json(500, { error: 'ANTHROPIC_API_KEY belum diatur di Netlify.' });
  const tok = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!tok) return json(401, { error: 'Belum login.' });
  let who;
  try { who = await whoIs(tok); } catch (e) { return json(502, { error: 'Gagal memeriksa login.' }); }
  if (!who) return json(401, { error: 'Login tidak valid. Muat ulang halaman lalu masuk lagi.' });
  if (!who.ok) return json(403, { error: 'Akun ini belum diberi izin Analisis IDCC.' });

  let body;
  try { body = await req.json(); } catch (e) { return json(400, { error: 'Data tidak valid.' }); }

  try {
    if (body.mode === 'nilai') {
      const barang = Array.isArray(body.barang) ? body.barang.slice(0, 25) : [];
      if (!barang.length) return json(400, { error: 'Tidak ada barang.' });
      const text = `Laporan umur persediaan per ${body.tanggal_laporan || '-'}. Kriteria awal: stok >90 hari minimal ${body.kriteria?.stok_90_min ?? '-'}, stok minimal ${body.kriteria?.stok_min ?? '-'}.\nNilai ${barang.length} barang berikut (JSON):\n${JSON.stringify(barang)}`;
      const out = await askClaude(TOOL_NILAI, text, 6000);
      const ids = new Set(barang.map(b => String(b.id)));
      return json(200, { items: (out.items || []).filter(x => ids.has(String(x.id))) });
    }
    if (body.mode === 'ringkas') {
      const hasil = Array.isArray(body.hasil) ? body.hasil.slice(0, 100) : [];
      const text = `Hasil penilaian barang IDCC dari laporan per ${body.tanggal_laporan || '-'} (JSON):\n${JSON.stringify(hasil)}\n\nTulis ringkasan 3-5 kalimat untuk admin media: berapa barang direkomendasikan per kategori, 3-5 barang paling mendesak dan alasannya, serta saran urutan pengerjaan minggu ini. Tanpa poin-poin, tanpa markdown.`;
      const out = await askClaude(TOOL_RINGKAS, text, 1200);
      return json(200, { ringkasan: out.ringkasan || '' });
    }
    return json(400, { error: 'Mode tidak dikenal.' });
  } catch (e) {
    return json(502, { error: e.name === 'AbortError' ? 'AI terlalu lama menjawab. Coba kurangi jumlah barang.' : e.message });
  }
};
