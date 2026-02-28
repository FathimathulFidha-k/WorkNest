const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found in project root. Copy .env.example -> .env and fill values.');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const vars = {};
content.split(/\r?\n/).forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const idx = line.indexOf('=');
  if (idx === -1) return;
  const key = line.slice(0, idx);
  let val = line.slice(idx + 1);
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  vars[key] = val;
});

const cfg = {
  apiKey: vars.FIREBASE_API_KEY || '',
  authDomain: vars.FIREBASE_AUTH_DOMAIN || '',
  projectId: vars.FIREBASE_PROJECT_ID || '',
  storageBucket: vars.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: vars.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: vars.FIREBASE_APP_ID || '',
  measurementId: vars.FIREBASE_MEASUREMENT_ID || ''
};

const out = 'window.__FIREBASE_CONFIG__ = ' + JSON.stringify(cfg, null, 2) + ';\n';
fs.writeFileSync(path.join(process.cwd(), 'firebase-config.js'), out, 'utf8');
console.log('Generated firebase-config.js');
