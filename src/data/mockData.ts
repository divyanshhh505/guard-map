import { CrimeIncident, PatrolUnit, CrimeType } from '@/types/crime';

const crimeTypes: CrimeType[] = [
  'MURDER', 'ASSAULT', 'ROBBERY', 'BURGLARY', 'THEFT', 
  'VEHICLE_THEFT', 'CYBER', 'FRAUD', 'VANDALISM', 'DRUG_OFFENSE'
];

const statuses: ('OPEN' | 'CLOSED' | 'UNDER_INVESTIGATION')[] = [
  'OPEN', 'CLOSED', 'UNDER_INVESTIGATION'
];

// London area coordinates
const londonCenter = { lat: 51.5074, lng: -0.1278 };

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateRandomDate(daysBack: number): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return pastDate;
}

export function generateMockCrimeData(count: number = 150): CrimeIncident[] {
  const incidents: CrimeIncident[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
    
    // Weight certain crime types
    const weightedType = Math.random() > 0.7 
      ? (['THEFT', 'BURGLARY', 'VEHICLE_THEFT'] as CrimeType[])[Math.floor(Math.random() * 3)]
      : type;
    
    incidents.push({
      id: `INC-${String(1000 + i).padStart(5, '0')}`,
      type: weightedType,
      latitude: londonCenter.lat + randomInRange(-0.08, 0.08),
      longitude: londonCenter.lng + randomInRange(-0.15, 0.15),
      dateTime: generateRandomDate(30),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: `${weightedType.replace('_', ' ')} incident reported`,
      location: `Zone ${Math.ceil(Math.random() * 12)}`
    });
  }
  
  // Add some hotspot clusters
  const hotspots = [
    { lat: 51.5155, lng: -0.0922, name: 'East London' }, // Shoreditch area
    { lat: 51.4975, lng: -0.1357, name: 'Central Westminster' },
    { lat: 51.5074, lng: -0.0877, name: 'City of London' }
  ];
  
  hotspots.forEach((hotspot, idx) => {
    for (let i = 0; i < 20; i++) {
      incidents.push({
        id: `INC-HOTSPOT-${idx}-${i}`,
        type: ['THEFT', 'ROBBERY', 'ASSAULT'][Math.floor(Math.random() * 3)] as CrimeType,
        latitude: hotspot.lat + randomInRange(-0.01, 0.01),
        longitude: hotspot.lng + randomInRange(-0.01, 0.01),
        dateTime: generateRandomDate(7),
        status: 'OPEN',
        description: `Hotspot incident in ${hotspot.name}`,
        location: hotspot.name
      });
    }
  });
  
  return incidents;
}

export function generateMockPatrolUnits(): PatrolUnit[] {
  return [
    { id: 'UNIT-01', name: 'Alpha-1', latitude: 51.5080, longitude: -0.1200, status: 'ON_PATROL' },
    { id: 'UNIT-02', name: 'Bravo-2', latitude: 51.5150, longitude: -0.0950, status: 'AVAILABLE' },
    { id: 'UNIT-03', name: 'Charlie-3', latitude: 51.5000, longitude: -0.1400, status: 'RESPONDING' },
    { id: 'UNIT-04', name: 'Delta-4', latitude: 51.5200, longitude: -0.1100, status: 'ON_PATROL' },
    { id: 'UNIT-05', name: 'Echo-5', latitude: 51.4950, longitude: -0.1000, status: 'OFF_DUTY' },
  ];
}

export const DEMO_CITY = {
  name: 'London, UK',
  center: [londonCenter.lat, londonCenter.lng] as [number, number],
  zoom: 13
};
