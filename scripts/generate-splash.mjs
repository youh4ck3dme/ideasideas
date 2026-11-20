// Generuje iOS apple-touch-startup-image splash screeny (pevná značková farba)
// do public/. Spustenie: bun run splash
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(repoRoot, 'public');

const BG = [0xfa, 0xfa, 0xfa]; // #FAFAFA (matchuje manifest background_color)

const SIZES = [
  [640, 1136], // iPhone SE
  [750, 1334], // iPhone 6/7/8
  [828, 1792], // iPhone XR / 11
  [1125, 2436], // iPhone X / XS / 11 Pro
  [1170, 2532], // iPhone 12/13/14 Pro
  [1179, 2556], // iPhone 14/15 Pro
  [1242, 2688], // iPhone XS Max / 11 Pro Max
  [1284, 2778], // iPhone 12/13 Pro Max
  [1290, 2796], // iPhone 14/15 Pro Max
];

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePng(width, height, [r, g, b]) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const o = rowStart + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [w, h] of SIZES) {
  const file = path.join(outDir, `splash-${w}x${h}.png`);
  fs.writeFileSync(file, encodePng(w, h, BG));
  console.log(`splash-${w}x${h}.png (${fs.statSync(file).size} B)`);
}
