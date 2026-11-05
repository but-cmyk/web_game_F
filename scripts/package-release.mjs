/**
 * Standalone Release Packager for DEEPER (§5 M11, §7 Release Gates).
 * Packages the production distribution directory (dist/) into an itch.io-compatible
 * standalone HTML5 zip bundle (release/deeper-v0.1.0-itch.zip).
 *
 * Enforces the <= 5 MB size budget. Zero third-party dependencies (uses node:zlib and node:fs).
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const releaseDir = path.join(rootDir, 'release');
const outputZip = path.join(releaseDir, 'deeper-v0.1.0-itch.zip');
const MAX_BUNDLE_BYTES = 5 * 1024 * 1024; // 5 MB

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (Math.floor(date.getSeconds() / 2));
  return { dosDate, dosTime };
}

function getAllFiles(dir, base = '') {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath, relPath));
    } else {
      results.push({ fullPath, relPath });
    }
  }
  return results;
}

function createZipArchive(files, destPath) {
  const localHeaders = [];
  const centralHeaders = [];
  let currentOffset = 0;
  const { dosDate, dosTime } = dosDateTime();

  for (const file of files) {
    const rawData = fs.readFileSync(file.fullPath);
    const uncompressedSize = rawData.length;
    const crc = zlib.crc32(rawData);

    // Deflate compression
    const compressedData = zlib.deflateRawSync(rawData, { level: 9 });
    const compressedSize = compressedData.length;

    const fileNameBuffer = Buffer.from(file.relPath, 'utf8');
    const fileNameLength = fileNameBuffer.length;

    // Local file header (30 bytes + fileNameLength + compressedSize)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // Local header signature
    localHeader.writeUInt16LE(20, 4);         // Version needed: 2.0
    localHeader.writeUInt16LE(0, 6);          // Flags
    localHeader.writeUInt16LE(8, 8);          // Compression method: 8 (Deflate)
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(fileNameLength, 26);
    localHeader.writeUInt16LE(0, 28);         // Extra field length

    const localChunk = Buffer.concat([localHeader, fileNameBuffer, compressedData]);
    localHeaders.push(localChunk);

    // Central directory header (46 bytes + fileNameLength)
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); // Central header signature
    centralHeader.writeUInt16LE(20, 4);         // Version made by: 2.0
    centralHeader.writeUInt16LE(20, 6);         // Version needed: 2.0
    centralHeader.writeUInt16LE(0, 8);          // Flags
    centralHeader.writeUInt16LE(8, 10);         // Compression: Deflate
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(fileNameLength, 28);
    centralHeader.writeUInt16LE(0, 30);         // Extra field length
    centralHeader.writeUInt16LE(0, 32);         // File comment length
    centralHeader.writeUInt16LE(0, 34);         // Disk number start
    centralHeader.writeUInt16LE(0, 36);         // Internal attributes
    centralHeader.writeUInt32LE(0, 38);         // External attributes
    centralHeader.writeUInt32LE(currentOffset, 42); // Relative offset of local header

    const centralChunk = Buffer.concat([centralHeader, fileNameBuffer]);
    centralHeaders.push(centralChunk);

    currentOffset += localChunk.length;
  }

  const centralDirOffset = currentOffset;
  const centralDirBuffer = Buffer.concat(centralHeaders);
  const centralDirSize = centralDirBuffer.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);          // EOCD signature
  eocd.writeUInt16LE(0, 4);                   // Disk number
  eocd.writeUInt16LE(0, 6);                   // Disk with central dir
  eocd.writeUInt16LE(files.length, 8);        // Total entries this disk
  eocd.writeUInt16LE(files.length, 10);       // Total entries
  eocd.writeUInt32LE(centralDirSize, 12);     // Size of central dir
  eocd.writeUInt32LE(centralDirOffset, 16);   // Offset of central dir
  eocd.writeUInt16LE(0, 20);                  // Comment length

  const finalZipBuffer = Buffer.concat([...localHeaders, centralDirBuffer, eocd]);
  fs.writeFileSync(destPath, finalZipBuffer);
  return finalZipBuffer.length;
}

export function packageRelease() {
  console.log('=== DEEPER Release Packaging (M11) ===');

  // Step 1: Clean build
  console.log('Building production bundle...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });

  if (!fs.existsSync(distDir)) {
    throw new Error('dist/ directory not found after build!');
  }

  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
  }

  // Step 2: Gather files
  const files = getAllFiles(distDir);
  console.log(`Gathered ${files.length} build files from dist/:`);
  let totalRawBytes = 0;
  for (const f of files) {
    const sz = fs.statSync(f.fullPath).size;
    totalRawBytes += sz;
    console.log(` - ${f.relPath} (${(sz / 1024).toFixed(1)} KB)`);
  }

  // Ensure index.html exists at root of bundle (itch.io requirement)
  const hasIndexHtml = files.some((f) => f.relPath === 'index.html');
  if (!hasIndexHtml) {
    throw new Error('Release package must contain index.html at root level for itch.io compatibility!');
  }

  // Step 3: Create ZIP archive
  console.log(`Packaging to ${outputZip}...`);
  const zipBytes = createZipArchive(files, outputZip);
  const zipKb = (zipBytes / 1024).toFixed(1);
  const rawKb = (totalRawBytes / 1024).toFixed(1);
  const compressionRatio = ((1 - zipBytes / totalRawBytes) * 100).toFixed(1);

  console.log('\n=== Package Summary ===');
  console.log(`Uncompressed: ${rawKb} KB`);
  console.log(`Packaged Zip: ${zipKb} KB (-${compressionRatio}%)`);
  console.log(`Budget Limit: 5120 KB (5 MB)`);

  if (zipBytes > MAX_BUNDLE_BYTES) {
    throw new Error(`Package size (${zipKb} KB) exceeds the 5 MB budget limit!`);
  }

  console.log('✓ PASS: Release package is within the 5 MB budget limit.');
  console.log(`✓ Output: ${outputZip}`);
}

// Execute if run as CLI
if (process.argv[1] && process.argv[1].endsWith('package-release.mjs')) {
  packageRelease();
}
