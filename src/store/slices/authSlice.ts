import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  history: Array<{
    id: string;
    timestamp: number;
    input: Record<string, number>;
    output: {
      resilientModulus: number;
      confidence: number;
      particleBreakage: number;
      reliability: string;
    };
  }>;
}

const loadHistory = (): AuthState['history'] => {
  const saved = localStorage.getItem('userHistory');
  return saved ? JSON.parse(saved) : [];
};

const saveHistory = (history: AuthState['history']) => {
  localStorage.setItem('userHistory', JSON.stringify(history));
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  history: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string; email: string }>) => {
      state.user = {
        id: Date.now().toString(),
        username: action.payload.username,
        email: action.payload.email,
      };
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    register: (state, action: PayloadAction<{ username: string; email: string }>) => {
      state.user = {
        id: Date.now().toString(),
        username: action.payload.username,
        email: action.payload.email,
      };
      state.isAuthenticated = true;
    },
    addHistoryRecord: (state, action: PayloadAction<AuthState['history'][0]>) => {
      state.history.unshift(action.payload);
      saveHistory(state.history);
    },
    clearHistory: (state) => {
      state.history = [];
      saveHistory([]);
    },
    loadUserHistory: (state) => {
      state.history = loadHistory();
    },
  },
});

export const { login, logout, register, addHistoryRecord, clearHistory, loadUserHistory } = authSlice.actions;
export default authSlice.reducer;
