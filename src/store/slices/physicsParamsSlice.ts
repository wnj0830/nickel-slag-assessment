import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PhysicsParams } from '../../types';

interface PhysicsParamsState {
  params: PhysicsParams;
}

const defaultParams: PhysicsParams = {
  id: '1',
  particleDensity: 2.85,
  maxDryDensity: 1.92,
  optimalMoisture: 12.5,
  originalGradation: '良好级配',
  uniformityCoefficient: 18.5,
  curvatureCoefficient: 1.2,
  poissonRatio: 0.35,
  structureLayerThickness: 0.6,
  initialCompactionStandard: 96,
  updatedAt: new Date().toISOString(),
};

const initialState: PhysicsParamsState = {
  params: defaultParams,
};

const physicsParamsSlice = createSlice({
  name: 'physicsParams',
  initialState,
  reducers: {
    updateParams: (state, action: PayloadAction<Partial<PhysicsParams>>) => {
      state.params = { ...state.params, ...action.payload, updatedAt: new Date().toISOString() };
    },
    resetParams: (state) => {
      state.params = { ...defaultParams, updatedAt: new Date().toISOString() };
    },
  },
});

export const { updateParams, resetParams } = physicsParamsSlice.actions;
export default physicsParamsSlice.reducer;
