import { useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button } from '@mui/material';
import { LocationOn, Speed, WaterDrop, Thermostat, Warning, Refresh, Layers, Straighten } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { refreshAllData } from '../store/slices/realtimeDataSlice';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  decimals?: number;
}

function AnimatedNumber({ value, suffix = '', decimals = 1 }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      const diff = value - prevValue.current;
      const steps = 10;
      const stepValue = diff / steps;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        setDisplayValue(prevValue.current + stepValue * currentStep);
        if (currentStep >= steps) {
          setDisplayValue(value);
          prevValue.current = value;
          clearInterval(interval);
        }
      }, 30);
      
      return () => clearInterval(interval);
    }
  }, [value]);

  return <>{displayValue.toFixed(decimals)}{suffix}</>;
}

export default function RoadScene3D() {
  const dispatch = useAppDispatch();
  const { sensors, hasWarning, criticalSectionId } = useAppSelector(state => state.realtimeData);
  const initialSensor = hasWarning && criticalSectionId ? criticalSectionId : null;
  const [selectedSensor, setSelectedSensor] = useState<string | null>(initialSensor);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(refreshAllData());
    }, 2000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (criticalSectionId) {
      setSelectedSensor(criticalSectionId);
    }
  }, [criticalSectionId]);

  const displaySensors = sensors.slice(0, 4);

  const yangjiangLocation = {
    name: '广东省阳江市高新区镍铁渣道路试验段',
    stake: 'K1+000 - K2+500',
    totalLength: 1500,
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
          }}>
            3D道路结构监测
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocationOn sx={{ fontSize: 16, color: 'var(--gold)' }} />
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              {yangjiangLocation.name}
            </Typography>
            <Chip 
              label={yangjiangLocation.stake} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(212, 175, 55, 0.15)',
                color: 'var(--gold)',
                fontSize: '0.7rem',
              }} 
            />
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => dispatch(refreshAllData())}
          sx={{
            borderColor: 'var(--gold)',
            color: 'var(--gold)',
            '&:hover': {
              bgcolor: 'rgba(212, 175, 55, 0.15)',
            }
          }}
        >
          刷新数据
        </Button>
      </Box>

      {hasWarning && (
        <Box sx={{ 
          mb: 3, 
          p: 2.5, 
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)',
          border: '2px solid rgba(239, 68, 68, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          animation: 'glow 1.5s ease-in-out infinite',
        }}>
          <Warning sx={{ color: '#ef4444', fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 700 }}>
              ⚠️ 危险路段警报
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              位置: {criticalSectionId} | 点击下方传感器卡片查看详情
            </Typography>
          </Box>
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '500px', position: 'relative', overflow: 'hidden' }}>
            <CardContent sx={{ height: '100%', p: 0, position: 'relative' }}>
              <Box sx={{ 
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(15, 20, 30, 0.98) 0%, rgba(10, 15, 25, 0.99) 100%)',
              }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: 20, 
                  left: 20, 
                  right: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}>
                  <Layers sx={{ color: 'var(--gold)' }} />
                  <Typography variant="h6" sx={{ color: 'var(--gold)', fontWeight: 600 }}>
                    道路结构剖面图
                  </Typography>
                  <Chip 
                    label="阳江高新区试验段" 
                    size="small" 
                    sx={{ bgcolor: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold)' }}
                  />
                </Box>

                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                  height: '70%',
                }}>
                  <svg width="100%" height="100%" viewBox="0 0 800 300">
                    <defs>
                      <linearGradient id="asphaltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3a3a3a" />
                        <stop offset="100%" stopColor="#2a2a2a" />
                      </linearGradient>
                      <linearGradient id="baseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#5a4a3a" />
                        <stop offset="100%" stopColor="#4a3a2a" />
                      </linearGradient>
                      <linearGradient id="subgradeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6a5a4a" />
                        <stop offset="100%" stopColor="#5a4a3a" />
                      </linearGradient>
                    </defs>
                    
                    <rect x="0" y="80" width="800" height="20" fill="url(#asphaltGrad)" rx="2" />
                    <text x="10" y="70" fill="#94a3b8" fontSize="10">面层 (沥青混凝土)</text>
                    
                    <rect x="0" y="100" width="800" height="30" fill="url(#baseGrad)" rx="2" />
                    <text x="10" y="95" fill="#94a3b8" fontSize="10">基层 (镍铁渣)</text>
                    
                    <rect x="0" y="130" width="800" height="50" fill="url(#subgradeGrad)" rx="2" />
                    <text x="10" y="125" fill="#94a3b8" fontSize="10">底基层</text>
                    
                    <rect x="0" y="180" width="800" height="120" fill="#4a4a4a" rx="2" />
                    <text x="10" y="175" fill="#94a3b8" fontSize="10">路基 (压实土)</text>

                    {[0, 1, 2, 3].map((i) => {
                      const sensor = displaySensors[i];
                      if (!sensor) return null;
                      const x = 150 + i * 180;
                      const isSelected = selectedSensor === sensor.id;
                      const isCritical = sensor.status === 'critical';
                      
                      return (
                        <g key={sensor.id}>
                          <circle 
                            cx={x} 
                            cy={85} 
                            r={isSelected ? 18 : 14}
                            fill={isCritical ? '#ef4444' : isSelected ? 'var(--gold)' : '#10b981'}
                            opacity={0.9}
                            style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                            onClick={() => setSelectedSensor(sensor.id)}
                          >
                            <animate 
                              attributeName="r" 
                              values={`${isSelected ? 18 : 14};${isSelected ? 22 : 16};${isSelected ? 18 : 14}`} 
                              dur="2s" 
                              repeatCount="indefinite" 
                            />
                          </circle>
                          <text 
                            x={x} 
                            y={50} 
                            fill="#f8fafc" 
                            fontSize="11" 
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {sensor.locationName.slice(0, 4)}
                          </text>
                          <text 
                            x={x} 
                            y={125} 
                            fill="#94a3b8" 
                            fontSize="9" 
                            textAnchor="middle"
                          >
                            压实度: <tspan fill={getStatusColor(sensor.status)}>{sensor.actualCompactionDegree.toFixed(1)}%</tspan>
                          </text>
                        </g>
                      );
                    })}
                    
                    <line x1="0" y1="300" x2="800" y2="300" stroke="#64748b" strokeWidth="1" strokeDasharray="5,5" />
                    <text x="750" y="295" fill="#64748b" fontSize="10">1500m</text>
                  </svg>
                </Box>

                <Box sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  display: 'flex',
                  gap: 3,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>正常</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>警告</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>危险</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '500px', overflow: 'auto' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Straighten sx={{ fontSize: 20 }} />
                传感器实时数据
              </Typography>
              
              <Grid container spacing={1.5}>
                {displaySensors.map((sensor) => (
                  <Grid size={{ xs: 12 }} key={sensor.id}>
                    <Box
                      onClick={() => setSelectedSensor(sensor.id)}
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        bgcolor: selectedSensor === sensor.id 
                          ? 'rgba(212, 175, 55, 0.15)'
                          : sensor.status === 'critical' 
                          ? 'rgba(239, 68, 68, 0.1)' 
                          : sensor.status === 'warning'
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${selectedSensor === sensor.id 
                          ? 'var(--gold)'
                          : sensor.status === 'critical' 
                          ? 'rgba(239, 68, 68, 0.3)' 
                          : sensor.status === 'warning'
                          ? 'rgba(245, 158, 11, 0.3)'
                          : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        animation: sensor.status === 'critical' ? 'glow 1.5s ease-in-out infinite' : 'none',
                        '&:hover': {
                          transform: 'translateX(4px)',
                          borderColor: 'var(--gold)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {sensor.locationName}
                        </Typography>
                        <Chip 
                          label={sensor.status === 'normal' ? '正常' : sensor.status === 'warning' ? '警告' : '危险'}
                          size="small"
                          sx={{
                            bgcolor: sensor.status === 'critical' 
                              ? 'rgba(239, 68, 68, 0.2)' 
                              : sensor.status === 'warning'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)',
                            color: sensor.status === 'critical' ? '#ef4444' : sensor.status === 'warning' ? '#f59e0b' : '#10b981',
                            fontSize: '0.65rem',
                          }}
                        />
                      </Box>
                      
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Speed sx={{ fontSize: 12, color: 'var(--gold)' }} />
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                              压实度
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--gold)', fontSize: '1rem' }}>
                            <AnimatedNumber value={sensor.actualCompactionDegree} suffix="%" />
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <WaterDrop sx={{ fontSize: 12, color: '#0EA5E9' }} />
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                              含水率
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                            <AnimatedNumber value={sensor.fieldMoistureContent} suffix="%" />
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Thermostat sx={{ fontSize: 12, color: '#F59E0B' }} />
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                              温度
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                            <AnimatedNumber value={sensor.subgradeTemperature} suffix="°C" />
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Straighten sx={{ fontSize: 12, color: '#8B5CF6' }} />
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                              干密度
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                            <AnimatedNumber value={sensor.actualDryDensity} suffix="" decimals={2} />
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
