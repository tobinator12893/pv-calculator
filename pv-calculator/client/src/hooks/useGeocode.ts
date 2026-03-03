import { useState, useCallback, useRef } from "react";
import type { GeocodeResult } from "../types/geocode";
import { geocodeSearch } from "../services/pvService";

export function useGeocode() {
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await geocodeSearch(query);
        setResults(data);
      } catch {
        setError("Geocoding fehlgeschlagen");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clearResults = useCallback(() => setResults([]), []);

  return { results, loading, error, search, clearResults };
}
