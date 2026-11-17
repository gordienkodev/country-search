const COUNTRIES_API_URL = 'https://countries.dev/name';
const REQUEST_TIMEOUT_MS = 5000;

export async function searchCountries(query: string, signal: AbortSignal): Promise<unknown[]> {
  const combinedSignal = AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);

  const response = await fetch(`${COUNTRIES_API_URL}/${encodeURIComponent(query)}`, {
    signal: combinedSignal,
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}
