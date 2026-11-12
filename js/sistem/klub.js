// Keadaan klub di luar lapangan: fans, sponsor, ekonomi mingguan, pesan, pencapaian, ganti negara. Logika murni.
import { gajiPemain, ratingPemain } from './pemain.js';
import { buatAcak } from '../inti/acak.js';
import { K } from '../inti/konfigurasi.js';
import { autoSusun } from './taktik.js';
import { namaOrang, asalOrang } from '../data/negara.js';
import { pemasukanLaga } from './stadion.js';
import { identitasAwal } from './identitas.js';
const SPONSOR = ['Kopi Nusantara', 'Bank Garuda', 'Sinar Motor', 'Telko Prima', 'Aqua Jaya', 'Toko Bintang'];
export const CAPAI = [
  ['Kemenangan pertama', S => S.manajer.menang >= 1], ['5 kemenangan', S => S.manajer.menang >= 5], ['20 kemenangan', S => S.manajer.menang >= 20],
  ['10 laga dimainkan', S => S.manajer.main >= 10], ['Manajer level 5', S => S.manajer.exp >= 560], ['1.500 fans', S => S.klub.fans >= 1500], ['3.000 fans', S => S.klub.fans >= 3000],
  ['Punya pemain SR', S => S.skuad.some(p => ratingPemain(p) >= 54)], ['Simpan 2.000 koin', S => S.koin >= 2000], ['Selesaikan 1 musim', S => S.riwayat.length >= 1],
  ['Promosi liga', S => S.riwayat.some(r => r.naik)], ['Juara liga', S => S.riwayat.some(r => r.rank === 1)],
];
export function buatSponsor(liga, rank) { const a = buatAcak(liga * 97 + rank * 13 + Date.now() % 997); return { nama: a.pilih(SPONSOR), target: Math.max(1, Math.min(5, rank || 4)), bonus: 400 + liga * 250, bayar: 40 + liga * 20 }; }
export function lengkapiKlub(S) {
  S.negara ??= 'ID'; S.riwayat ??= [];
  S.klub ??= { fans: 1200, sponsor: buatSponsor(0, 4), inbox: [], capai: {}, ekonomi: [] };
  S.klub.tiket ??= { liga: 1, persahabatan: 1 }; S.klub.semangat ??= K.semangat.awal; S.klub.buku ??= [];
  S.identitas ??= identitasAwal(S.manajer?.tim, S.negara); S.token ??= K.token.awal;
  terapkanSemangat(S);
  if (!S.klub.inbox.length) pesan(S, `Selamat datang di ${S.identitas.stadion}, Manajer!`, 'Atur susunan, bangun stadion dan fasilitas di tab Klub, dan jadwalkan laga persahabatan lewat Kompetisi > Persahabatan.');
}
// Semangat tim (10-100) memberi bonus kecil ke semua statistik di lapangan: +-K.semangat.bonusMax di ujung skala.
export function terapkanSemangat(S) { if (S.taktik) S.taktik.semangat = 1 + ((S.klub.semangat ?? 50) - 50) / 50 * K.semangat.bonusMax; }
export function ubahSemangat(S, d) { S.klub.semangat = Math.max(10, Math.min(100, (S.klub.semangat ?? 50) + d)); terapkanSemangat(S); }
// Buku kas: tiap pemasukan (+) dan pengeluaran (-) dicatat per kategori, 150 catatan terakhir.
export function catatKas(S, kat, jml) { if (!jml) return; S.klub.buku ??= []; S.klub.buku.push({ t: Date.now(), k: kat, j: Math.round(jml) }); if (S.klub.buku.length > 150) S.klub.buku.splice(0, S.klub.buku.length - 150); }
export function pesan(S, judul, isi) { S.klub.inbox.unshift({ t: Date.now(), judul, isi }); S.klub.inbox.length = Math.min(S.klub.inbox.length, 30); }
export const gajiMingguan = S => Math.round(S.skuad.reduce((a, p) => a + gajiPemain(p), 0) / K.ekonomi.gajiPembagi);
// Dipanggil sekali per laga saya: pemasukan (tiket kandang + sponsor) dikurangi gaji; fans naik-turun; cek pencapaian.
export function akhirLaga(S, f, menang, level, h) {
  const k = S.klub, gaji = gajiMingguan(S), inc = pemasukanLaga(S, 'liga', f.kandang), masuk = inc.tiket + inc.parkir + inc.merch + k.sponsor.bayar;
  S.koin = Math.max(0, S.koin + masuk - gaji);
  catatKas(S, 'tiket', inc.tiket); catatKas(S, 'parkir', inc.parkir); catatKas(S, 'merch', inc.merch); catatKas(S, 'sponsor', k.sponsor.bayar); catatKas(S, 'gaji', -gaji);
  k.fans = Math.max(100, k.fans + (menang ? 35 + level * 10 : -15)); ubahSemangat(S, menang ? K.semangat.menang : K.semangat.kalah);
  k.ekonomi.push({ h, masuk, keluar: gaji }); k.ekonomi = k.ekonomi.slice(-8);
  const baru = CAPAI.filter(([n, ok]) => !k.capai[n] && ok(S));
  baru.forEach(([n]) => { k.capai[n] = 1; S.token = (S.token || 0) + K.token.capai; pesan(S, 'Pencapaian: ' + n, `Pencapaian baru terbuka, +${K.token.capai} token. Lihat daftar di Beranda.`); });
  return { masuk, gaji, baru: baru.length };
}
// Ganti negara: nama dan asal semua pemain disesuaikan, peluang nama lama tidak bentrok karena seed dari id.
export function gantiNegara(S, neg) {
  S.negara = neg;
  S.skuad.forEach(p => { const a = buatAcak([...p.id].reduce((x, c) => (x * 31 + c.charCodeAt(0)) >>> 0, 7) + neg.charCodeAt(0)); p.nama = namaOrang(neg, a); p.neg = neg; p.asal = asalOrang(neg, a); });
}

// Kontrak dihitung dalam musim (kM = musim terakhir kontrak). Pemain yang kontraknya habis pergi saat musim berakhir, kecuali skuad tinggal minimal.
const hashId = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
export function pastikanKontrak(S) { S.skuad.forEach(p => { p.kM ??= S.musim.ke + hashId(p.id) % 3; }); }
export const biayaPerpanjang = p => Math.round(gajiPemain(p) * 0.7);
export function perpanjang(S, p) {
  const b = biayaPerpanjang(p); if (S.koin < b) return 'Koin tidak cukup (' + b + ' koin).';
  S.koin -= b; catatKas(S, 'kontrak', -b); p.kM = Math.max(p.kM, S.musim.ke) + 2; pesan(S, 'Kontrak diperpanjang', `${p.nama} bertahan sampai musim ${p.kM}.`); return null;
}
export function kontrakSelesai(S, now) {
  const ke = S.musim.ke, pergi = [];
  S.skuad.filter(p => p.kM <= ke).forEach(p => { if (S.skuad.length - pergi.length > K.pasar.minSkuad) pergi.push(p); else p.kM = ke + 1; });
  if (pergi.length) { S.skuad = S.skuad.filter(p => !pergi.includes(p)); S.susunan = autoSusun(S, now); }
  return { pergi: pergi.map(p => p.nama) };
}
