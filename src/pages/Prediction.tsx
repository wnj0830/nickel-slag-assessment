import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Slider,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { TrendingUp, Science, CheckCircle, AutoGraph, Speed, WaterDrop, Compress, Warning, Error as ErrorIcon, Build } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPredicting, setCurrentResult, addPrediction } from '../store/slices/predictionSlice';
import { addHistoryRecord } from '../store/slices/authSlice';
import { pinnPredictor } from '../services/pinnService';

const THRESHOLD_MIN = 60;
const THRESHOLD_MAX = 150;

const getPredictionStatus = (modulus: number) => {
  if (modulus < THRESHOLD_MIN * 0.8 || modulus > THRESHOLD_MAX * 1.2) {
    return { level: 'critical', label: '严重超标', color: '#EF4444', action: '需进行大修或重建处理，建议刨除原路面结构层，重新铺设' };
  }
  if (modulus < THRESHOLD_MIN || modulus > THRESHOLD_MAX) {
    return { level: 'warning', label: '轻微超标', color: '#F59E0B', action: '建议进行表层维修或结构性补强' };
  }
  return { level: 'normal', label: '正常', color: '#10B981', action: '路面状况良好，按常规养护计划执行即可' };
};

const inputFields = [
  { key: 'particleSize', label: '颗粒粒径', min: 0.1, max: 50, step: 0.1, default: 5, unit: 'mm', icon: <Compress /> },
  { key: 'stressLevel', label: '围压/应力水平', min: 10, max: 500, step: 5, default: 100, unit: 'kPa', icon: <Speed /> },
  { key: 'loadingRate', label: '加载速率', min: 0.1, max: 100, step: 0.1, default: 1, unit: 'mm/min', icon: <TrendingUp /> },
  { key: 'moistureContent', label: '含水率', min: 5, max: 30, step: 0.5, default: 12, unit: '%', icon: <WaterDrop /> },
  { key: 'compactionDegree', label: '压实度', min: 85, max: 100, step: 0.5, default: 95, unit: '%', icon: <Compress /> },
  { key: 'slagContent', label: '镍铁渣掺量', min: 0, max: 100, step: 5, default: 30, unit: '%', icon: <Science /> },
  { key: 'cyclicTimes', label: '循环加载次数', min: 1, max: 10000, step: 1, default: 1000, unit: '次', icon: <AutoGraph /> },
];

export default function Prediction() {
  const dispatch = useAppDispatch();
  const { isPredicting, currentResult, history } = useAppSelector(state => state.predictions);
  const constraints = useAppSelector(state => state.models.constraints);
  const processedData = useAppSelector(state => state.experiments.processedData);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const [inputs, setInputs] = useState<Record<string, number>>({
    particleSize: 5,
    stressLevel: 100,
    loadingRate: 1,
    moistureContent: 12,
    compactionDegree: 95,
    slagContent: 30,
    cyclicTimes: 1000,
  });

  useEffect(() => {
    pinnPredictor.setTrainingData(processedData);
  }, [processedData]);

  const handleInputChange = (key: string, value: number) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handlePredict = async () => {
    dispatch(setPredicting(true));
    try {
      const result = await pinnPredictor.predict(inputs as any, constraints);
      dispatch(setCurrentResult(result));
      dispatch(addPrediction(result));
      
      if (isAuthenticated) {
        dispatch(addHistoryRecord({
          id: Date.now().toString(),
          timestamp: Date.now(),
          input: inputs,
          output: result.output,
        }));
      }
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      dispatch(setPredicting(false));
    }
  };

  const getModelStatus = () => {
    if (processedData.length > 0) {
      return { label: '数据增强模式', color: 'success' as const, icon: <CheckCircle /> };
    }
    return { label: '基础模式', color: 'default' as const, icon: <Science /> };
  };

  const modelStatus = getModelStatus();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            background: 'linear-gradient(135deg, #F9FAFB 0%, #9CA3AF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}>
            智能评估
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
            基于物理信息神经网络的回弹模量精准预测
          </Typography>
        </Box>
        <Chip 
          icon={modelStatus.icon} 
          label={modelStatus.label} 
          color={modelStatus.color}
          sx={{ 
            background: modelStatus.color === 'success' ? 'linear-gradient(135deg, rgba(139, 146, 152, 0.2) 0%, rgba(90, 97, 104, 0.15) 100%)' : undefined,
            border: '1px solid rgba(139, 146, 152, 0.3)',
          }}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ 
            background: 'linear-gradient(145deg, rgba(21, 29, 43, 0.95) 0%, rgba(10, 14, 23, 0.9) 100%)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AutoGraph sx={{ color: '#FFFFFF', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                  输入参数
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: 'var(--border-subtle)' }} />

              <Grid container spacing={2.5}>
                {inputFields.map(field => (
                  <Grid size={{ xs: 12, md: 6 }} key={field.key}>
                    <Box sx={{ 
                      p: 2.5, 
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'var(--primary)',
                        background: 'rgba(139, 146, 152, 0.05)',
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: 'var(--primary)', display: 'flex' }}>{field.icon}</Box>
                          <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 500 }}>{field.label}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem' }}>
                          {field.unit}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Slider
                          value={inputs[field.key]}
                          onChange={(_, value) => handleInputChange(field.key, value as number)}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          valueLabelDisplay="auto"
                          sx={{ 
                            flex: 1,
                            color: 'var(--primary)',
                            '& .MuiSlider-thumb': {
                              width: 16,
                              height: 16,
                              '&:hover': {
                                boxShadow: '0 0 12px rgba(139, 146, 152, 0.5)',
                              }
                            },
                            '& .MuiSlider-valueLabel': {
                              background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
                            }
                          }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          value={inputs[field.key]}
                          onChange={e => handleInputChange(field.key, parseFloat(e.target.value) || 0)}
                          inputProps={{ min: field.min, max: field.max, step: field.step }}
                          sx={{ 
                            width: 90,
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(0, 0, 0, 0.2)',
                              '& fieldset': { borderColor: 'var(--border-subtle)' },
                              '&:hover fieldset': { borderColor: 'var(--primary)' },
                              '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
                            },
                            '& .MuiInputBase-input': {
                              color: '#FFFFFF',
                              textAlign: 'center',
                              fontWeight: 600,
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handlePredict}
                  disabled={isPredicting}
                  sx={{ 
                    flex: 1, 
                    py: 1.8,
                    background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
                    boxShadow: '0 4px 20px rgba(139, 146, 152, 0.4)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    '&:hover': {
                      boxShadow: '0 6px 30px rgba(139, 146, 152, 0.6)',
                    }
                  }}
                >
                  {isPredicting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    '开始智能评估'
                  )}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => setInputs({
                    particleSize: 5, stressLevel: 100, loadingRate: 1,
                    moistureContent: 12, compactionDegree: 95, slagContent: 30, cyclicTimes: 1000,
                  })}
                  sx={{ 
                    borderColor: 'var(--border-light)',
                    color: '#FFFFFF',
                    '&:hover': {
                      borderColor: 'var(--primary)',
                      background: 'rgba(139, 146, 152, 0.1)',
                    }
                  }}
                >
                  重置
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
            color: '#FFFFFF',
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            }
          }}>
            <CardContent sx={{ p: 3, position: 'relative' }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                预测结果
              </Typography>
              {currentResult ? (
                <>
                  <Typography variant="h1" sx={{ fontWeight: 700, my: 2, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
                    {currentResult.output.resilientModulus}
                    <Typography variant="h4" component="span" sx={{ color: '#FFFFFF' }}> MPa</Typography>
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
                    回弹模量预测值
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>
                  请输入参数后点击评估
                </Typography>
              )}
            </CardContent>
          </Card>

          {currentResult && (() => {
            const status = getPredictionStatus(currentResult.output.resilientModulus);
            const isAbnormal = status.level !== 'normal';
            
            return (
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  {isAbnormal && (
                    <Alert 
                      severity={status.level === 'critical' ? 'error' : 'warning'}
                      icon={status.level === 'critical' ? <ErrorIcon /> : <Warning />}
                      sx={{ 
                        mb: 3,
                        bgcolor: status.level === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        border: `1px solid ${status.level === 'critical' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                        '& .MuiAlert-icon': { color: status.color },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        回弹模量{status.label}！规范允许范围：{THRESHOLD_MIN}-{THRESHOLD_MAX} MPa
                      </Typography>
                      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Build sx={{ fontSize: 18, color: status.color }} />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: status.color }}>
                            处置方案
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                          {status.action}
                        </Typography>
                      </Box>
                    </Alert>
                  )}
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    详细分析
                  </Typography>
                      <Grid container spacing={2}>
                  {[
                    { label: '置信度', value: `${(currentResult.output.confidence * 100).toFixed(1)}%`, color: 'var(--primary)' },
                    { label: '颗粒破碎率', value: `${(currentResult.output.particleBreakage * 100).toFixed(2)}%`, color: 'var(--secondary)' },
                    { label: '可靠度等级', value: currentResult.output.reliability, color: currentResult.output.reliability === '高' ? '#10B981' : '#F59E0B' },
                    { label: '模型版本', value: `v${currentResult.modelVersion}`, color: 'var(--text-secondary)' },
                  ].map(item => (
                    <Grid size={{ xs: 6 }} key={item.label}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                      }}>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: item.color }}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                </CardContent>
              </Card>
            );
          })()}

          <Alert 
            severity="info" 
            icon={<TrendingUp />}
            sx={{ 
              bgcolor: 'rgba(90, 97, 104, 0.1)',
              border: '1px solid rgba(90, 97, 104, 0.3)',
              color: 'var(--text-primary)',
              '& .MuiAlert-icon': { color: 'var(--secondary)' }
            }}
          >
            基于物理信息神经网络(PINN)模型，融合了颗粒破碎演化方程、回弹模量应力关系等物理约束。
            {processedData.length > 0 && ` 已融合 ${processedData.length} 条试验数据`}
          </Alert>
        </Grid>

        {history.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  历史预测记录
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>时间</TableCell>
                        <TableCell>粒径(mm)</TableCell>
                        <TableCell>围压(kPa)</TableCell>
                        <TableCell>含水率(%)</TableCell>
                        <TableCell>压实度(%)</TableCell>
                        <TableCell>回弹模量(MPa)</TableCell>
                        <TableCell>置信度</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.slice(-5).reverse().map((record) => (
                        <TableRow key={record.id}>
                          <TableCell sx={{ color: 'var(--text-secondary)' }}>{new Date(record.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{record.input.particleSize}</TableCell>
                          <TableCell>{record.input.stressLevel}</TableCell>
                          <TableCell>{record.input.moistureContent}</TableCell>
                          <TableCell>{record.input.compactionDegree}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'var(--primary)' }}>{record.output.resilientModulus}</TableCell>
                          <TableCell>{(record.output.confidence * 100).toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
