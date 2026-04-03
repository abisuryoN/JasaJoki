const fs = require('fs');
const path = require('path');

const dirs = [
    path.join(__dirname, 'frontend/src'),
    path.join(__dirname, 'frontend')
];

let replacedFiles = 0;

function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist') walk(fullPath);
        } else {
            if (/\.(jsx|js|html|css|json|php)$/.test(file)) {
                let content = fs.readFileSync(fullPath, 'utf8');
                if (content.includes('JasaJoki') || content.includes('jasajoki')) {
                    content = content.replace(/JasaJoki/g, 'DualCode').replace(/jasajoki/g, 'dualcode');
                    fs.writeFileSync(fullPath, content, 'utf8');
                    replacedFiles++;
                }
            }
        }
    }
}

dirs.forEach(walk);

// Also do env
const envPath = path.join(__dirname, 'backend/.env');
if(fs.existsSync(envPath)){
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('JasaJoki')) {
        envContent = envContent.replace(/JasaJoki/g, 'DualCode');
        fs.writeFileSync(envPath, envContent, 'utf8');
    }
}

console.log('Replaced in ' + replacedFiles + ' files.');
