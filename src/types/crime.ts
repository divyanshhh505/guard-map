export interface CrimeIncident {
  id: string;
  type: CrimeType;
  latitude: number;
  longitude: number;
  dateTime: Date;
  status: 'OPEN' | 'CLOSED' | 'UNDER_INVESTIGATION';
  description?: string;
  location?: string;
}

export type CrimeType = 
  | 'MURDER'
  | 'ASSAULT'
  | 'ROBBERY'
  | 'BURGLARY'
  | 'THEFT'
  | 'VEHICLE_THEFT'
  | 'CYBER'
  | 'FRAUD'
  | 'VANDALISM'
  | 'DRUG_OFFENSE'
  | 'OTHER';

export interface PatrolUnit {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: 'AVAILABLE' | 'ON_PATROL' | 'RESPONDING' | 'OFF_DUTY';
}

export interface MapBounds {
  center: [number, number];
  zoom: number;
}

export interface CrimeStats {
  totalIncidents: number;
  openCases: number;
  closedCases: number;
  byType: Record<CrimeType, number>;
  byHour: number[];
  byDay: { date: string; count: number }[];
}

export interface AIInsight {
  id: string;
  type: 'HOTSPOT' | 'RESOURCE_GAP' | 'TREND' | 'ALERT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  recommendation: string;
  affectedArea?: string;
  crimeType?: CrimeType;
}
