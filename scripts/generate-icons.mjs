/**
 * Script untuk membuat icon PWA & Favicon dari assets/icons/source-logo.png
 * Jalankan: npm run icons atau node scripts/generate-icons.mjs
 * Membutuhkan: sharp (dan png-to-ico opsional jika membuat .ico)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourceFile = path.join(rootDir, 'public', 'assets', 'icons', 'source-logo.png');
const outDir = path.join(rootDir, 'public', 'assets', 'icons');

async function generate() {
  if (!fs.existsSync(sourceFile)) {
    console.error(`Source logo tidak ditemukan di: ${sourceFile}`);
    console.log('Silakan letakkan gambar PNG logo (minimal 512x512) di lokasi tersebut.');
    process.exit(1);
  }

  let sharp;
  try {
    const sharpModule = await import('sharp');
    sharp = sharpModule.default;
  } catch {
    console.warn('Modul "sharp" belum terpasang. Anda dapat memasang dengan: npm i -D sharp png-to-ico');
    console.log('Atau gunakan layanan online seperti PWABuilder Image Generator atau RealFaviconGenerator.');
    return;
  }

  console.log('Memproses icon dari:', sourceFile);
  fs.mkdirSync(outDir, { recursive: true });

  const sizes = [
    { name: 'favicon-16.png', size: 16 },
    { name: 'favicon-32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180, bg: '#0D9488' },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
  ];

  for (const item of sizes) {
    let pipeline = sharp(sourceFile).resize(item.size, item.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
    if (item.bg) {
      pipeline = sharp(sourceFile)
        .resize(item.size, item.size, { fit: 'contain' })
        .flatten({ background: item.bg });
    }
    const dest = path.join(outDir, item.name);
    await pipeline.png().toFile(dest);
    console.log(`✓ Dibuat: ${item.name} (${item.size}x${item.size})`);
  }

  // Maskable 512: logo ~65% di tengah dengan background solid teal
  const maskableSize = 512;
  const logoInnerSize = Math.round(maskableSize * 0.65);
  const innerBuffer = await sharp(sourceFile)
    .resize(logoInnerSize, logoInnerSize, { fit: 'contain' })
    .toBuffer();

  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: { r: 13, g: 148, b: 136, alpha: 1 } // #0D9488
    }
  })
    .composite([{ input: innerBuffer, gravity: 'center' }])
    .png()
    .toFile(path.join(outDir, 'maskable-512.png'));
  console.log('✓ Dibuat: maskable-512.png (padded 65% solid background)');

  console.log('\nSemua icon PWA berhasil digenerate ke public/assets/icons/!');
}

generate().catch(err => {
  console.error('Gagal membuat icon:', err);
});
