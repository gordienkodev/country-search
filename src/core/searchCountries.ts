const COUNTRIES_API_URL = 'https://countries.dev/name';

export async function searchCountries(query: string, signal: AbortSignal): Promise<unknown[]> {
  const response = await fetch(`${COUNTRIES_API_URL}/${encodeURIComponent(query)}`, { signal });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}
