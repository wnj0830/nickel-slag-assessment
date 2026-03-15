import { configureStore } from '@reduxjs/toolkit';
import experimentReducer from './slices/experimentSlice';
import predictionReducer from './slices/predictionSlice';
import modelReducer from './slices/modelSlice';
import authReducer from './slices/authSlice';
import physicsParamsReducer from './slices/physicsParamsSlice';
import realtimeDataReducer from './slices/realtimeDataSlice';

export const store = configureStore({
  reducer: {
    experiments: experimentReducer,
    predictions: predictionReducer,
    models: modelReducer,
    auth: authReducer,
    physicsParams: physicsParamsReducer,
    realtimeData: realtimeDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
