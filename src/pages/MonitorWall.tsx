import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Collapse } from '@mui/material';
import { 
  Warning, CheckCircle, Error as ErrorIcon, 
  LocationOn, Speed, WaterDrop, Thermostat, Compress, Traffic,
  Construction, Security, OtherHouses, Fullscreen, FullscreenExit
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { refreshAllData, setExpanded } from '../store/slices/realtimeDataSlice';

interface DisplayConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  sectionType: 'drainage' | 'safety' | 'auxiliary' | 'structure' | 'other';
  description: string;
}

const displayConfigs: DisplayConfig[] = [
  { id: 'drainage', title: '排水附近路况', icon: <Construction />, sectionType: 'drainage', description: 'K1+000 - K1+150 排水设施周边' },
  { id: 'safety', title: '安全设施附近路况', icon: <Security />, sectionType: 'safety', description: 'K1+200 - K1+350 安全设施区域' },
  { id: 'auxiliary', title: '附属设施路况', icon: <Construction />, sectionType: 'auxiliary', description: 'K1+400 - K1+550 附属设施区域' },
  { id: 'structure', title: '结构物附近路况', icon: <OtherHouses />, sectionType: 'structure', description: 'K1+600 - K1+750 结构物周边' },
  { id: 'other1', title: '其他重要路况①', icon: <LocationOn />, sectionType: 'other', description: 'K1+800 - K1+950 重要路段' },
  { id: 'other2', title: '其他重要路况②', icon: <LocationOn />, sectionType: 'other', description: 'K2+000 - K2+150 重要路段' },
  { id: 'other3', title: '其他重要路况③', icon: <LocationOn />, sectionType: 'other', description: 'K2+200 - K2+350 重要路段' },
  { id: 'other4', title: '其他重要路况④', icon: <LocationOn />, sectionType: 'other', description: 'K2+400 - K2+500 重要路段' },
];

export default function MonitorWall() {
  const dispatch = useAppDispatch();
  const { sensors, hasWarning, isExpanded } = useAppSelector(state => state.realtimeData);
  const [fullscreen, setFullscreen] = useState(false);
  const [jumped, setJumped] = useState(false);

  const criticalSensor = sensors.find(s => s.status === 'critical');

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(refreshAllData());
      setJumped(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (hasWarning && criticalSensor && !jumped) {
      const timer = setTimeout(() => {
        const warningCard = document.getElementById(`sensor-card-${criticalSensor.id}`);
        if (warningCard) {
          warningCard.scrollIntoView({ behavior: 'auto', block: 'center' });
          setJumped(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasWarning, criticalSensor, jumped]);

  const importantDisplays = displayConfigs.slice(0, 4);
  const allDisplays = isExpanded ? displayConfigs : importantDisplays;

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'critical': return '危险';
      case 'warning': return '警告';
      default: return '正常';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'critical': return <ErrorIcon sx={{ fontSize: 16 }} />;
      case 'warning': return <Warning sx={{ fontSize: 16 }} />;
      default: return <CheckCircle sx={{ fontSize: 16 }} />;
    }
  };

  const handleExpand = () => {
    dispatch(setExpanded(!isExpanded));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              实时监控大屏
            </Typography>
            {hasWarning && (
              <Chip 
                icon={<Warning sx={{ fontSize: 16 }} />}
                label="检测到危险路段"
                sx={{ 
                  bgcolor: 'rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  animation: 'pulse 1s ease-in-out infinite',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
            <LocationOn sx={{ fontSize: 16, color: 'var(--gold)' }} />
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              广东省阳江市高新区镍铁渣道路试验段
            </Typography>
            <Chip 
              label={`监测点: ${sensors.length}个`} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(212, 175, 55, 0.15)',
                color: 'var(--gold)',
                fontSize: '0.7rem',
              }} 
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant={isExpanded ? 'contained' : 'outlined'}
            startIcon={isExpanded ? <FullscreenExit /> : <Fullscreen />}
            onClick={handleExpand}
            sx={{
              borderColor: 'var(--gold)',
              color: isExpanded ? '#000' : 'var(--gold)',
              bgcolor: isExpanded ? 'var(--gold)' : 'transparent',
              '&:hover': {
                bgcolor: isExpanded ? 'var(--gold-light)' : 'rgba(212, 175, 55, 0.15)',
              }
            }}
          >
            {isExpanded ? '收起全部' : '展开全部'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setFullscreen(!fullscreen)}
            sx={{
              borderColor: 'var(--border-light)',
              color: 'var(--text-secondary)',
            }}
          >
            {fullscreen ? <FullscreenExit /> : <Fullscreen />}
          </Button>
        </Box>
      </Box>

      {hasWarning && criticalSensor && (
        <Box sx={{ 
          mb: 3, 
          p: 3, 
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.15) 100%)',
          border: '3px solid rgba(239, 68, 68, 0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          animation: 'glow 1.5s ease-in-out infinite',
          boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)',
        }}>
          <Box sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.6)',
            animation: 'pulse 1s ease-in-out infinite',
          }}>
            <Warning sx={{ fontSize: 36, color: '#fff' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: '#ef4444', fontWeight: 700, mb: 1 }}>
              ⚠️ 危险路段警报 - 已定位到具体位置
            </Typography>
            <Box sx={{ 
              p: 2, 
              borderRadius: '12px', 
              bgcolor: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, mb: 0.5, fontSize: '1rem' }}>
                📍 危险位置: {criticalSensor.locationName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--gold)', mb: 0.5 }}>
                🗺️ 项目位置: 广东省阳江市高新区镍铁渣道路试验段
              </Typography>
              <Typography variant="body2" sx={{ color: '#0EA5E9' }}>
                📌 GPS坐标: 纬度 {criticalSensor.gpsCoordinates.lat.toFixed(5)}°, 经度 {criticalSensor.gpsCoordinates.lng.toFixed(5)}°
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={jumped ? "✓ 已定位" : "定位中..."}
            sx={{ 
              bgcolor: jumped ? '#10b981' : '#ef4444',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              py: 2,
              px: 3,
              animation: jumped ? 'none' : 'pulse 1s ease-in-out infinite',
            }}
          />
        </Box>
      )}

      <Box sx={{ 
        flex: 1, 
        display: 'grid', 
        gridTemplateColumns: isExpanded 
          ? 'repeat(4, 1fr)' 
          : 'repeat(2, 1fr)',
        gap: 2.5,
        overflow: 'auto',
      }}>
        {allDisplays.map((display, idx) => {
          const sensorData = sensors[idx] || sensors.find(s => s.id === `S${idx + 1}`);
          const isCritical = sensorData?.status === 'critical';
          const isWarning = sensorData?.status === 'warning';
          const isSelected = criticalSensor?.id === sensorData?.id;

          return (
            <Card 
              key={display.id}
              id={`sensor-card-${sensorData?.id || ''}`}
              sx={{ 
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                border: isSelected 
                  ? '2px solid var(--gold)' 
                  : isCritical 
                  ? '2px solid #ef4444'
                  : '1px solid var(--border-subtle)',
                transition: 'all 0.3s ease',
                animation: isCritical ? 'glow 1.5s ease-in-out infinite' : 'none',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'var(--gold)',
                  boxShadow: '0 8px 30px rgba(212, 175, 55, 0.2)',
                }
              }}
            >
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: isCritical 
                  ? 'linear-gradient(90deg, #ef4444, #f59e0b)' 
                  : isWarning
                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                  : 'linear-gradient(90deg, var(--gold), var(--gold-light))',
              }} />
              
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: isCritical 
                        ? 'rgba(239, 68, 68, 0.2)' 
                        : 'rgba(212, 175, 55, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCritical ? '#ef4444' : 'var(--gold)',
                    }}>
                      {display.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }}>
                        {display.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                        {display.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    icon={getStatusIcon(sensorData?.status)}
                    label={getStatusText(sensorData?.status)}
                    size="small"
                    sx={{
                      bgcolor: isCritical 
                        ? 'rgba(239, 68, 68, 0.2)' 
                        : isWarning
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(16, 185, 129, 0.2)',
                      color: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '10px',
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Compress sx={{ fontSize: 14, color: 'var(--gold)' }} />
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                          压实度
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: isCritical ? '#ef4444' : 'var(--gold)', fontSize: '1.1rem' }}>
                        {sensorData?.actualCompactionDegree.toFixed(1) || '--'}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '10px',
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Speed sx={{ fontSize: 14, color: 'var(--gold)' }} />
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                          干密度
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {sensorData?.actualDryDensity.toFixed(2) || '--'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '10px',
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <WaterDrop sx={{ fontSize: 14, color: '#0EA5E9' }} />
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                          含水率
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {sensorData?.fieldMoistureContent.toFixed(1) || '--'}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: '10px',
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Thermostat sx={{ fontSize: 14, color: '#F59E0B' }} />
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                          温度
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        {sensorData?.subgradeTemperature.toFixed(1) || '--'}°C
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {sensorData && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid var(--border-subtle)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                        GPS: {sensorData.gpsCoordinates.lat.toFixed(5)}, {sensorData.gpsCoordinates.lng.toFixed(5)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Traffic sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                        荷载次数: {sensorData.trafficLoadCount.toLocaleString()} | 干湿循环: {sensorData.dryWetCycleCount}次
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--gold)' }}>
            全部探测仪数据汇总
          </Typography>
          <Card>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>监测点</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>状态</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>压实度(%)</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>干密度(g/cm³)</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>含水率(%)</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>饱和度(%)</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>围压(kPa)</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>偏应力(kPa)</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>温度(°C)</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>荷载次数</th>
                  </tr>
                </thead>
                <tbody>
                  {sensors.map((sensor) => (
                    <tr 
                      key={sensor.id}
                      style={{ 
                        borderBottom: '1px solid var(--border-subtle)',
                        background: sensor.status === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{sensor.locationName}</td>
                      <td style={{ padding: '12px' }}>
                        <Chip 
                          icon={getStatusIcon(sensor.status)}
                          label={getStatusText(sensor.status)}
                          size="small"
                          sx={{
                            bgcolor: sensor.status === 'critical' ? 'rgba(239, 68, 68, 0.2)' : sensor.status === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: sensor.status === 'critical' ? '#ef4444' : sensor.status === 'warning' ? '#f59e0b' : '#10b981',
                            fontSize: '0.7rem',
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: sensor.status === 'critical' ? '#ef4444' : 'var(--gold)', fontWeight: 600 }}>{sensor.actualCompactionDegree.toFixed(1)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>{sensor.actualDryDensity.toFixed(2)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>{sensor.fieldMoistureContent.toFixed(1)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>{sensor.saturation.toFixed(1)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>{sensor.confiningPressure.toFixed(1)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>{sensor.deviatorStress.toFixed(1)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>{sensor.subgradeTemperature.toFixed(1)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-primary)' }}>{sensor.trafficLoadCount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Card>
        </Box>
      </Collapse>
    </Box>
  );
}
