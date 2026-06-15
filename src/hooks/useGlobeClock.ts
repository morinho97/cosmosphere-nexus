/**
 * useGlobeClock — subscribes to simTime changes and re-propagates satellite
 * positions via satellite.js. Runs in a Web-Worker-friendly tight loop
 * (batches 60 position updates per animation frame instead of per tick).
 */

import { useEffect, useRef } from "react";
import { useStore } from "../store";
import { updateSatellitePositions } from "../services/satelliteService";

// Only re-propagate if simTime changed by more than this threshold (ms)
const MIN_DELTA_MS = 3000;

export function useGlobeClock() {
  const lastPropagatedRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const update = () => {
      const { simTime, satellites, isPlaying } = useStore.getState();
      const nowMs = simTime.getTime();

      if (
        isPlaying &&
        satellites.length > 0 &&
        Math.abs(nowMs - lastPropagatedRef.current) >= MIN_DELTA_MS
      ) {
        const updated = updateSatellitePositions(satellites, simTime);
        useStore.setState({ satellites: updated });
        lastPropagatedRef.current = nowMs;
      }

      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
}
