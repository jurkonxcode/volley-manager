// Nama orang dan klub per negara. Tambah negara baru cukup dengan satu entri di sini.
const N = (nama, bendera, depan, belakang, kota, pola, urut = 'db') => ({ nama, bendera, depan: depan.split(' '), belakang: belakang.split(' '), kota: kota.split(','), pola, urut });
export const NEGARA = {
  ID: N('Indonesia', '🇮🇩', 'Rizky Dimas Bagas Fajar Arif Yoga Wahyu Eko Rama Andi Tegar Bayu Galih Dani Reza', 'Pratama Saputra Wijaya Kurniawan Santoso Hidayat Nugroho Setiawan Ramadhan Permana Utomo Siregar', 'Bandung,Surabaya,Yogyakarta,Semarang,Medan,Palembang,Makassar,Denpasar,Malang,Padang,Manado,Jayapura', ['Persi {k}', '{k} Muda', 'PS {k}', 'Satria {k}']),
  JP: N('Jepang', '🇯🇵', 'Haruto Ren Yuto Sora Kaito Riku Daiki Takumi Shota Yuki', 'Tanaka Sato Suzuki Takahashi Watanabe Ito Yamamoto Nakamura Kobayashi Kato', 'Tokyo,Osaka,Nagoya,Sapporo,Fukuoka,Kyoto,Kobe,Sendai', ['{k} Blazers', '{k} Thunders', '{k} Volley Club', 'Sun {k}'], 'bd'),
  BR: N('Brasil', '🇧🇷', 'Lucas Gabriel Rafael Thiago Bruno Mateus Felipe Diego Caio Vitor', 'Silva Santos Oliveira Souza Pereira Costa Rodrigues Almeida Lima Carvalho', 'São Paulo,Rio,Belo Horizonte,Curitiba,Salvador,Recife,Fortaleza,Brasília', ['Vôlei {k}', '{k} EC', 'Sesc {k}', 'Clube {k}']),
  IT: N('Italia', '🇮🇹', 'Marco Luca Matteo Andrea Simone Davide Federico Alessandro Giulio Paolo', 'Rossi Russo Ferrari Bianchi Romano Colombo Ricci Conti Greco Moretti', 'Modena,Perugia,Trento,Milano,Piacenza,Verona,Padova,Cuneo', ['Pallavolo {k}', 'Volley {k}', 'Club {k}', 'Virtus {k}']),
  PL: N('Polandia', '🇵🇱', 'Jakub Kacper Michał Piotr Bartosz Mateusz Tomasz Paweł Marcin Szymon', 'Nowak Kowalski Wiśniewski Wójcik Kamiński Lewandowski Zieliński Szymański Dąbrowski Kozłowski', 'Warszawa,Kraków,Gdańsk,Wrocław,Katowice,Rzeszów,Olsztyn,Bydgoszcz', ['{k} Volley', 'KS {k}', 'MKS {k}', 'Skra {k}']),
  TR: N('Turki', '🇹🇷', 'Mehmet Emre Burak Can Kerem Yusuf Ahmet Mert Onur Deniz', 'Yılmaz Kaya Demir Şahin Çelik Aydın Arslan Doğan Koç Öztürk', 'İstanbul,Ankara,İzmir,Bursa,Antalya,Konya,Adana,Eskişehir', ['{k} Voleybol', '{k} Spor', '{k} Belediye', 'Gençlik {k}']),
  KR: N('Korea Selatan', '🇰🇷', 'Min-jun Seo-jun Ji-ho Hyun-woo Joon-seo Do-yoon Tae-yang Jae-min Sung-ho Woo-jin', 'Kim Lee Park Choi Jung Kang Cho Yoon Jang Lim', 'Seoul,Incheon,Daejeon,Suwon,Busan,Daegu,Gwangju,Ulsan', ['{k} Skywalkers', '{k} Hi-Pass', '{k} Tigers', '{k} Volleyball'], 'bd'),
};
export const namaOrang = (neg, acak) => { const n = NEGARA[neg] || NEGARA.ID, d = acak.pilih(n.depan), b = acak.pilih(n.belakang); return n.urut === 'bd' ? b + ' ' + d : d + ' ' + b; };
export const asalOrang = (neg, acak) => { const n = NEGARA[neg] || NEGARA.ID; return acak.pilih(n.kota) + ', ' + n.nama; };
// n nama klub unik (kota x pola), tidak sama dengan nama tim pemain.
export function namaKlub(neg, acak, n, kecuali) {
  const c = NEGARA[neg] || NEGARA.ID, hasil = [];
  for (let i = 0; hasil.length < n && i < 200; i++) { const x = acak.pilih(c.pola).replace('{k}', acak.pilih(c.kota)); if (x !== kecuali && !hasil.includes(x)) hasil.push(x); }
  return hasil;
}
