/**
 * Shared fetcher function for SWR
 * Handles error checking and JSON parsing
 */
export const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
});
