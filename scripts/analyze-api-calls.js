const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const appDir = path.join(process.cwd(), 'app');
const files = getAllFiles(appDir);

const calls = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const fetchRegex = /fetch\s*\(\s*['"`](.*?)['"`]/g;
    let match;
    while ((match = fetchRegex.exec(content)) !== null) {
        calls.push({
            file: path.relative(process.cwd(), file),
            endpoint: match[1]
        });
    }
});

console.log(JSON.stringify(calls, null, 2));
