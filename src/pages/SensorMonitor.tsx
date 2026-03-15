import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  LocationOn,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
  Build,
  Info,
} from '@mui/icons-material';
import type { SensorData, MaintenanceRecommendation } from '../types';

const ROAD_LENGTH = 5000; // 道路总长5km
const SENSOR_COUNT = 12;

const generateMockSensors = (): SensorData[] => {
  const sensors: SensorData[] = [];
  const interval = ROAD_LENGTH / (SENSOR_COUNT - 1);
  
  for (let i = 0; i < SENSOR_COUNT; i++) {
    const position = Math.round(i * interval);
    const baseModulus = 80 + Math.random() * 40;
    const modulus = Math.round(baseModulus * 10) / 10;
    const thresholdMin = 60;
    const thresholdMax = 150;
    
    let status: SensorData['status'] = 'normal';
    if (modulus < thresholdMin * 0.8 || modulus > thresholdMax * 1.2) {
      status = 'critical';
    } else if (modulus < thresholdMin || modulus > thresholdMax) {
      status = 'warning';
    }
    
    sensors.push({
      id: `S${String(i + 1).padStart(3, '0')}`,
      name: `传感器 ${i + 1}`,
      position,
      status,
      resilientModulus: modulus,
      thresholdMin,
      thresholdMax,
      lastUpdate: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      temperature: Math.round(20 + Math.random() * 15),
      humidity: Math.round(40 + Math.random() * 30),
    });
  }
  
  return sensors;
};

const getMaintenanceRecommendation = (
  modulus: number,
  thresholdMin: number,
  thresholdMax: number
): MaintenanceRecommendation => {
  if (modulus < thresholdMin * 0.5) {
    return {
      level: 'serious',
      action: '需进行大修或重建处理，建议刨除原路面结构层，重新铺设',
      urgency: 'urgent',
    };
  }
  if (modulus < thresholdMin * 0.8) {
    return {
      level: 'moderate',
      action: '建议进行结构性补强，如注浆加固或铺设基层',
      urgency: 'attention',
    };
  }
  if (modulus < thresholdMin) {
    return {
      level: 'minor',
      action: '建议进行表层维修，如沥青混凝土罩面',
      urgency: 'attention',
    };
  }
  if (modulus > thresholdMax * 1.2) {
    return {
      level: 'moderate',
      action: '模量过高可能表示过度压实，建议适当松散处理',
      urgency: 'routine',
    };
  }
  return {
    level: 'normal',
    action: '路面状况良好，按常规养护计划执行即可',
    urgency: 'routine',
  };
};

const getStatusColor = (status: SensorData['status']) => {
  switch (status) {
    case 'critical': return '#EF4444';
    case 'warning': return '#F59E0B';
    default: return '#10B981';
  }
};

const getStatusLabel = (status: SensorData['status']) => {
  switch (status) {
    case 'critical': return '严重异常';
    case 'warning': return '轻微异常';
    default: return '正常';
  }
};

export default function SensorMonitor() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSensors();
    const interval = setInterval(loadSensors, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSensors = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSensors(generateMockSensors());
      setIsLoading(false);
    }, 500);
  };

  const criticalSensors = sensors.filter(s => s.status === 'critical');
  const warningSensors = sensors.filter(s => s.status === 'warning');

  const handleSensorClick = (sensor: SensorData) => {
    setSelectedSensor(sensor);
  };

  const recommendation = selectedSensor
    ? getMaintenanceRecommendation(
        selectedSensor.resilientModulus,
        selectedSensor.thresholdMin,
        selectedSensor.thresholdMax
      )
    : null;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}>
            路面传感器监控
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
            实时监测路面回弹模量，异常位置精准定位
          </Typography>
        </Box>
        <Tooltip title="刷新数据">
          <IconButton onClick={loadSensors} sx={{ color: 'var(--primary)' }}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {criticalSensors.length > 0 && (
        <Alert 
          severity="error"
          icon={<ErrorIcon />}
          sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
        >
          <Typography variant="body2">
            <strong>警告：</strong>检测到 {criticalSensors.length} 个传感器回弹模量严重超标！
            位置：{criticalSensors.map(s => `K${Math.floor(s.position/1000)}+${s.position%1000}`).join('、')}
          </Typography>
        </Alert>
      )}

      {warningSensors.length > 0 && criticalSensors.length === 0 && (
        <Alert 
          severity="warning"
          icon={<Warning />}
          sx={{ mb: 3, bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}
        >
          <Typography variant="body2">
            <strong>提示：</strong>检测到 {warningSensors.length} 个传感器数据轻微异常，需关注
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ 
            background: 'linear-gradient(145deg, rgba(21, 29, 43, 0.95) 0%, rgba(10, 14, 23, 0.9) 100%)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <LocationOn sx={{ color: 'var(--primary)' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                  道路传感器分布图
                </Typography>
                <Chip 
                  label={`共 ${SENSOR_COUNT} 个传感器`} 
                  size="small" 
                  sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
                />
              </Box>

              {isLoading ? (
                <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LinearProgress sx={{ width: '50%' }} />
                </Box>
              ) : (
                <Box>
                  <Box sx={{ mb: 3, px: 2 }}>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1.5 }}>
                      点击下方标记点查看详情
                    </Typography>
                    <Box sx={{ 
                      position: 'relative', 
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                      <Box sx={{ 
                        flex: 1, 
                        height: 16, 
                        borderRadius: 1,
                        background: 'linear-gradient(90deg, #1F2937 0%, #374151 50%, #1F2937 100%)',
                        position: 'relative',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}>
                        {sensors.map((sensor, index) => {
                          const percent = (index / (SENSOR_COUNT - 1)) * 100;
                          const isSelected = selectedSensor?.id === sensor.id;
                          return (
                            <Tooltip 
                              key={sensor.id}
                              title={
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>{sensor.name}</Typography>
                                  <Typography variant="caption">
                                    桩号: K{Math.floor(sensor.position/1000)}+{String(sensor.position%1000).padStart(3, '0')}
                                  </Typography>
                                  <br />
                                  <Typography variant="caption">
                                    回弹模量: {sensor.resilientModulus} MPa
                                  </Typography>
                                </Box>
                              }
                            >
                              <Box
                                onClick={() => handleSensorClick(sensor)}
                                sx={{
                                  position: 'absolute',
                                  left: `${percent}%`,
                                  top: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  cursor: 'pointer',
                                  zIndex: isSelected ? 10 : 1,
                                }}
                              >
                                <Box sx={{
                                  width: isSelected ? 44 : 32,
                                  height: isSelected ? 44 : 32,
                                  borderRadius: '50%',
                                  bgcolor: getStatusColor(sensor.status),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: `0 0 20px ${getStatusColor(sensor.status)}`,
                                  border: isSelected ? '3px solid #FFFFFF' : '2px solid rgba(255,255,255,0.3)',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.15)',
                                  },
                                }}>
                                  {sensor.status === 'normal' ? (
                                    <CheckCircle sx={{ fontSize: isSelected ? 20 : 14, color: '#FFFFFF' }} />
                                  ) : sensor.status === 'warning' ? (
                                    <Warning sx={{ fontSize: isSelected ? 20 : 14, color: '#FFFFFF' }} />
                                  ) : (
                                    <ErrorIcon sx={{ fontSize: isSelected ? 20 : 14, color: '#FFFFFF', animation: 'pulse 1s infinite' }} />
                                  )}
                                </Box>
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      px: 1,
                      color: 'var(--text-muted)',
                      fontSize: '0.75rem',
                    }}>
                      <span>K0+000</span>
                      <span>K1+000</span>
                      <span>K2+000</span>
                      <span>K3+000</span>
                      <span>K4+000</span>
                      <span>K5+000</span>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: 1.5,
                    mt: 3,
                  }}>
                    {sensors.map(sensor => (
                      <Box
                        key={sensor.id}
                        onClick={() => handleSensorClick(sensor)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: selectedSensor?.id === sensor.id ? `${getStatusColor(sensor.status)}20` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${selectedSensor?.id === sensor.id ? getStatusColor(sensor.status) : 'var(--border-subtle)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: `${getStatusColor(sensor.status)}15`,
                            borderColor: getStatusColor(sensor.status),
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: getStatusColor(sensor.status),
                            boxShadow: `0 0 8px ${getStatusColor(sensor.status)}`,
                          }} />
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {sensor.id}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.8rem' }}>
                          K{Math.floor(sensor.position/1000)}+{String(sensor.position%1000).padStart(3, '0')}
                        </Typography>
                        <Typography variant="h6" sx={{ color: getStatusColor(sensor.status), fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                          {sensor.resilientModulus} <Typography component="span" variant="caption">MPa</Typography>
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 3, justifyContent: 'center' }}>
                {[
                  { status: 'normal', label: '正常', color: '#10B981' },
                  { status: 'warning', label: '轻微异常', color: '#F59E0B' },
                  { status: 'critical', label: '严重异常', color: '#EF4444' },
                ].map(item => (
                  <Box key={item.status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info sx={{ color: 'var(--primary)', fontSize: 20 }} />
                传感器状态概览
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: '正常', value: sensors.filter(s => s.status === 'normal').length, color: '#10B981' },
                  { label: '轻微异常', value: sensors.filter(s => s.status === 'warning').length, color: '#F59E0B' },
                  { label: '严重异常', value: sensors.filter(s => s.status === 'critical').length, color: '#EF4444' },
                ].map(item => (
                  <Grid size={{ xs: 4 }} key={item.label}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: `${item.color}15`,
                      border: `1px solid ${item.color}30`,
                      textAlign: 'center',
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: item.color }}>
                        {item.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="h6" sx={{ fontWeight: 600, mt: 4, mb: 2 }}>
                规范阈值
              </Typography>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>允许范围</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--primary)', fontWeight: 600 }}>60 - 150 MPa</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>监测路段</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--primary)', fontWeight: 600 }}>K0+000 - K5+000</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                传感器详细数据
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>传感器ID</TableCell>
                      <TableCell>桩号位置</TableCell>
                      <TableCell>回弹模量(MPa)</TableCell>
                      <TableCell>状态</TableCell>
                      <TableCell>温度(°C)</TableCell>
                      <TableCell>湿度(%)</TableCell>
                      <TableCell>更新时间</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sensors.map(sensor => (
                      <TableRow 
                        key={sensor.id}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'rgba(0,217,165,0.05)' },
                          bgcolor: selectedSensor?.id === sensor.id ? 'rgba(0,217,165,0.1)' : 'transparent',
                        }}
                        onClick={() => handleSensorClick(sensor)}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{sensor.id}</TableCell>
                        <TableCell>K{Math.floor(sensor.position/1000)}+{String(sensor.position%1000).padStart(3, '0')}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ 
                              width: 60, 
                              height: 8, 
                              borderRadius: 4, 
                              bgcolor: 'rgba(255,255,255,0.1)',
                              overflow: 'hidden',
                            }}>
                              <Box sx={{ 
                                width: `${Math.min((sensor.resilientModulus / 200) * 100, 100)}%`, 
                                height: '100%', 
                                bgcolor: getStatusColor(sensor.status),
                                borderRadius: 4,
                              }} />
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: getStatusColor(sensor.status) }}>
                              {sensor.resilientModulus}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusLabel(sensor.status)}
                            size="small"
                            sx={{ 
                              bgcolor: `${getStatusColor(sensor.status)}20`,
                              color: getStatusColor(sensor.status),
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>{sensor.temperature}</TableCell>
                        <TableCell>{sensor.humidity}</TableCell>
                        <TableCell sx={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          {new Date(sensor.lastUpdate).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={(e) => { e.stopPropagation(); handleSensorClick(sensor); }}
                          >
                            <Info fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog 
        open={!!selectedSensor} 
        onClose={() => setSelectedSensor(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedSensor && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ color: getStatusColor(selectedSensor.status) }} />
              {selectedSensor.name} - 异常详情与处置方案
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3, mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>桩号位置</Typography>
                    <Typography variant="h6">K{Math.floor(selectedSensor.position/1000)}+{String(selectedSensor.position%1000).padStart(3, '0')}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>当前状态</Typography>
                    <Chip 
                      label={getStatusLabel(selectedSensor.status)}
                      size="small"
                      sx={{ 
                        bgcolor: `${getStatusColor(selectedSensor.status)}20`,
                        color: getStatusColor(selectedSensor.status),
                        fontWeight: 600,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>回弹模量</Typography>
                    <Typography variant="h5" sx={{ color: getStatusColor(selectedSensor.status), fontWeight: 700 }}>
                      {selectedSensor.resilientModulus} <Typography component="span" variant="body2">MPa</Typography>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>规范阈值</Typography>
                    <Typography variant="body1">
                      {selectedSensor.thresholdMin} - {selectedSensor.thresholdMax} MPa
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {recommendation && recommendation.level !== 'normal' && (
                <Box sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  bgcolor: recommendation.level === 'serious' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                  border: `1px solid ${recommendation.level === 'serious' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Build sx={{ color: getStatusColor(selectedSensor.status) }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      建议处置方案
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {recommendation.action}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedSensor(null)}>关闭</Button>
              <Button variant="contained" startIcon={<Build />}>
                生成维修工单
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
