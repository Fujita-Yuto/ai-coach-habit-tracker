// PNG icon generator using only built-in Node.js modules
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  const out = Buffer.alloc(4);
  out.writeUInt32BE((c ^ 0xFFFFFFFF) >>> 0);
  return out;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  return Buffer.concat([len, t, data, crc32(Buffer.concat([t, data]))]);
}

function solidRoundedPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const radius = Math.round(size * 0.22);
  const rowLen = size * 3 + 1;
  const raw = Buffer.alloc(size * rowLen);

  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filter
    for (let x = 0; x < size; x++) {
      const off = y * rowLen + 1 + x * 3;
      // Rounded corner check
      const dx = Math.min(x, size - 1 - x) - radius;
      const dy = Math.min(y, size - 1 - y) - radius;
      const inside = (dx >= 0 || dy >= 0)
        ? true
        : dx * dx + dy * dy <= radius * radius;
      if (inside) {
        raw[off] = r; raw[off + 1] = g; raw[off + 2] = b;
      } else {
        raw[off] = 249; raw[off + 1] = 250; raw[off + 2] = 251; // gray-50
      }
    }
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const [r, g, b] = [79, 70, 229]; // indigo-600 #4f46e5
const pub = path.join(__dirname, '..', 'public');

fs.writeFileSync(path.join(pub, 'icon-192.png'), solidRoundedPNG(192, r, g, b));
fs.writeFileSync(path.join(pub, 'icon-512.png'), solidRoundedPNG(512, r, g, b));
fs.writeFileSync(path.join(pub, 'apple-touch-icon.png'), solidRoundedPNG(180, r, g, b));
console.log('✓ icons generated: icon-192.png, icon-512.png, apple-touch-icon.png');
