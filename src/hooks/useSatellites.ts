/**
 * useSatellites — loads mock satellites instantly so the globe renders immediately,
 * then attempts to fetch real TLE data in the background and swaps it in.
 */
import { useEffect } from 'react';
import { useStore } from '../store';
import { fetchSatellites, generateMockSatellitesForAllCategories } from '../services/satelliteService';

export function useSatellites() {
  const { setSatellites, setIsLoading, setLoadingProgress } = useStore();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadingProgress(10);

      // 1. Show mock satellites immediately so globe isn't empty
      const mockSats = generateMockSatellitesForAllCategories();
      if (!cancelled) {
        setSatellites(mockSats);
        setLoadingProgress(30);
      }

      // 2. Try fetching real TLE data (will fall back per-source if proxy fails)
      try {
        const realSats = await fetchSatellites((loaded, total) => {
          if (!cancelled) setLoadingProgress(30 + (loaded / total) * 60);
        });

        if (cancelled) return;
        // Only swap in real data if we got a reasonable number of satellites
        if (realSats.length >= mockSats.length * 0.5) {
          setSatellites(realSats);
        }
      } catch (err) {
        console.warn('[Cosmosphere] TLE fetch failed entirely, keeping mock data');
      }

      if (!cancelled) {
        setLoadingProgress(100);
        setTimeout(() => { if (!cancelled) setIsLoading(false); }, 400);
      }
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
