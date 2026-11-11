// Keadaan klub di luar lapangan: fans, sponsor, ekonomi mingguan, pesan, pencapaian, ganti negara. Logika murni.
import { gajiPemain, ratingPemain } from './pemain.js';
import { buatAcak } from '../inti/acak.js';
import { namaOrang, asalOrang } from '../data/negara.js';
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
  if (!S.klub.inbox.length) pesan(S, 'Selamat datang, Manajer!', 'Atur susunan, kelola keuangan, dan bawa klub ke puncak liga.');
}
export function pesan(S, judul, isi) { S.klub.inbox.unshift({ t: Date.now(), judul, isi }); S.klub.inbox.length = Math.min(S.klub.inbox.length, 30); }
export const gajiMingguan = S => Math.round(S.skuad.reduce((a, p) => a + gajiPemain(p), 0) / 20);
// Dipanggil sekali per laga saya: pemasukan (tiket kandang + sponsor) dikurangi gaji; fans naik-turun; cek pencapaian.
export function akhirLaga(S, f, menang, level, h) {
  const k = S.klub, gaji = gajiMingguan(S), tiket = f.kandang ? Math.round(k.fans / 25 * (1 + .1 * (S.fasilitas?.stadion || 0))) : 0, masuk = tiket + k.sponsor.bayar;
  S.koin = Math.max(0, S.koin + masuk - gaji);
  k.fans = Math.max(100, k.fans + (menang ? 35 + level * 10 : -15));
  k.ekonomi.push({ h, masuk, keluar: gaji }); k.ekonomi = k.ekonomi.slice(-8);
  const baru = CAPAI.filter(([n, ok]) => !k.capai[n] && ok(S));
  baru.forEach(([n]) => { k.capai[n] = 1; pesan(S, 'Pencapaian: ' + n, 'Pencapaian baru terbuka. Lihat daftar di Beranda.'); });
  return { masuk, gaji, baru: baru.length };
}
// Ganti negara: nama dan asal semua pemain disesuaikan, peluang nama lama tidak bentrok karena seed dari id.
export function gantiNegara(S, neg) {
  S.negara = neg;
  S.skuad.forEach(p => { const a = buatAcak([...p.id].reduce((x, c) => (x * 31 + c.charCodeAt(0)) >>> 0, 7) + neg.charCodeAt(0)); p.nama = namaOrang(neg, a); p.neg = neg; p.asal = asalOrang(neg, a); });
}
