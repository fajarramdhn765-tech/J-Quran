import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // Buffer for raw scanlines: each row = 1 filter byte (0) + width * 4 bytes RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.42 : width * 0.46;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default Emerald background: #064B32 (6, 75, 50)
      let r = 6, g = 75, b = 50, a = 255;

      // Darker emerald gradient towards bottom
      const grad = (y / height) * 0.35;
      r = Math.max(3, Math.round(r * (1 - grad)));
      g = Math.max(38, Math.round(g * (1 - grad)));
      b = Math.max(25, Math.round(b * (1 - grad)));

      // Subtle gold outer ring
      const ringDist = Math.abs(dist - width * 0.38);
      if (ringDist < 2.5) {
        r = 233; g = 185; b = 73; // #E9B949
      }

      // Crescent & Star in upper center (cy - width * 0.18)
      const cdx = x - cx;
      const cdy = y - (cy - width * 0.16);
      const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
      const cdist2 = Math.sqrt((cdx - width * 0.04) * (cdx - width * 0.04) + (cdy + width * 0.02) * (cdy + width * 0.02));
      if (cdist < width * 0.10 && cdist2 > width * 0.08) {
        r = 233; g = 185; b = 73; // Gold crescent
      }
      // Star
      const sdx = x - (cx + width * 0.06);
      const sdy = y - (cy - width * 0.18);
      if (Math.abs(sdx) + Math.abs(sdy) < width * 0.035) {
        r = 252; g = 230; b = 138;
      }

      // Quran Book in lower center
      const by = y - (cy + width * 0.12);
      const bx = Math.abs(x - cx);
      // Pages
      if (by >= -width * 0.12 && by <= width * 0.12 && bx >= width * 0.02 && bx <= width * 0.28) {
        const pageCurve = Math.sin((bx / (width * 0.28)) * Math.PI) * (width * 0.04);
        if (by >= -width * 0.10 + pageCurve && by <= width * 0.08 + pageCurve) {
          r = 255; g = 253; b = 245; // Ivory pages
        }
      }
      // Center Gold Spine
      if (bx <= width * 0.025 && by >= -width * 0.10 && by <= width * 0.18) {
        r = 233; g = 185; b = 73;
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressedData = zlib.deflateSync(rawData);

  // PNG structure
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

if (!fs.existsSync('public')) fs.mkdirSync('public', { recursive: true });

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180));
fs.writeFileSync('public/favicon.ico', createPNG(32, 32));

console.log('Successfully generated PWA and Apple Touch PNG icons!');
