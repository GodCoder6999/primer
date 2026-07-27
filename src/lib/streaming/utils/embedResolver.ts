import { fetchHtml } from './http';
import { parseRegex } from './extractor';

export async function resolveEmbedToHls(embedUrl: string): Promise<string | null> {
  try {
    const host = new URL(embedUrl).origin;
    const html = await fetchHtml(embedUrl, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Referer': host,
    });

    // Strategy 1: Direct .m3u8 regex pattern match in standard script tags
    let m3u8Url = parseRegex(html, /file:\s*["'](https?:\/?[^"']+\.m3u8[^"']*)["']/i) ||
                  parseRegex(html, /source\s*:\s*["'](https?:\/?[^"']+\.m3u8[^"']*)["']/i) ||
                  parseRegex(html, /src:\s*["'](https?:\/?[^"']+\.m3u8[^"']*)["']/i);

    if (m3u8Url) {
      return m3u8Url.startsWith('//') ? `https:${m3u8Url}` : m3u8Url;
    }

    // Strategy 2: Check for base64-encoded source payloads within player config objects
    const configMatch = html.match(/config\s*=\s*['"]([a-zA-Z0-9+/=]+)['"]/);
    if (configMatch && configMatch[1]) {
      try {
        const decodedConfig = Buffer.from(configMatch[1], 'base64').toString('utf8');
        const decodedMatch = decodedConfig.match(/(https?:\/\/[^\s"'#]+\.m3u8[^\s"'#]*)/i);
        if (decodedMatch) return decodedMatch[1];
      } catch {
        // Decoding failed, proceed to next strategy
      }
    }

    // Strategy 3: Deep search the entire HTML body for any raw .m3u8 endpoint string
    const fallbackMatch = html.match(/(https?:\/\/[^\s"'#]+\.m3u8[^\s"'#]*)/i);
    if (fallbackMatch && fallbackMatch[1]) {
      return fallbackMatch[1];
    }

    // Strategy 4: If it's a nested iframe, recursively fetch the inner source if possible
    const iframeMatch = parseRegex(html, /<iframe[^>]+src=["'](https?:\/\/[^"']+)["']/i);
    if (iframeMatch && iframeMatch !== embedUrl) {
      return await resolveEmbedToHls(iframeMatch);
    }

    return null;
  } catch (err: any) {
    console.warn(`[Embed Resolver Error]: ${err.message}`);
    return null;
  }
}
