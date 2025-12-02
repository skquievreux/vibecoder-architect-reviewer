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

console.log('🚀 Starting Image Optimization Process...');

try {
    const images = scanImages(publicDir);
    console.log(`Found ${images.length} images in public directory.`);

    // Placeholder for actual optimization logic (e.g. using sharp or imagemin)
    // For now, we just verify they exist and are readable

    let errors = 0;
    for (const img of images) {
        try {
            fs.accessSync(img, fs.constants.R_OK);
            // console.log(`✅ Verified: ${path.relative(publicDir, img)}`);
        } catch (e) {
            console.error(`❌ Error accessing image: ${img}`);
            errors++;
        }
    }

    if (errors > 0) {
        console.warn(`⚠️ Found ${errors} issues with images.`);
        // process.exit(1); // Uncomment to fail build on error
    } else {
        console.log('✅ All images verified successfully.');
    }

} catch (error) {
    console.error('❌ Image process failed:', error);
    process.exit(1);
}
