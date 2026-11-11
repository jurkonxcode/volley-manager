// Pengacak dengan seed (mulberry32): hasil bisa diulang untuk pengujian.
export function buatAcak(seed) {
  let a = seed >>> 0;
  const f = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.int = (min, maks) => min + Math.floor(f() * (maks - min + 1));
  f.pilih = arr => arr[Math.floor(f() * arr.length)];
  return f;
}
