import manifest from './providers/manifest.json';
import * as vixsrc from './providers/vixsrc';

interface MediaQuery {
  type: string;
  tmdbId: string;
  season?: string;
  episode?: string;
}

const providerModules: Record<string, any> = {
  vixsrc,
};

export async function getCategory3Streams(query: MediaQuery) {
  const activeProviders = manifest.providers.filter(
    (p: any) => p.enabled && p.supportedTypes.includes(query.type)
  );

  const scrapePromises = activeProviders.map((provider: any) => {
    const module = providerModules[provider.id];
    if (module && typeof module.scrape === 'function') {
      return module.scrape(query).catch((err: Error) => {
        console.error(`Provider [${provider.id}] failed:`, err.message);
        return [];
      });
    }
    return Promise.resolve([]);
  });

  const results = await Promise.all(scrapePromises);
  return results.flat();
}
