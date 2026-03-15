import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PredictionInput, PredictionResult } from '../../types';

interface PredictionState {
  history: PredictionResult[];
  currentInput: PredictionInput | null;
  currentResult: PredictionResult | null;
  isPredicting: boolean;
  error: string | null;
}

const initialState: PredictionState = {
  history: [],
  currentInput: null,
  currentResult: null,
  isPredicting: false,
  error: null,
};

const predictionSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    setPredicting: (state, action: PayloadAction<boolean>) => {
      state.isPredicting = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCurrentInput: (state, action: PayloadAction<PredictionInput | null>) => {
      state.currentInput = action.payload;
    },
    setCurrentResult: (state, action: PayloadAction<PredictionResult | null>) => {
      state.currentResult = action.payload;
    },
    addPrediction: (state, action: PayloadAction<PredictionResult>) => {
      state.history.unshift(action.payload);
    },
    clearHistory: (state) => {
      state.history = [];
    },
  },
});

export const { setPredicting, setError, setCurrentInput, setCurrentResult, addPrediction, clearHistory } = predictionSlice.actions;
export default predictionSlice.reducer;
