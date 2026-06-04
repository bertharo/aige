const fs = require('fs');
const path = require('path');

const id =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  `local-${Date.now().toString(36)}`;

const out = path.join(__dirname, '..', 'src', 'buildInfo.js');
fs.writeFileSync(
  out,
  `// Generated at build — used to bust stale PWA caches\nexport const BUILD_ID = '${id}';\n`
);
console.log('[build] BUILD_ID =', id);
