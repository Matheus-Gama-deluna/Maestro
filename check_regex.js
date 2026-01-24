
const path = "/app/c:/Users/gamam/OneDrive/Documentos/1- TramposTec/teste";
const regex = /^\/app\/([a-zA-Z]:.*)$/;
const match = path.match(regex);

console.log("Path:", path);
console.log("Regex:", regex);
console.log("Match:", match);

if (match) {
    console.log("Captured group 1:", match[1]);
} else {
    console.log("No match.");
}

function normalizeProjectPath(p) {
    if (!p) return p;
    const winDriveMatch = p.match(/^\/app\/([a-zA-Z]:.*)$/);
    if (winDriveMatch) {
        return winDriveMatch[1];
    }
    if (p.startsWith('/app/')) {
        return p.replace(/^\/app\//, '/');
    }
    return p;
}

console.log("Normalized:", normalizeProjectPath(path));
