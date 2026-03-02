const fs = require('fs');
const path = require('path');

function replaceConsoleLog(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory() && file.name !== 'node_modules' && file.name !== 'dist' && file.name !== '.git') {
            replaceConsoleLog(fullPath);
        } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const oldContent = content;
            // Replace console.log with console.error everywhere
            content = content.replace(/\bconsole\.log\b/g, 'console.error');
            // Revert intentional string checks like code.includes('console.error') in QualityValidator.ts
            content = content.replace(/code\.includes\('console\.error'\)/g, "code.includes('console.log')");
            if (oldContent !== content) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.error('Updated ' + fullPath);
            }
        }
    }
}
replaceConsoleLog(path.join(__dirname, 'src'));
