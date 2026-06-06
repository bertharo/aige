const fs = require('fs');
const path = require('path');

const id =
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.GITHUB_SHA ||
  `local-${Date.now().toString(36)}`;

const root = path.join(__dirname, '..');

fs.writeFileSync(
  path.join(root, 'src', 'buildInfo.js'),
  `// Generated at build — used to bust stale PWA caches\nexport const BUILD_ID = '${id}';\n`
);

fs.writeFileSync(path.join(root, 'public', 'build-id.json'), JSON.stringify({ buildId: id }));

console.log('[build] BUILD_ID =', id);
