// Rute berbasis hash (#/tab atau #/tab/menu) supaya tombol Back browser dan tautan langsung bekerja. Logika murni.
export const bentukRute = (nama, kunci) => '#/' + nama + (kunci ? '/' + kunci : '');
// tabs: objek TAB di main.js; menu: daftar DK. Hash tidak dikenal => Beranda. Kunci menu hanya sah bila milik tab itu.
export function bacaRute(hash, tabs, menu) {
  const m = /^#\/([a-z]+)(?:\/([a-z]+))?$/.exec(hash || '');
  const nama = m && tabs[m[1]] ? m[1] : 'beranda';
  const it = m && m[2] ? menu.find(x => x[0] === m[2] && x[3] === nama) : null;
  return [nama, it ? it[0] : null];
}
