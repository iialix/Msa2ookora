/**
 * Image Optimization Script
 * Converts all PNG images in public/ to WebP format with size constraints.
 * 
 * Usage: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import { readdir, mkdir, copyFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PUBLIC_DIR = join(__dirname, '..', 'public');
const ORIGINALS_DIR = join(PUBLIC_DIR, 'originals');

// Size config per image type
const SIZES = {
    logo: { width: 300, height: null },       // Logo: keep aspect, max 300px wide
    favicon: { width: 64, height: 64 },       // Favicon: small
    hero_background: { width: 1920, height: null }, // Hero: full width
    default: { width: 800, height: null },     // Game cards: max 800px wide
};

function getConfig(filename) {
    const name = basename(filename, extname(filename)).toLowerCase();
    if (name === 'logo') return SIZES.logo;
    if (name === 'favicon') return SIZES.favicon;
    if (name === 'hero_background') return SIZES.hero_background;
    return SIZES.default;
}

async function optimizeImages() {
    console.log('🔧 Starting image optimization...\n');

    // Create originals backup dir
    try {
        await mkdir(ORIGINALS_DIR, { recursive: true });
    } catch {}

    // Get all PNG files
    const files = await readdir(PUBLIC_DIR);
    const pngFiles = files.filter(f => extname(f).toLowerCase() === '.png');

    console.log(`Found ${pngFiles.length} PNG files to convert:\n`);

    let totalOriginal = 0;
    let totalOptimized = 0;

    for (const file of pngFiles) {
        const inputPath = join(PUBLIC_DIR, file);
        const outputName = basename(file, '.png') + '.webp';
        // Preserve original casing for the WebP filename
        const outputPath = join(PUBLIC_DIR, outputName);
        const backupPath = join(ORIGINALS_DIR, file);

        const config = getConfig(file);

        try {
            // Get original size
            const metadata = await sharp(inputPath).metadata();
            const originalSize = metadata.size || 0;

            // Backup original
            await copyFile(inputPath, backupPath);

            // Convert to WebP
            let pipeline = sharp(inputPath);

            // Resize if needed
            if (config.width || config.height) {
                pipeline = pipeline.resize({
                    width: config.width,
                    height: config.height,
                    fit: 'inside',
                    withoutEnlargement: true,
                });
            }

            // Convert to WebP
            const result = await pipeline
                .webp({ quality: 80, effort: 6 })
                .toFile(outputPath);

            const savings = ((1 - result.size / (metadata.size || result.size)) * 100).toFixed(1);
            totalOriginal += metadata.size || 0;
            totalOptimized += result.size;

            console.log(
                `  ✅ ${file} → ${outputName}` +
                `  (${formatSize(metadata.size)} → ${formatSize(result.size)}, -${savings}%)`
            );
        } catch (err) {
            console.error(`  ❌ Failed to convert ${file}: ${err.message}`);
        }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`📊 Total: ${formatSize(totalOriginal)} → ${formatSize(totalOptimized)}`);
    console.log(`💾 Saved: ${formatSize(totalOriginal - totalOptimized)} (${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%)`);
    console.log(`📁 Originals backed up to: public/originals/`);
    console.log('\n✨ Done! All images optimized.');
}

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

optimizeImages().catch(console.error);
