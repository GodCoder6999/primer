import manifest from './providers/manifest.json';
import * as vixsrc from './providers/vixsrc.js';
import * as uhdmovies from './providers/uhdmovies.js';
import * as xprime from './providers/xprime.js';
import * as cuevana from './providers/cuevana.js';

const providerModules = {
  vixsrc,
  uhdmovies,
  xprime,
  cuevana
};

export async function getCategory3Streams(query) {
  const activeProviders = manifest.providers.filter(
    p => p.enabled && p.supportedTypes.includes(query.type)
  );

  const scrapePromises = activeProviders.map(provider => {
    const module = providerModules[provider.id];
    if (module && typeof module.scrape === 'function') {
      return module.scrape(query).catch(err => {
        console.error(`Provider [${provider.id}] failed:`, err.message);
        return [];
      });
    }
    return Promise.resolve([]);
  });

  const results = await Promise.all(scrapePromises);
  return results.flat();
}
