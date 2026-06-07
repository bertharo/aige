const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const en = require(path.join(localesDir, 'en.js'));
const enKeys = Object.keys(en.default || en).sort();

const files = fs.readdirSync(localesDir).filter((f) => f.endsWith('.js') && f !== 'en.js');
let ok = true;

for (const file of files) {
  const mod = require(path.join(localesDir, file));
  const keys = Object.keys(mod.default || mod).sort();
  const missing = enKeys.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !enKeys.includes(k));
  if (missing.length || extra.length) {
    ok = false;
    console.error(`\n${file}:`);
    if (missing.length) console.error('  missing:', missing.join(', '));
    if (extra.length) console.error('  extra:', extra.join(', '));
  } else {
    console.log(`✓ ${file} (${keys.length} keys)`);
  }
}

console.log(`\nEnglish: ${enKeys.length} keys`);
process.exit(ok ? 0 : 1);
