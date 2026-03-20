import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import Prediction from './pages/Prediction';
import PhysicsConstraints from './pages/PhysicsConstraints';
import Experiments from './pages/Experiments';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import SensorMonitor from './pages/SensorMonitor';
import MaterialParams from './pages/MaterialParams';
import RoadScene3D from './pages/RoadScene3D';
import MonitorWall from './pages/MonitorWall';
import AIChat from './pages/AIChat';
import './index.css';
import { useAppSelector } from './store/hooks';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/predict" replace />} />
        <Route path="monitor-wall" element={<MonitorWall />} />
        <Route path="road-3d" element={<RoadScene3D />} />
        <Route path="sensors" element={<SensorMonitor />} />
        <Route path="material-params" element={<MaterialParams />} />
        <Route path="predict" element={<Prediction />} />
        <Route path="physics" element={<PhysicsConstraints />} />
        <Route path="experiments" element={<Experiments />} />
        <Route path="history" element={<History />} />
        <Route path="data" element={<DataManagement />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </Provider>
  );
}

export default App;
