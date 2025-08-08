const fs = require('fs');
const path = require('path');

const sortModules = (modules) => {
  const entries = Object.entries(modules);
  let normal = [];
  let custom = [];
  for (const [key, value] of entries) { value.custom === true ? custom.push([key, value]) : normal.push([key, value]); }
  if (custom.length > 0) normal = normal.concat(custom);
  return Object.fromEntries(normal);
}

const generateEntrypoints = ({isBuild = true, customPath = 'src', outputPath = '.vite', configPath = 'vendor.config.json'}) => {
  if (!configPath.endsWith('.json')) throw new Error('configPath must be a json file');
  configPath = path.resolve(__dirname, configPath);
  outputPath = path.resolve(__dirname, outputPath);
  const raw = fs.readFileSync(configPath, 'utf-8');
  const { globalVar, modules } = JSON.parse(raw);
  const varName = globalVar && globalVar.trim() ? globalVar : '';
  const jsLines = [varName ? `window.${varName} = window.${varName} || {};` : ''].filter(Boolean);
  const cssLines = [];
  for (const [pkg, { script, style, alias, custom, nopack }] of Object.entries(sortModules(modules))) {
    if (nopack) continue;
    const scriptPath = custom ? path.relative(outputPath, path.resolve(customPath, script)).replace(/\\\\/g, '/').replace(/\\/g, '/') : script;
    jsLines.push(`import ${alias ? `* as ${pkg}` : pkg} from '${scriptPath}';`);
    jsLines.push(!!varName ? `window.${varName}['${pkg}'] = ${pkg};` : `window['${pkg}'] = ${pkg};`)
    const stylePath = custom ? path.relative(outputPath, path.resolve(customPath, style)).replace(/\\\\/g, '/').replace(/\\/g, '/') : style;
    if (style && isBuild) { jsLines.push(`import '${stylePath}';`) };
    if (style && !isBuild) { cssLines.push(`@import '${stylePath}';`) };
  }
  !isBuild && jsLines.push(`const G = ${varName ? `window.${varName}` : 'window'}; document.getElementById('output').innerText = JSON.stringify({ ${Object.keys(modules).map(k => `'${k}': typeof G['${k}'] !== 'undefined'`).join(',\n  ')} }, null, 2); `.trim());
  fs.mkdirSync(outputPath, { recursive: true });
  fs.writeFileSync(`${outputPath}/main.js`, jsLines.join('\n'));
  fs.writeFileSync(`${outputPath}/main.css`, cssLines.join('\n'));
  console.log(`${!isBuild ? '[开发模式]' : '[生产模式]'}`);
}

module.exports = generateEntrypoints;
