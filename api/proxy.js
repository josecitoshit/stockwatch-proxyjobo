export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });
  try {
    const decoded = decodeURIComponent(url);
    const isYahoo = decoded.includes('yahoo.com');

    let cookie = '';
    if (isYahoo) {
      try {
        const crumb = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
          }
        });
        const setCookie = crumb.headers.get('set-cookie') || '';
        cookie = setCookie.split(';')[0];
      } catch(e) {}
    }

    const response = await fetch(decoded, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        ...(cookie ? { 'Cookie': cookie } : {}),
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
