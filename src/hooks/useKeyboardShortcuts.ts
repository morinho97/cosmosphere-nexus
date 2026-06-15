/**
 * useKeyboardShortcuts — global keyboard bindings for power-user navigation.
 *
 * Bindings:
 *   Space       — play / pause simulation
 *   Escape      — deselect satellite / close panels
 *   R           — toggle auto-rotate
 *   T           — toggle time machine
 *   F           — toggle filters sidebar
 *   1-6         — switch active view panels
 *   +/-         — increase / decrease playback speed
 */

import { useEffect } from 'react';
import { useStore } from '../store';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if focus is inside an input / textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const store = useStore.getState();

      switch (e.key) {
        case ' ':
          e.preventDefault();
          store.setIsPlaying(!store.isPlaying);
          break;

        case 'Escape':
          store.setSelectedSatellite(null);
          store.setShowInfoPanel(false);
          break;

        case 'r':
        case 'R':
          store.setGlobeAutoRotate(!store.globeAutoRotate);
          break;

        case 't':
        case 'T':
          store.toggleFeature('showTimeMachine');
          break;

        case '1':
          store.setActiveView('globe');
          break;
        case '2':
          store.setActiveView('analytics');
          break;
        case '3':
          store.setActiveView('launches');
          break;
        case '4':
          store.setActiveView('alerts');
          break;

        case '+':
        case '=': {
          const speeds = [0.25, 0.5, 1, 2, 5, 10, 30, 60];
          const idx = speeds.indexOf(store.playSpeed);
          if (idx < speeds.length - 1) store.setPlaySpeed(speeds[idx + 1]);
          break;
        }

        case '-':
        case '_': {
          const speeds = [0.25, 0.5, 1, 2, 5, 10, 30, 60];
          const idx = speeds.indexOf(store.playSpeed);
          if (idx > 0) store.setPlaySpeed(speeds[idx - 1]);
          break;
        }

        case 'g':
        case 'G':
          store.toggleFeature('showGroundStations');
          break;

        case 'o':
        case 'O':
          store.toggleFeature('showOrbits');
          break;

        case 'c':
        case 'C':
          store.toggleFeature('showConstellation');
          break;

        case 'b':
        case 'B':
          store.toggleSidebar();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
