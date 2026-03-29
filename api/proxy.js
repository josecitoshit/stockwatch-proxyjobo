export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });
  try {
    const decoded = decodeURIComponent(url);
    const isFinviz = decoded.includes('finviz.com');
    const response = await fetch(decoded, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': isFinviz
          ? 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          : 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return res.status(response.status).json({ error: `Upstream error: ${response.status}` });
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const data = await response.json();
      return res.status(200).json(data);
    }
    const text = await response.text();
    return res.status(200).json(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
