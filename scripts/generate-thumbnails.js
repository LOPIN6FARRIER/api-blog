#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

function parseArgs() {
  const args = {};
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = raw[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

async function walk(dir, exts) {
  let entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const sub = await walk(full, exts);
      files.push(...sub);
    } else if (e.isFile()) {
      const lower = e.name.toLowerCase();
      if (exts.some(ext => lower.endsWith(ext))) files.push(full);
    }
  }
  return files;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const args = parseArgs();
  const imagesDir = args.src || process.env.IMAGES_DIR || '/var/www/vinicio_blog/images';
  const outSub = args.outSub || 'thumbs';
  const width = Number(args.width || process.env.THUMB_WIDTH || 400);
  const height = Number(args.height || process.env.THUMB_HEIGHT || 300);
  const quality = Number(args.quality || 80);
  const concurrency = Number(args.concurrency || 4);
  const force = args.force === 'true' || args.force === true || false;

  const outDir = path.join(imagesDir, outSub);
  console.log('imagesDir:', imagesDir);
  console.log('outDir:', outDir);
  console.log(`thumb size: ${width}x${height}, quality: ${quality}, concurrency: ${concurrency}, force: ${force}`);

  const exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.avif'];
  const allFiles = await walk(imagesDir, exts);
  // exclude anything inside the output directory
  const files = allFiles.filter(f => !path.normalize(f).startsWith(path.normalize(outDir) + path.sep));

  console.log(`found ${files.length} image files`);
  await ensureDir(outDir);

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  // process in batches to limit concurrency
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    await Promise.all(batch.map(async (file) => {
      try {
        const rel = path.relative(imagesDir, file);
        const destPath = path.join(outDir, rel);
        const destDir = path.dirname(destPath);
        await ensureDir(destDir);

        // change extension to .jpg for thumbnails
        const destExt = '.jpg';
        const destFile = path.join(destDir, path.basename(destPath, path.extname(destPath)) + destExt);

        try {
          if (!force) {
            await fs.access(destFile);
            skipped++;
            return;
          }
        } catch (_) {
          // doesn't exist -> continue
        }

        await sharp(file)
          .resize(width, height, { fit: 'cover' })
          .jpeg({ quality })
          .toFile(destFile);

        processed++;
        console.log('thumb ->', destFile);
      } catch (err) {
        failed++;
        console.error('failed ->', file, err.message || err);
      }
    }));
  }

  console.log(`done. processed=${processed} skipped=${skipped} failed=${failed}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
