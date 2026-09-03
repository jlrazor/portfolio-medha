import fs from 'fs';
import path from 'path';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const MANIFEST_PATH = 'data/images.json';
const IMAGES_DIR = 'images';

if (!TOKEN || !CHANNEL_ID) {
  console.error('❌ Il manque DISCORD_BOT_TOKEN ou DISCORD_CHANNEL_ID dans les secrets du repo.');
  process.exit(1);
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) return [];
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf-8').trim();
  return raw ? JSON.parse(raw) : [];
}

function saveManifest(data) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2));
}

async function fetchMessages() {
  const url = `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=100`;
  const res = await fetch(url, {
    headers: { Authorization: `Bot ${TOKEN}` }
  });
  if (!res.ok) {
    throw new Error(`Erreur API Discord: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function main() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  const manifest = loadManifest();
  const knownIds = new Set(manifest.map(item => item.attachmentId));

  const messages = await fetchMessages();
  messages.reverse(); // du plus ancien au plus récent

  let added = 0;
  for (const msg of messages) {
    if (!msg.attachments || msg.attachments.length === 0) continue;

    for (const att of msg.attachments) {
      const isImage = att.content_type && att.content_type.startsWith('image/');
      if (!isImage) continue;
      if (knownIds.has(att.id)) continue;

      const ext = path.extname(att.filename) || '.jpg';
      const localName = `${msg.id}_${att.id}${ext}`;
      const destPath = path.join(IMAGES_DIR, localName);

      console.log(`⬇️  Téléchargement: ${att.filename}`);
      await downloadImage(att.url, destPath);

      manifest.push({
        attachmentId: att.id,
        messageId: msg.id,
        filename: localName,
        caption: msg.content || '',
        timestamp: msg.timestamp
      });
      knownIds.add(att.id);
      added++;
    }
  }

  if (added > 0) {
    manifest.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    saveManifest(manifest);
    console.log(`✅ ${added} nouvelle(s) image(s) ajoutée(s) au portfolio.`);
  } else {
    console.log('ℹ️  Aucune nouvelle image trouvée.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
