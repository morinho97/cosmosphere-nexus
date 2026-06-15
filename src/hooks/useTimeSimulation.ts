/**
 * useTimeSimulation — drives the Zustand simTime forward at the chosen
 * playSpeed whenever isPlaying is true.  Separated from useSatellites so
 * the clock can run even when no satellite data has loaded yet.
 */

import { useEffect, useRef } from 'react';
import { useStore } from '../store';

export function useTimeSimulation() {
  const tickRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const tick = () => {
      const { isPlaying, playSpeed } = useStore.getState();
      if (!isPlaying) return;
      const delta = 1000 * playSpeed; // milliseconds of sim-time per real second
      useStore.setState(s => ({ simTime: new Date(s.simTime.getTime() + delta) }));
    };

    tickRef.current = setInterval(tick, 1000);
    return () => clearInterval(tickRef.current);
  }, []);
}
