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

const generateMockSensors = (): RealtimeSensorData[] => {
  const locations = [
    { id: 'S001', name: '排水附近路况', type: 'drainage', lat: yangjiangCoords.lat + 0.0001, lng: yangjiangCoords.lng + 0.0001 },
    { id: 'S002', name: '安全设施附近路况', type: 'safety', lat: yangjiangCoords.lat + 0.0002, lng: yangjiangCoords.lng + 0.0002 },
    { id: 'S003', name: '附属设施路况', type: 'auxiliary', lat: yangjiangCoords.lat + 0.0003, lng: yangjiangCoords.lng + 0.0003 },
    { id: 'S004', name: '结构物附近路况', type: 'structure', lat: yangjiangCoords.lat + 0.0004, lng: yangjiangCoords.lng + 0.0004 },
    { id: 'S005', name: 'K1+200路段', type: 'other', lat: yangjiangCoords.lat + 0.0005, lng: yangjiangCoords.lng + 0.0005 },
    { id: 'S006', name: 'K1+350路段', type: 'other', lat: yangjiangCoords.lat + 0.0006, lng: yangjiangCoords.lng + 0.0006 },
    { id: 'S007', name: 'K1+500路段', type: 'other', lat: yangjiangCoords.lat + 0.0007, lng: yangjiangCoords.lng + 0.0007 },
    { id: 'S008', name: 'K1+650路段', type: 'other', lat: yangjiangCoords.lat + 0.0008, lng: yangjiangCoords.lng + 0.0008 },
  ];

  return locations.map((loc) => {
    const forceCritical = Math.random() < 0.4;
    const baseData = {
      actualDryDensity: 1.75 + Math.random() * 0.2,
      actualCompactionDegree: forceCritical ? 85 + Math.random() * 6 : 94 + Math.random() * 4,
      fieldMoistureContent: forceCritical ? 15 + Math.random() * 3 : 10 + Math.random() * 5,
      saturation: 75 + Math.random() * 15,
      confiningPressure: 30 + Math.random() * 20,
      deviatorStress: 80 + Math.random() * 40,
      octahedralNormalStress: 50 + Math.random() * 25,
      octahedralShearStress: 20 + Math.random() * 15,
      subgradeTemperature: 25 + Math.random() * 10,
      dryWetCycleCount: Math.floor(Math.random() * 50),
      trafficLoadCount: Math.floor(Math.random() * 10000),
    };

    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (forceCritical || baseData.actualCompactionDegree < 92 || baseData.fieldMoistureContent > 16) {
      status = 'critical';
    } else if (baseData.actualCompactionDegree < 95 || baseData.fieldMoistureContent > 14) {
      status = 'warning';
    }

    return {
      id: loc.id,
      timestamp: new Date().toISOString(),
      locationId: loc.id,
      locationName: loc.name,
      gpsCoordinates: { lat: loc.lat, lng: loc.lng },
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
    },
    setExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
    },
    clearWarning: (state) => {
      state.criticalSectionId = null;
    },
  },
});

export const { updateSensorData, refreshAllData, setExpanded, clearWarning } = realtimeDataSlice.actions;
export default realtimeDataSlice.reducer;
