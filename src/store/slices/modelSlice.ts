import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ModelInfo, PhysicsConstraint } from '../../types';

interface ModelState {
  currentModel: ModelInfo | null;
  constraints: PhysicsConstraint[];
  isTraining: boolean;
  trainingProgress: number;
}

const initialState: ModelState = {
  currentModel: {
    id: 'pinn-v1',
    name: '镍铁渣回弹模量PINN模型',
    version: '1.0.0',
    accuracy: 0.94,
    mse: 0.0023,
    r2: 0.97,
    trainingDate: '2024-01-15',
    status: 'ready',
  },
  constraints: [
    {
      name: '颗粒破碎演化方程',
      equation: 'B = B0 + (Bmax - B0) * (1 - exp(-k*N))',
      weight: 0.3,
      enabled: true,
    },
    {
      name: '回弹模量与应力关系',
      equation: 'Mr = k1 * pa * (σ3/pa)^k2',
      weight: 0.25,
      enabled: true,
    },
    {
      name: '能量守恒约束',
      equation: 'E_in = E_out + E_dissipated',
      weight: 0.2,
      enabled: true,
    },
    {
      name: '损伤演化方程',
      equation: 'D = 1 - (E/E0) = 1 - exp(-(σ/σc)^m)',
      weight: 0.25,
      enabled: true,
    },
  ],
  isTraining: false,
  trainingProgress: 0,
};

const modelSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setCurrentModel: (state, action: PayloadAction<ModelInfo | null>) => {
      state.currentModel = action.payload;
    },
    setConstraints: (state, action: PayloadAction<PhysicsConstraint[]>) => {
      state.constraints = action.payload;
    },
    toggleConstraint: (state, action: PayloadAction<string>) => {
      const constraint = state.constraints.find(c => c.name === action.payload);
      if (constraint) {
        constraint.enabled = !constraint.enabled;
      }
    },
    updateConstraintWeight: (state, action: PayloadAction<{ name: string; weight: number }>) => {
      const constraint = state.constraints.find(c => c.name === action.payload.name);
      if (constraint) {
        constraint.weight = action.payload.weight;
      }
    },
    setTraining: (state, action: PayloadAction<boolean>) => {
      state.isTraining = action.payload;
    },
    setTrainingProgress: (state, action: PayloadAction<number>) => {
      state.trainingProgress = action.payload;
    },
  },
});

export const { setCurrentModel, setConstraints, toggleConstraint, updateConstraintWeight, setTraining, setTrainingProgress } = modelSlice.actions;
export default modelSlice.reducer;
