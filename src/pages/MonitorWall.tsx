import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Collapse, IconButton } from '@mui/material';
import { 
  Warning, CheckCircle, Error as ErrorIcon, 
  LocationOn, Speed, WaterDrop, Thermostat, Compress, Traffic,
  Construction, Security, OtherHouses, Fullscreen, FullscreenExit, Build, CheckCircleOutlined
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { refreshAllData, setExpanded, clearWarning } from '../store/slices/realtimeDataSlice';
import DangerLocationMap from './DangerLocationMap';

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

const faultDiagnosis: Record<string, { cause: string; solution: string }> = {
  'S001': { cause: '压实度不足(85%)，含水率偏高(17%)', solution: '建议重新压实处理，适当降低含水率' },
  'S002': { cause: '路基含水率过高(18%)，压实度不达标', solution: '加强排水晾晒，补充压实作业' },
  'S003': { cause: '颗粒级配不良，局部压实度偏低', solution: '补充集料，均匀压实' },
  'S004': { cause: '结构层厚度不足，压实度偏低', solution: '增加结构层厚度，重新压实' },
  'S005': { cause: '现场含水率偏高(16%)，饱和度较大', solution: '翻松晾晒，控制含水率后压实' },
  'S006': { cause: '压实度未达标(88%)，材料含水量过大', solution: '洒水或晾晒调整含水率后压实' },
  'S007': { cause: '结构物附近压实困难，压实度不足', solution: '采用小型压实设备加强压实' },
  'S008': { cause: '温度过低影响压实效果(15°C)', solution: '调整施工时间，选择适宜气温施工' },
  'S009': { cause: '路面平整度不足，压实度略低', solution: '精平后补充压实' },
  'S010': { cause: '排水不畅导致含水率偏高', solution: '完善排水设施，加强排水' },
  'S011': { cause: '交通荷载作用下压实度下降', solution: '适当增加压实遍数' },
  'S012': { cause: '干湿循环导致强度下降', solution: '加强养护，必要时进行加固处理' },
};

export default function MonitorWall() {
  const dispatch = useAppDispatch();
  const { sensors, hasWarning, isExpanded, criticalSectionId } = useAppSelector(state => state.realtimeData);
  const [fullscreen, setFullscreen] = useState(false);
  const [jumped, setJumped] = useState(false);
  const [resolvedId, setResolvedId] = useState<string | null>(null);

  const criticalSensor = sensors.find(s => s.status === 'critical');

  useEffect(() => {
    dispatch(refreshAllData());
    setTimeout(() => {
      setJumped(true);
    }, 5000);
    
    const interval = setInterval(() => {
      dispatch(refreshAllData());
      setJumped(false);
      setTimeout(() => {
        setJumped(true);
      }, 800);
    }, 15000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (hasWarning && criticalSensor && !jumped) {
      const timer = setTimeout(() => {
        setJumped(true);
      }, 800);
      return () => clearTimeout(timer);
    } else if (!hasWarning) {
      setJumped(false);
    }
  }, [hasWarning, criticalSensor, jumped]);

  const handleResolve = (sensorId: string) => {
    setResolvedId(sensorId);
    dispatch(clearWarning());
  };

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

      {hasWarning && criticalSensor && jumped && (
        <Box sx={{ 
          mb: 3, 
          p: 4, 
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(220, 38, 38, 0.3) 100%)',
          border: '4px solid rgba(239, 68, 68, 0.9)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          animation: 'glow 0.8s ease-in-out infinite',
          boxShadow: '0 0 60px rgba(239, 68, 68, 0.6), inset 0 0 30px rgba(239, 68, 68, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #ef4444, #f59e0b, #ef4444)',
            animation: 'gradientMove 1s linear infinite',
          }
        }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.8)',
            animation: 'pulse 0.5s ease-in-out infinite',
            flexShrink: 0,
          }}>
            <Warning sx={{ fontSize: 48, color: '#fff' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 800, mb: 2, fontSize: '1.5rem' }}>
              ⚠️ 危险路段警报 - 已定位到具体位置
            </Typography>
            <Box sx={{ 
              p: 3, 
              borderRadius: '16px', 
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
            }}>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 1.5, fontSize: '1.2rem' }}>
                📍 危险位置: {criticalSensor.locationName}
              </Typography>
              <Typography variant="body1" sx={{ color: 'var(--gold)', mb: 1.5, fontSize: '1rem' }}>
                🗺️ 项目位置: 广东省阳江市高新区镍铁渣道路试验段
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
                <Box sx={{ 
                  px: 2.5, 
                  py: 1, 
                  borderRadius: '10px',
                  bgcolor: '#0EA5E9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  boxShadow: '0 0 15px rgba(14, 165, 233, 0.5)',
                }}>
                  <LocationOn sx={{ fontSize: 22, color: '#fff' }} />
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                    GPS: {criticalSensor.gpsCoordinates.lat.toFixed(5)}°, {criticalSensor.gpsCoordinates.lng.toFixed(5)}°
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 140 }}>
            <Chip 
              label="✓ 已定位"
              sx={{ 
                bgcolor: '#10b981',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.1rem',
                py: 2,
                px: 3,
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.5)',
              }}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<CheckCircleOutlined />}
              onClick={() => handleResolve(criticalSensor.id)}
              sx={{
                bgcolor: '#10B981',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.1rem',
                py: 1.5,
                px: 2,
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
                border: '2px solid #10B981',
                '&:hover': { bgcolor: '#059669', boxShadow: '0 0 30px rgba(16, 185, 129, 0.8)' },
              }}
            >
              解决
            </Button>
          </Box>
        </Box>
      )}

      {resolvedId && (
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <CheckCircle sx={{ color: '#10B981' }} />
          <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 600 }}>
            已成功解决 {sensors.find(s => s.id === resolvedId)?.locationName || resolvedId} 的问题
          </Typography>
          <Button 
            size="small" 
            onClick={() => setResolvedId(null)}
            sx={{ ml: 'auto', color: 'var(--text-secondary)' }}
          >
            关闭
          </Button>
        </Box>
      )}
        {criticalSensor && ( // 只要有危险传感器就显示
        <Box sx={{ mb: 3, mt: 2 }}>
          <Typography variant="h5" sx={{ color: '#e4e8ec', mb: 1 }}>
            🗺️ 危险位置地图
          </Typography>
          <DangerLocationMap height="400px" />
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
          const sensorData = sensors[idx] || sensors.find(s => s.id === `S${String(idx + 1).padStart(3, '0')}`);
          const isCritical = sensorData?.status === 'critical';
          const isWarning = sensorData?.status === 'warning';
          const isSelected = criticalSensor?.id === sensorData?.id;
          const diagnosis = sensorData ? faultDiagnosis[sensorData.id] : null;

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

                {isCritical && diagnosis && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid var(--border-subtle)' }}>
                    <Box sx={{ mb: 1.5, p: 1.5, borderRadius: 8, bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Warning sx={{ fontSize: 14, color: '#F59E0B' }} />
                        <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.7rem' }}>
                          问题原因
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#FFFFFF', fontSize: '0.7rem' }}>
                        {diagnosis.cause}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 8, bgcolor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Build sx={{ fontSize: 14, color: '#10B981' }} />
                        <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600, fontSize: '0.7rem' }}>
                          解决方法
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#FFFFFF', fontSize: '0.7rem' }}>
                        {diagnosis.solution}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {sensorData && !isCritical && (
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