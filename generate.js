const fs = require('fs');
const path = require('path');

function generateEntrypoints(isBuild = true) {
  const configPath = path.resolve(__dirname, 'vendor.config.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  const { globalVar = 'x', modules } = JSON.parse(raw);
  const jsLines = [`window.${globalVar} = window.${globalVar} || {};`];
  const cssLines = [];
  for (const [pkg, { script, style, alias, custom, nopack }] of Object.entries(modules)) {
    if (nopack) continue;
    const scriptPath = custom ? `../src/${script}` : script;
    if (alias) {
      jsLines.push(`import * as ${pkg} from '${scriptPath}';`);
    } else {
      jsLines.push(`import ${pkg} from '${scriptPath}';`);
    }
    jsLines.push(`window.${globalVar}['${pkg}'] = ${pkg};`);
    const stylePath = custom ? `../src/${style}` : style;
    if (style && isBuild) { jsLines.push(`import '${stylePath}';`) };
    if (style && !isBuild) { cssLines.push(`@import '${stylePath}';`) };
  }
  if (!isBuild) { jsLines.push(`const G = window.${globalVar}; document.getElementById('output').innerText = JSON.stringify({ ${Object.keys(modules).map(k => `'${k}': typeof G['${k}'] !== 'undefined'`).join(',\n  ')} }, null, 2); `.trim()); }
  fs.mkdirSync('./.vite', { recursive: true });
  fs.writeFileSync('./.vite/main.js', jsLines.join('\n'));
  fs.writeFileSync('./.vite/main.css', cssLines.join('\n'));
  console.log(`${!isBuild ? '[开发模式]' : '[生产模式]'}`);
}

module.exports = generateEntrypoints;
