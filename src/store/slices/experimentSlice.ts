import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ExperimentData, ProcessedDataRow, FieldMapping } from '../../types';

interface ExperimentState {
  items: ExperimentData[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  processedData: ProcessedDataRow[];
  currentMappings: FieldMapping[];
  dataPreview: ProcessedDataRow[];
}

const initialState: ExperimentState = {
  items: [],
  loading: false,
  error: null,
  selectedId: null,
  processedData: [],
  currentMappings: [],
  dataPreview: [],
};

const experimentSlice = createSlice({
  name: 'experiments',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addExperiment: (state, action: PayloadAction<ExperimentData>) => {
      state.items.push(action.payload);
    },
    removeExperiment: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    selectExperiment: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
    setExperiments: (state, action: PayloadAction<ExperimentData[]>) => {
      state.items = action.payload;
    },
    setProcessedData: (state, action: PayloadAction<ProcessedDataRow[]>) => {
      state.processedData = action.payload;
    },
    setCurrentMappings: (state, action: PayloadAction<FieldMapping[]>) => {
      state.currentMappings = action.payload;
    },
    setDataPreview: (state, action: PayloadAction<ProcessedDataRow[]>) => {
      state.dataPreview = action.payload;
    },
    clearCurrentData: (state) => {
      state.processedData = [];
      state.currentMappings = [];
      state.dataPreview = [];
    },
  },
});

export const { 
  setLoading, 
  setError, 
  addExperiment, 
  removeExperiment, 
  selectExperiment, 
  setExperiments,
  setProcessedData,
  setCurrentMappings,
  setDataPreview,
  clearCurrentData,
} = experimentSlice.actions;
export default experimentSlice.reducer;
