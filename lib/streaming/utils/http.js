import fetch from 'node-fetch';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

export async function makeRequest(url, options = {}) {
  const headers = {
    ...DEFAULT_HEADERS,
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body || null,
    timeout: options.timeout || 10000
  });

  if (!response.ok) {
    throw new Error(`Upstream fetch failed with status ${response.status} for ${url}`);
  }

  return response;
}

export async function fetchHtml(url, headers = {}) {
  const res = await makeRequest(url, { headers });
  return await res.text();
}

export async function fetchJson(url, headers = {}) {
  const res = await makeRequest(url, { headers });
  return await res.json();
}
