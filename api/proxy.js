export default async function handler(req, res) {
  const origin = req.headers.origin || req.headers.referer || '';
  
  // Log temporal para diagnóstico
  console.log('ORIGIN:', origin);
  console.log('ALL HEADERS:', JSON.stringify(req.headers));

  const ALLOWED_ORIGINS = [
    'https://josecitoshit.github.io',
    'http://localhost',
    'http://127.0.0.1',
  ];
  const allowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) || !origin;
  if (!allowed) {
    return res.status(403).json({ error: 'Forbidden: origin not allowed', receivedOrigin: origin });
  }
  res.setHeader('Access-Control-Allow-Origin', 'https://josecitoshit.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });
  try {
    const response = await fetch(decodeURIComponent(url), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return res.status(response.status).json({ error: `Upstream error: ${response.status}` });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
