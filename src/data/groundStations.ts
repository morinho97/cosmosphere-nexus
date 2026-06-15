import type { GroundStation } from '../types';

export const GROUND_STATIONS: GroundStation[] = [
  // NASA
  { id: 'jpl', name: 'Jet Propulsion Laboratory', agency: 'NASA', lat: 34.2014, lng: -118.1715, type: 'NASA', color: '#3B82F6' },
  { id: 'gsfc', name: 'Goddard Space Flight Center', agency: 'NASA', lat: 38.9917, lng: -76.8481, type: 'NASA', color: '#3B82F6' },
  { id: 'jsc', name: 'Johnson Space Center', agency: 'NASA', lat: 29.5522, lng: -95.0970, type: 'NASA', color: '#3B82F6' },
  { id: 'ksc', name: 'Kennedy Space Center', agency: 'NASA', lat: 28.5728, lng: -80.6490, type: 'NASA', color: '#3B82F6' },
  { id: 'dsg', name: 'Deep Space Network Goldstone', agency: 'NASA', lat: 35.4268, lng: -116.8900, type: 'NASA', color: '#3B82F6' },
  { id: 'dsm', name: 'Deep Space Network Madrid', agency: 'NASA', lat: 40.4315, lng: -4.2480, type: 'NASA', color: '#3B82F6' },
  { id: 'dsc', name: 'Deep Space Network Canberra', agency: 'NASA', lat: -35.4012, lng: 148.9817, type: 'NASA', color: '#3B82F6' },
  // ESA
  { id: 'esoc', name: 'ESOC Darmstadt', agency: 'ESA', lat: 49.8716, lng: 8.6216, type: 'ESA', color: '#8B5CF6' },
  { id: 'esrin', name: 'ESRIN Frascati', agency: 'ESA', lat: 41.8326, lng: 12.6693, type: 'ESA', color: '#8B5CF6' },
  { id: 'esac', name: 'ESAC Madrid', agency: 'ESA', lat: 40.4442, lng: -3.9543, type: 'ESA', color: '#8B5CF6' },
  { id: 'kourou', name: 'Guiana Space Centre', agency: 'ESA', lat: 5.2322, lng: -52.7693, type: 'ESA', color: '#8B5CF6' },
  // ISRO
  { id: 'isac', name: 'ISAC Bangalore', agency: 'ISRO', lat: 12.9716, lng: 77.5946, type: 'ISRO', color: '#F59E0B' },
  { id: 'sdsc', name: 'Satish Dhawan Space Centre', agency: 'ISRO', lat: 13.7199, lng: 80.2304, type: 'ISRO', color: '#F59E0B' },
  // Starlink Gateways
  { id: 'sl-hawthorne', name: 'Starlink Gateway Hawthorne', agency: 'SpaceX', lat: 33.9207, lng: -118.3279, type: 'Starlink', color: '#00D4FF' },
  { id: 'sl-boca', name: 'Starlink Boca Chica', agency: 'SpaceX', lat: 25.9974, lng: -97.1557, type: 'Starlink', color: '#00D4FF' },
  { id: 'sl-uk', name: 'Starlink Gateway UK', agency: 'SpaceX', lat: 51.5074, lng: -0.1278, type: 'Starlink', color: '#00D4FF' },
  { id: 'sl-au', name: 'Starlink Gateway Australia', agency: 'SpaceX', lat: -33.8688, lng: 151.2093, type: 'Starlink', color: '#00D4FF' },
];
