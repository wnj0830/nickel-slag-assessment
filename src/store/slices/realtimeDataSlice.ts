import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RealtimeSensorData, RoadSection } from '../../types';

interface RealtimeDataState {
  sensors: RealtimeSensorData[];
  roadSections: RoadSection[];
  hasWarning: boolean;
  criticalSectionId: string | null;
  isExpanded: boolean;
}

const yangjiangCoords = {
  lat: 21.8644,
  lng: 111.9833,
};

let faultSensorId: string | null = null;
let faultStartTime = 0;

const generateMockSensors = (): RealtimeSensorData[] => {
  const locations: Array<{ id: string; name: string; type: 'drainage' | 'safety' | 'auxiliary' | 'structure' | 'other'; lat: number; lng: number }> = [
    { id: 'S001', name: '排水附近路况①', type: 'drainage', lat: yangjiangCoords.lat + 0.0001, lng: yangjiangCoords.lng + 0.0001 },
    { id: 'S002', name: '排水附近路况②', type: 'drainage', lat: yangjiangCoords.lat + 0.00012, lng: yangjiangCoords.lng + 0.00012 },
    { id: 'S003', name: '安全设施附近路况①', type: 'safety', lat: yangjiangCoords.lat + 0.0002, lng: yangjiangCoords.lng + 0.0002 },
    { id: 'S004', name: '安全设施附近路况②', type: 'safety', lat: yangjiangCoords.lat + 0.00022, lng: yangjiangCoords.lng + 0.00022 },
    { id: 'S005', name: '附属设施路况①', type: 'auxiliary', lat: yangjiangCoords.lat + 0.0003, lng: yangjiangCoords.lng + 0.0003 },
    { id: 'S006', name: '附属设施路况②', type: 'auxiliary', lat: yangjiangCoords.lat + 0.00032, lng: yangjiangCoords.lng + 0.00032 },
    { id: 'S007', name: '结构物附近路况①', type: 'structure', lat: yangjiangCoords.lat + 0.0004, lng: yangjiangCoords.lng + 0.0004 },
    { id: 'S008', name: '结构物附近路况②', type: 'structure', lat: yangjiangCoords.lat + 0.00042, lng: yangjiangCoords.lng + 0.00042 },
    { id: 'S009', name: '其他重要路况①', type: 'other', lat: yangjiangCoords.lat + 0.0005, lng: yangjiangCoords.lng + 0.0005 },
    { id: 'S010', name: '其他重要路况②', type: 'other', lat: yangjiangCoords.lat + 0.0006, lng: yangjiangCoords.lng + 0.0006 },
    { id: 'S011', name: '其他重要路况③', type: 'other', lat: yangjiangCoords.lat + 0.0007, lng: yangjiangCoords.lng + 0.0007 },
    { id: 'S012', name: '其他重要路况④', type: 'other', lat: yangjiangCoords.lat + 0.0008, lng: yangjiangCoords.lng + 0.0008 },
  ];

  const now = Date.now();
  const faultDuration = 30000;
  let shouldHaveFault = false;
  
  if (Math.random() < 0.4) {
    const randomIndex = Math.floor(Math.random() * locations.length);
    faultSensorId = locations[randomIndex].id;
    faultStartTime = now;
    shouldHaveFault = true;
  } else if (faultSensorId && (now - faultStartTime) < faultDuration) {
    shouldHaveFault = true;
  } else {
    faultSensorId = null;
  }

  return locations.map((loc) => {
    const isFaultSensor = shouldHaveFault && loc.id === faultSensorId;
    const forceCritical = isFaultSensor;
    
    const isProblematicSensor = ['S005', 'S006'].includes(loc.id);
    const forceWarning = isProblematicSensor && Math.random() < 0.7;
    
    const baseData = {
      actualDryDensity: forceCritical ? 1.6 + Math.random() * 0.1 : 1.75 + Math.random() * 0.2,
      actualCompactionDegree: forceCritical ? 85 + Math.random() * 5 : forceWarning ? 93 + Math.random() * 2 : 95 + Math.random() * 3,
      fieldMoistureContent: forceCritical ? 16 + Math.random() * 3 : forceWarning ? 15 + Math.random() * 2 : 8 + Math.random() * 4,
      saturation: forceCritical ? 95 + Math.random() * 5 : 70 + Math.random() * 15,
      confiningPressure: 30 + Math.random() * 20,
      deviatorStress: 80 + Math.random() * 40,
      octahedralNormalStress: 50 + Math.random() * 25,
      octahedralShearStress: 20 + Math.random() * 15,
      subgradeTemperature: 25 + Math.random() * 10,
      dryWetCycleCount: Math.floor(Math.random() * 50),
      trafficLoadCount: Math.floor(Math.random() * 10000),
    };

    let status: 'normal' | 'warning' | 'critical' = forceCritical ? 'critical' : 'normal';
    if (!forceCritical && forceWarning) {
      status = 'warning';
    }

    return {
      id: loc.id,
      timestamp: new Date().toISOString(),
      locationId: loc.id,
      locationName: loc.name,
      gpsCoordinates: { lat: loc.lat, lng: loc.lng },
      type: loc.type,
      ...baseData,
      status,
    };
  });
};

const generateRoadSections = (): RoadSection[] => {
  const sectionData = [
    { id: 'R001', name: '排水附近路段', type: 'drainage' as const, startStake: 1000, endStake: 1150 },
    { id: 'R002', name: '安全设施附近路段', type: 'safety' as const, startStake: 1200, endStake: 1350 },
    { id: 'R003', name: '附属设施路段', type: 'auxiliary' as const, startStake: 1400, endStake: 1550 },
    { id: 'R004', name: '结构物附近路段', type: 'structure' as const, startStake: 1600, endStake: 1750 },
    { id: 'R005', name: '其他重要路段1', type: 'other' as const, startStake: 1800, endStake: 1950 },
    { id: 'R006', name: '其他重要路段2', type: 'other' as const, startStake: 2000, endStake: 2150 },
    { id: 'R007', name: '其他重要路段3', type: 'other' as const, startStake: 2200, endStake: 2350 },
  ];

  return sectionData.map(section => ({
    ...section,
    length: section.endStake - section.startStake,
    gpsCoordinates: {
      start: { lat: yangjiangCoords.lat + Math.random() * 0.001, lng: yangjiangCoords.lng + Math.random() * 0.001 },
      end: { lat: yangjiangCoords.lat + Math.random() * 0.001, lng: yangjiangCoords.lng + Math.random() * 0.001 },
    },
    status: 'normal' as const,
    sensors: [],
  }));
};

const initialState: RealtimeDataState = {
  sensors: generateMockSensors(),
  roadSections: generateRoadSections(),
  hasWarning: false,
  criticalSectionId: null,
  isExpanded: false,
};

const realtimeDataSlice = createSlice({
  name: 'realtimeData',
  initialState,
  reducers: {
    updateSensorData: (state, action: PayloadAction<RealtimeSensorData>) => {
      const index = state.sensors.findIndex(s => s.id === action.payload.id);
      if (index >= 0) {
        state.sensors[index] = action.payload;
      }
      const hasCritical = state.sensors.some(s => s.status === 'critical');
      state.hasWarning = hasCritical || state.sensors.some(s => s.status === 'warning');
      if (hasCritical) {
        const critical = state.sensors.find(s => s.status === 'critical');
        state.criticalSectionId = critical?.locationId || null;
      }
    },
    refreshAllData: (state) => {
      state.sensors = generateMockSensors();
      const hasCritical = state.sensors.some(s => s.status === 'critical');
      state.hasWarning = hasCritical || state.sensors.some(s => s.status === 'warning');
      if (hasCritical) {
        const critical = state.sensors.find(s => s.status === 'critical');
        state.criticalSectionId = critical?.locationId || null;
      } else {
        state.criticalSectionId = null;
      }
    },
    setExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
    },
    clearWarning: (state) => {
      state.criticalSectionId = null;
      state.hasWarning = false;
      if (state.sensors) {
        state.sensors = state.sensors.map(s => ({
          ...s,
          status: 'normal' as const,
        }));
      }
    },
  },
});

export const { updateSensorData, refreshAllData, setExpanded, clearWarning } = realtimeDataSlice.actions;
export default realtimeDataSlice.reducer;