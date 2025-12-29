const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const extensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];

function scanImages(dir) {
    if (!fs.existsSync(dir)) return [];

    let images = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            images = images.concat(scanImages(filePath));
        } else {
            const ext = path.extname(file).toLowerCase();
            if (extensions.includes(ext)) {
                images.push(filePath);
            }
        }
    }
    return images;
}

const sharp = require('sharp');

async function optimizeImage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, ext);
    const tmpPath = path.join(dir, `${baseName}.tmp${ext}`);

    try {
        if (ext === '.svg') {
            // For now, SVG optimization is just verification
            return true;
        }

        const image = sharp(filePath);
        const metadata = await image.metadata();

        // Skip if already small enough
        const stats = fs.statSync(filePath);
        if (stats.size < 50000) return true;

        if (ext === '.jpg' || ext === '.jpeg') {
            await image.jpeg({ quality: 80, mozjpeg: true }).toFile(tmpPath);
        } else if (ext === '.png') {
            await image.png({ quality: 80, compressionLevel: 9 }).toFile(tmpPath);
        } else if (ext === '.webp') {
            await image.webp({ quality: 80 }).toFile(tmpPath);
        } else {
            return true;
        }

        // Compare sizes
        const oldSize = stats.size;
        const newSize = fs.statSync(tmpPath).size;

        if (newSize < oldSize) {
            fs.renameSync(tmpPath, filePath);
            console.log(`✅ Optimized: ${path.relative(publicDir, filePath)} (${(oldSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB)`);
        } else {
            fs.unlinkSync(tmpPath);
            // console.log(`ℹ️ No size reduction: ${path.relative(publicDir, filePath)}`);
        }
        return true;
    } catch (e) {
        console.error(`❌ Error optimizing image: ${filePath}`, e.message);
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        return false;
    }
}

console.log('🚀 Starting Image Optimization Process...');

async function run() {
    try {
        const images = scanImages(publicDir);
        console.log(`Found ${images.length} images in public directory.`);

        let successCount = 0;
        let errorCount = 0;

        for (const img of images) {
            const success = await optimizeImage(img);
            if (success) successCount++;
            else errorCount++;
        }

        if (errorCount > 0) {
            console.warn(`⚠️ Found ${errorCount} issues during image optimization.`);
        } else {
            console.log(`✅ Successfully processed ${successCount} images.`);
        }

    } catch (error) {
        console.error('❌ Image process failed:', error);
        process.exit(1);
    }
}

run();
