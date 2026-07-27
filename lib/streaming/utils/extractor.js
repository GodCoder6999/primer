export function parseRegex(html, pattern, index = 1) {
  const match = html.match(pattern);
  return match ? match[index] : null;
}

export function decodeBase64(str) {
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

export function formatStream({ providerName, title, url, quality = '1080p', type = 'hls', headers = {} }) {
  return {
    provider: providerName,
    name: title,
    title: `${title} [${quality}]`,
    type, // 'hls' or 'http_range'
    url,
    headers
  };
}
