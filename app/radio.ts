export interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  favicon?: string;
  country?: string;
  tags?: string;
  votes?: number;
  bitrate?: number;
}

export const CATEGORIES = [
  { id: 'lofi', label: 'Lofi', emoji: '🎧' },
  { id: 'jazz', label: 'Jazz', emoji: '🎷' },
  { id: 'chill', label: 'Chill', emoji: '😌' },
  { id: 'ambient', label: 'Ambient', emoji: '🌙' },
  { id: 'electronic', label: 'Electronic', emoji: '🎹' },
  { id: 'classical', label: 'Classical', emoji: '🎻' },
  { id: 'pop', label: 'Pop', emoji: '🎤' },
  { id: 'rock', label: 'Rock', emoji: '🎸' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

// More reliable API servers with fallback
const API_SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://de2.api.radio-browser.info', 
  'https://fi1.api.radio-browser.info',
];

async function fetchWithFallback(path: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  // Try each server until one works
  for (let i = 0; i < API_SERVERS.length; i++) {
    const server = API_SERVERS[i];
    try {
      const res = await fetch(`${server}${path}`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BaseRadio/1.0',
        },
      });
      
      if (res.ok) {
        clearTimeout(timeoutId);
        return res;
      }
    } catch (error) {
      console.warn(`Server ${server} failed, trying next...`);
      // Continue to next server
    }
  }

  clearTimeout(timeoutId);
  throw new Error('All API servers failed');
}

export async function fetchStationsByCategory(
  category: CategoryId,
  limit: number = 20,
  offset: number = 0
): Promise<RadioStation[]> {
  try {
    const path = `/json/stations/search?tag=${category}&limit=${limit}&offset=${offset}&hidebroken=true&order=votes&reverse=true`;
    const res = await fetchWithFallback(path);
    return res.json();
  } catch (error) {
    console.error('Radio fetch error:', error);
    return [];
  }
}

export async function searchStations(
  query: string,
  limit: number = 20
): Promise<RadioStation[]> {
  if (!query.trim()) return [];

  try {
    const path = `/json/stations/search?name=${encodeURIComponent(query)}&limit=${limit}&hidebroken=true&order=votes&reverse=true`;
    const res = await fetchWithFallback(path);
    return res.json();
  } catch (error) {
    console.error('Radio search error:', error);
    return [];
  }
}

// Keep the old function for backward compatibility
export async function fetchLofiStations(): Promise<RadioStation[]> {
  return fetchStationsByCategory('lofi', 10, 0);
}
