const fs = require('fs');
const path = require('path');

const target = '/home/ladmin/Desktop/GIT/youtube-landing-page';

function list(dir, depth = 0) {
    if (depth > 2) return;
    try {
        const files = fs.readdirSync(dir);
        for (const f of files) {
            console.log('  '.repeat(depth) + f);
            if (fs.lstatSync(path.join(dir, f)).isDirectory()) {
                list(path.join(dir, f), depth + 1);
            }
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}

console.log('Structure of youtube-landing-page:');
list(target);
