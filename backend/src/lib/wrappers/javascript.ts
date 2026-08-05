export function getJavascriptWrapper(code: string): string {
  return `
${code}

const fs = require('fs');
function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    let args;
    try {
        args = JSON.parse('[' + input + ']');
    } catch (e) {
        args = [input];
    }
    const result = solve(...args);
    if (typeof result === 'string') {
        console.log(result);
    } else if (result !== undefined) {
        console.log(JSON.stringify(result));
    }
}
main();
`;
}
