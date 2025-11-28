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

const API_SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
];

async function getApiServer(): Promise<string> {
  // Try to get a random working server
  const server = API_SERVERS[Math.floor(Math.random() * API_SERVERS.length)];
  return server;
}

export async function fetchStationsByCategory(
  category: CategoryId,
  limit: number = 20,
  offset: number = 0
): Promise<RadioStation[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const server = await getApiServer();
    const res = await fetch(
      `${server}/json/stations/search?tag=${category}&limit=${limit}&offset=${offset}&hidebroken=true&order=votes&reverse=true`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BaseRadio/1.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error('Failed to fetch stations');
    }
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Radio fetch error:', error);
    return [];
  }
}

export async function searchStations(
  query: string,
  limit: number = 20
): Promise<RadioStation[]> {
  if (!query.trim()) return [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const server = await getApiServer();
    const res = await fetch(
      `${server}/json/stations/search?name=${encodeURIComponent(query)}&limit=${limit}&hidebroken=true&order=votes&reverse=true`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BaseRadio/1.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error('Failed to search stations');
    }
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Radio search error:', error);
    return [];
  }
}

// Keep the old function for backward compatibility
export async function fetchLofiStations(): Promise<RadioStation[]> {
  return fetchStationsByCategory('lofi', 10, 0);
}
