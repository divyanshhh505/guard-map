import { useState, useCallback, useMemo } from 'react';
import { CrimeIncident, CrimeStats, MapBounds, AIInsight, PatrolUnit, CrimeType } from '@/types/crime';
import { generateMockCrimeData, generateMockPatrolUnits, DEMO_CITY } from '@/data/mockData';
import Papa from 'papaparse';

export function useCrimeData() {
  const [incidents, setIncidents] = useState<CrimeIncident[]>(generateMockCrimeData());
  const [patrolUnits] = useState<PatrolUnit[]>(generateMockPatrolUnits());
  const [mapBounds, setMapBounds] = useState<MapBounds>({
    center: DEMO_CITY.center,
    zoom: DEMO_CITY.zoom
  });
  const [isLoading, setIsLoading] = useState(false);
  const [cityName, setCityName] = useState(DEMO_CITY.name);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const parseCSV = useCallback((file: File): Promise<CrimeIncident[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const parsed: CrimeIncident[] = results.data.map((row: any, index: number) => {
              const lat = parseFloat(row.LATITUDE || row.latitude || row.Latitude || row.lat);
              const lng = parseFloat(row.LONGITUDE || row.longitude || row.Longitude || row.lon || row.lng);
              const type = (row.CRIME_TYPE || row.crime_type || row.CrimeType || row.type || 'OTHER').toUpperCase().replace(/\s+/g, '_') as CrimeType;
              const dateStr = row.DATE_TIME || row.datetime || row.DateTime || row.date || row.Date;
              const status = (row.STATUS || row.status || 'OPEN').toUpperCase();
              
              return {
                id: row.ID || row.id || `UPLOADED-${index}`,
                type: crimeTypeMapping(type),
                latitude: lat,
                longitude: lng,
                dateTime: dateStr ? new Date(dateStr) : new Date(),
                status: status as 'OPEN' | 'CLOSED' | 'UNDER_INVESTIGATION',
                description: row.DESCRIPTION || row.description || '',
                location: row.LOCATION || row.location || ''
              };
            }).filter(inc => !isNaN(inc.latitude) && !isNaN(inc.longitude));
            
            resolve(parsed);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error)
      });
    });
  }, []);

  const crimeTypeMapping = (type: string): CrimeType => {
    const mapping: Record<string, CrimeType> = {
      'MURDER': 'MURDER',
      'HOMICIDE': 'MURDER',
      'ASSAULT': 'ASSAULT',
      'BATTERY': 'ASSAULT',
      'ROBBERY': 'ROBBERY',
      'BURGLARY': 'BURGLARY',
      'BREAKING_AND_ENTERING': 'BURGLARY',
      'THEFT': 'THEFT',
      'LARCENY': 'THEFT',
      'VEHICLE_THEFT': 'VEHICLE_THEFT',
      'CAR_THEFT': 'VEHICLE_THEFT',
      'AUTO_THEFT': 'VEHICLE_THEFT',
      'CYBER': 'CYBER',
      'CYBERCRIME': 'CYBER',
      'FRAUD': 'FRAUD',
      'VANDALISM': 'VANDALISM',
      'CRIMINAL_DAMAGE': 'VANDALISM',
      'DRUG_OFFENSE': 'DRUG_OFFENSE',
      'DRUGS': 'DRUG_OFFENSE',
      'NARCOTICS': 'DRUG_OFFENSE',
    };
    return mapping[type] || 'OTHER';
  };

  const uploadData = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const parsed = await parseCSV(file);
      
      if (parsed.length === 0) {
        throw new Error('No valid data found in CSV');
      }
      
      // Calculate bounds
      const lats = parsed.map(p => p.latitude);
      const lngs = parsed.map(p => p.longitude);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      
      // Calculate appropriate zoom
      const latSpan = Math.max(...lats) - Math.min(...lats);
      const lngSpan = Math.max(...lngs) - Math.min(...lngs);
      const maxSpan = Math.max(latSpan, lngSpan);
      const zoom = maxSpan > 1 ? 8 : maxSpan > 0.5 ? 10 : maxSpan > 0.1 ? 12 : 14;
      
      setIncidents(parsed);
      setMapBounds({ center: [centerLat, centerLng], zoom });
      setUploadedFileName(file.name);
      setCityName(`Custom Dataset (${parsed.length} incidents)`);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [parseCSV]);

  const resetToDemo = useCallback(() => {
    setIncidents(generateMockCrimeData());
    setMapBounds({ center: DEMO_CITY.center, zoom: DEMO_CITY.zoom });
    setUploadedFileName(null);
    setCityName(DEMO_CITY.name);
  }, []);

  const stats: CrimeStats = useMemo(() => {
    const byType: Record<CrimeType, number> = {
      MURDER: 0, ASSAULT: 0, ROBBERY: 0, BURGLARY: 0, THEFT: 0,
      VEHICLE_THEFT: 0, CYBER: 0, FRAUD: 0, VANDALISM: 0, DRUG_OFFENSE: 0, OTHER: 0
    };
    
    const byHour = new Array(24).fill(0);
    const byDayMap: Record<string, number> = {};
    
    let openCases = 0;
    let closedCases = 0;
    
    incidents.forEach(inc => {
      byType[inc.type] = (byType[inc.type] || 0) + 1;
      byHour[inc.dateTime.getHours()]++;
      
      const dateKey = inc.dateTime.toISOString().split('T')[0];
      byDayMap[dateKey] = (byDayMap[dateKey] || 0) + 1;
      
      if (inc.status === 'OPEN') openCases++;
      if (inc.status === 'CLOSED') closedCases++;
    });
    
    const sortedDays = Object.entries(byDayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, count]) => ({ date, count }));
    
    return {
      totalIncidents: incidents.length,
      openCases,
      closedCases,
      byType,
      byHour,
      byDay: sortedDays
    };
  }, [incidents]);

  const insights: AIInsight[] = useMemo(() => {
    const results: AIInsight[] = [];
    
    // Find hotspots
    const locationCounts: Record<string, { count: number; types: CrimeType[] }> = {};
    incidents.forEach(inc => {
      const loc = inc.location || 'Unknown';
      if (!locationCounts[loc]) locationCounts[loc] = { count: 0, types: [] };
      locationCounts[loc].count++;
      locationCounts[loc].types.push(inc.type);
    });
    
    const hotspot = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b.count - a.count)[0];
    
    if (hotspot && hotspot[1].count > 10) {
      const topType = hotspot[1].types.reduce((acc, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const mainCrime = Object.entries(topType).sort(([, a], [, b]) => b - a)[0][0];
      
      results.push({
        id: 'hotspot-1',
        type: 'HOTSPOT',
        severity: 'HIGH',
        title: 'High Density Zone Detected',
        description: `Analysis detects elevated ${mainCrime.replace('_', ' ')} activity in ${hotspot[0]} sector.`,
        recommendation: `Increase visible patrolling in ${hotspot[0]} during peak hours (22:00 - 04:00). Consider deploying additional units.`,
        affectedArea: hotspot[0],
        crimeType: mainCrime as CrimeType
      });
    }
    
    // Find peak hours
    const peakHour = stats.byHour.indexOf(Math.max(...stats.byHour));
    const peakHourFormatted = `${String(peakHour).padStart(2, '0')}:00`;
    const peakHourEnd = `${String((peakHour + 2) % 24).padStart(2, '0')}:00`;
    
    results.push({
      id: 'temporal-1',
      type: 'TREND',
      severity: 'MEDIUM',
      title: 'Peak Activity Window Identified',
      description: `Crime frequency peaks between ${peakHourFormatted} and ${peakHourEnd}. This window accounts for ${Math.round((stats.byHour[peakHour] / stats.totalIncidents) * 100)}% of all incidents.`,
      recommendation: `Schedule shift overlaps and enhanced patrol coverage during ${peakHourFormatted} - ${peakHourEnd}.`
    });
    
    // Check for violent crime
    const violentCount = stats.byType.MURDER + stats.byType.ASSAULT + stats.byType.ROBBERY;
    if (violentCount > stats.totalIncidents * 0.15) {
      results.push({
        id: 'violent-1',
        type: 'ALERT',
        severity: 'CRITICAL',
        title: 'Elevated Violent Crime Rate',
        description: `Violent crimes (Murder, Assault, Robbery) represent ${Math.round((violentCount / stats.totalIncidents) * 100)}% of total incidents.`,
        recommendation: 'Deploy rapid response units. Coordinate with investigative teams for pattern analysis.'
      });
    }
    
    // Resource gap
    const openInHotspot = incidents.filter(i => i.status === 'OPEN' && i.location === hotspot?.[0]).length;
    if (openInHotspot > 5) {
      results.push({
        id: 'gap-1',
        type: 'RESOURCE_GAP',
        severity: 'MEDIUM',
        title: 'Patrol Coverage Gap',
        description: `${openInHotspot} open cases in ${hotspot?.[0] || 'high-density zone'} with limited active patrol presence.`,
        recommendation: 'Consider redeploying Unit-4 or Unit-5 to cover this sector.'
      });
    }
    
    return results;
  }, [incidents, stats]);

  return {
    incidents,
    patrolUnits,
    mapBounds,
    stats,
    insights,
    isLoading,
    cityName,
    uploadedFileName,
    uploadData,
    resetToDemo
  };
}
