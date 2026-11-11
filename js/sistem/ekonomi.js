import { K } from '../inti/konfigurasi.js';
export function hadiahPertandingan(menang, level) { return menang ? K.hadiah.menang + K.hadiah.perLevel * level : K.hadiah.kalah; }
