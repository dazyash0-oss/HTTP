const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const ITEMS_FILE = path.join(DATA_DIR, 'items.json');

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(ITEMS_FILE);
  } catch {
    const seedData = [
      { id: 1, title: 'First item saved with fs/promises', createdAt: new Date().toISOString() }
    ];
    await fs.writeFile(ITEMS_FILE, JSON.stringify(seedData, null, 2), 'utf8');
  }
}

async function readItems() {
  const content = await fs.readFile(ITEMS_FILE, 'utf8');
  return JSON.parse(content);
}

async function writeItems(items) {
  await fs.writeFile(ITEMS_FILE, JSON.stringify(items, null, 2), 'utf8');
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > 1024 * 1024) {
        reject(new Error('Request body exceeds 1MB limit'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });

    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || `localhost:${PORT}`}`);
  const { pathname } = parsedUrl;
  const { method } = req;

  try {
    if (method === 'GET' && pathname === '/') {
      return sendJson(res, 200, {
        status: 'ok',
        message: 'Basic Node.js HTTP server is running',
        routes: ['GET /', 'GET /items', 'POST /items']
      });
    }

    if (method === 'GET' && pathname === '/items') {
      const items = await readItems();
      return sendJson(res, 200, { count: items.length, items });
    }

    if (method === 'POST' && pathname === '/items') {
      const rawBody = await readRequestBody(req);
      let body;
      try {
        body = JSON.parse(rawBody || '{}');
      } catch {
        return sendJson(res, 400, { error: 'Invalid JSON payload' });
      }

      if (typeof body.title !== 'string' || !body.title.trim()) {
        return sendJson(res, 400, { error: '"title" is required and must be a non-empty string' });
      }

      const items = await readItems();
      const nextId = items.length ? Math.max(...items.map((item) => item.id)) + 1 : 1;
      const newItem = {
        id: nextId,
        title: body.title.trim(),
        createdAt: new Date().toISOString()
      };

      items.push(newItem);
      await writeItems(items);

      return sendJson(res, 201, { message: 'Item created', item: newItem });
    }

    return sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error('Unhandled request error:', err);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
});

ensureDataFile()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Startup failed:', err);
    process.exit(1);
  });