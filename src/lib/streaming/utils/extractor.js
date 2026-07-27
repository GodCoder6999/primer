export function parseRegex(text, pattern, groupIndex = 1) {
  const match = text.match(pattern);
  return match ? match[groupIndex] : null;
}

export function formatStream({ providerName, title, url, quality = '1080p', type = 'hls', headers = {} }) {
  return {
    provider: providerName,
    name: title,
    title: `${title} [${quality}]`,
    type,
    url,
    headers
  };
}
