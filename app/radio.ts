export interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  favicon?: string;
  country?: string;
  tags?: string;
}

export async function fetchLofiStations(): Promise<RadioStation[]> {
  // Use a timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(
      'https://de1.api.radio-browser.info/json/stations/search?tag=lofi&limit=10&hidebroken=true&order=votes&reverse=true',
      { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'BaseRadio/1.0'
        }
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error('Failed to fetch stations');
    }
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Radio fetch error:", error);
    // Return fallback data or empty array if API fails
    return [];
  }
}

