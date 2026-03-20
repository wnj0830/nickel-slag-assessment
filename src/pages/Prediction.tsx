import { useState, useEffect, useMemo, useRef } from 'react';
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
  Dialog,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Avatar,
} from '@mui/material';
import { TrendingUp, Science, CheckCircle, AutoGraph, Speed, WaterDrop, Compress, Warning, Error as ErrorIcon, Build, Lightbulb, Send, Person, SmartToy } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPredicting, setCurrentResult, addPrediction } from '../store/slices/predictionSlice';
import { addHistoryRecord } from '../store/slices/authSlice';
import { pinnPredictor } from '../services/pinnService';

const THRESHOLD = 50;

const fixedParamGroupsData: Record<string, { label: string; values: Record<string, number> }> = {
  A: { label: '良好级配，高标准设计', values: { particleDensity: 3.20, maxDryDensity: 2.15, optMoistureContent: 9.5, nonUniformityCoeff: 12.5, curvatureCoeff: 1.2, poissonRatio: 0.25, layerThickness: 1.8, initialCompactionStd: 96.0, originalGradation: 12.5 } },
  B: { label: '一般级配，常规设计', values: { particleDensity: 3.10, maxDryDensity: 2.05, optMoistureContent: 10.5, nonUniformityCoeff: 8.0, curvatureCoeff: 0.9, poissonRatio: 0.28, layerThickness: 1.5, initialCompactionStd: 94.0, originalGradation: 8.0 } },
  C: { label: '偏细级配，低限设计', values: { particleDensity: 3.00, maxDryDensity: 1.95, optMoistureContent: 11.5, nonUniformityCoeff: 5.0, curvatureCoeff: 0.7, poissonRatio: 0.30, layerThickness: 1.2, initialCompactionStd: 92.0, originalGradation: 5.0 } },
  D: { label: '用于软弱地基处理', values: { particleDensity: 3.15, maxDryDensity: 2.10, optMoistureContent: 10.0, nonUniformityCoeff: 15.0, curvatureCoeff: 2.5, poissonRatio: 0.26, layerThickness: 2.0, initialCompactionStd: 95.0, originalGradation: 15.0 } },
};

const variableInputFields = [
  { key: 'actualDryDensity', label: '现场干密度', min: 1.5, max: 2.5, step: 0.01, default: 1.9, unit: 'g/cm³', icon: <Compress /> },
  { key: 'actualCompactionDegree', label: '实际压实度', min: 85, max: 100, step: 0.5, default: 93, unit: '%', icon: <Compress /> },
  { key: 'fieldMoistureContent', label: '现场含水率', min: 5, max: 20, step: 0.5, default: 12, unit: '%', icon: <WaterDrop /> },
  { key: 'saturation', label: '饱和度', min: 40, max: 100, step: 1, default: 75, unit: '%', icon: <WaterDrop /> },
  { key: 'confiningPressure', label: '围压', min: 20, max: 120, step: 5, default: 50, unit: 'kPa', icon: <Speed /> },
  { key: 'deviatorStress', label: '偏应力', min: 100, max: 350, step: 10, default: 200, unit: 'kPa', icon: <Speed /> },
  { key: 'octahedralNormalStress', label: '八面体正应力', min: 50, max: 200, step: 5, default: 100, unit: 'kPa', icon: <Speed /> },
  { key: 'octahedralShearStress', label: '八面体剪应力', min: 40, max: 150, step: 5, default: 80, unit: 'kPa', icon: <Speed /> },
  { key: 'subgradeTemperature', label: '路基温度', min: 0, max: 50, step: 1, default: 25, unit: '°C', icon: <Science /> },
  { key: 'dryWetCycleCount', label: '干湿循环次数', min: 0, max: 50, step: 1, default: 10, unit: '次', icon: <AutoGraph /> },
  { key: 'trafficLoadCount', label: '行车荷载作用次数', min: 10, max: 600, step: 10, default: 100, unit: '万次', icon: <AutoGraph /> },
];

const defaultVariableInputs: Record<string, number> = variableInputFields.reduce((acc, field) => {
  acc[field.key] = field.default;
  return acc;
}, {} as Record<string, number>);

const diagnosisData = [
  { modulus: 38.2, cause: '1. 压实不足 (K=91.3%, 低于设计92%); 2. 过湿 (w=13.5%, 高于最优11.5%); 3. 高荷载历史 (N=150万次)。', solution: '1. 补充压实至K≥94%; 2. 改善排水，降低含水率; 3. 评估疲劳损伤，必要时进行表层换填或注浆补强。' },
  { modulus: 42.7, cause: '1. 压实度略低 (K=93.7%); 2. 含水率偏高 (w=12.8%); 3. 较高偏应力 (σd=200kPa) 和荷载次数 (N=200万次) 导致性能衰减。', solution: '1. 补充碾压提高压实度; 2. 控制含水率在最优范围; 3. 加强监测，适时进行预防性养护。' },
  { modulus: 45.5, cause: '1. 含水率偏高 (w=11.0%, 接近最优9.5%上限); 2. 高荷载历史 (N=300万次) 导致材料疲劳破碎。', solution: '1. 优化排水设计，防止雨水入渗; 2. 评估颗粒破碎程度，考虑注浆或局部换填加固。' },
  { modulus: 35.8, cause: '1. 压实度不足 (K=92.9%); 2. 含水率偏高 (w=12.0%); 3. 高饱和度 (Sr=88%) 和中等荷载次数 (N=100万次) 共同作用导致模量偏低。', solution: '1. 补充压实至设计标准; 2. 设置排水盲沟降低饱和度; 3. 加强巡查，及时处理局部软弱区域。' },
  { modulus: 28.4, cause: '1. 严重过湿 (w=14.2%, S_r=95%); 2. 高温 (T=40℃) 加剧软化; 3. 超高荷载 (N=500万次)，材料严重疲劳。', solution: '1. 紧急疏通排水，翻晒或掺生石灰降低含水率; 2. 考虑开挖换填，或采用水泥就地冷再生进行彻底处治。' },
  { modulus: 41.3, cause: '1. 压实度略低 (K=91.7%); 2. 含水率偏高 (w=13.5%); 3. 高饱和度 (Sr=92%) 和较高荷载 (N=400万次) 导致性能持续劣化。', solution: '1. 补充压实; 2. 加强排水，降低路基湿度; 3. 实施预防性注浆，提高整体稳定性。' },
  { modulus: 47.1, cause: '1. 含水率略低但接近最优 (w=9.8%); 2. 主要问题是超高荷载历史 (N=600万次)，导致颗粒破碎和结构松散。', solution: '1. 评估结构性损伤程度; 2. 进行全厚度铣刨，重新铺筑面层并加强基层设计。' },
  { modulus: 44.6, cause: '1. 压实度略低 (K=94.3%); 2. 含水率适中但偏高 (w=11.5%); 3. 中等荷载 (N=350万次) 和中等饱和度 (Sr=82%) 共同影响。', solution: '1. 补充压实; 2. 优化排水系统; 3. 定期监测回弹模量变化趋势。' },
  { modulus: 25.0, cause: '1. 压实度极低 (K=89.7%); 2. 含水率极高 (w=15.0%, 饱和); 3. 级配不良 (C组)在恶劣条件下性能急剧恶化。', solution: '1. 必须进行翻挖，重新按最优含水率拌和并高压实; 2. 或直接换填为性能更优的A/B组填料。' },
  { modulus: 48.9, cause: '1. 含水率适中 (w=12.0%); 2. 主要原因为较高荷载 (N=250万次) 和中等偏高的偏应力 (σd=240kPa) 导致模量接近临界值。', solution: '1. 加强交通管制，限制超载车辆通行; 2. 实施薄层罩面，提高路面整体强度。' },
];

const aiDiagnosisResult = (modulus: number) => {
  if (modulus >= THRESHOLD) return null;
  
  const similarRecord = diagnosisData.find(d => Math.abs(d.modulus - modulus) < 5);
  
  if (similarRecord) {
    return [{
      problem: '回弹模量不足',
      cause: similarRecord.cause,
      solution: similarRecord.solution,
    }];
  }
  
  const diagnoses = [];
  
  if (modulus < 30) {
    diagnoses.push({
      problem: '回弹模量严重不足',
      cause: '路基压实度严重不足，含水率过高，材料疲劳严重',
      solution: '建议进行大修处理，刨除原路面结构层，重新铺设基层和面层',
    });
  } else if (modulus < 40) {
    diagnoses.push({
      problem: '回弹模量明显不足',
      cause: '现场压实度未达标，路基含水率偏高，荷载作用次数较多',
      solution: '建议进行结构性补强，如注浆加固或重新压实处理',
    });
  } else {
    diagnoses.push({
      problem: '回弹模量略低',
      cause: '压实度略低于标准，或含水率偏高，接近临界状态',
      solution: '建议进行表层维修，加强碾压或调整施工工艺',
    });
  }
  
  return diagnoses;
};

export default function Prediction() {
  const dispatch = useAppDispatch();
  const { isPredicting, currentResult, history } = useAppSelector(state => state.predictions);
  const constraints = useAppSelector(state => state.models.constraints);
  const processedData = useAppSelector(state => state.experiments.processedData);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const [selectedGroup, setSelectedGroup] = useState<string>('A');
  const [variableInputs, setVariableInputs] = useState<Record<string, number>>(defaultVariableInputs);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string; content: string}[]>([
    { role: 'assistant', content: '您好！我是破碎镍铁渣路基健康监测AI助手。我会实时监控路基回弹模量，当数值低于50MPa时会自动发出警报，并分析原因提供解决方案。您也可以在这里输入关于路基监测的问题。' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fixedParams = useMemo(() => fixedParamGroupsData[selectedGroup]?.values || {}, [selectedGroup]);
  const fixedParamsLabel = useMemo(() => fixedParamGroupsData[selectedGroup]?.label || '', [selectedGroup]);

  useEffect(() => {
    pinnPredictor.setTrainingData(processedData);
  }, [processedData]);

  useEffect(() => {
    const stored = localStorage.getItem('predictionDontShowAgain');
    if (stored === 'true' && !showSuccessDialog) {
      setDontShowAgain(true);
    }
  }, [showSuccessDialog]);

  const handleVariableInputChange = (key: string, value: number) => {
    setVariableInputs(prev => ({ ...prev, [key]: value }));
  };

  const allInputs = {
    ...fixedParams,
    ...variableInputs,
  };

  const handlePredict = async () => {
    dispatch(setPredicting(true));
    try {
      const result = await pinnPredictor.predict(allInputs as any, constraints);
      dispatch(setCurrentResult(result));
      dispatch(addPrediction(result));
      
      if (isAuthenticated) {
        dispatch(addHistoryRecord({
          id: Date.now().toString(),
          timestamp: Date.now(),
          input: allInputs,
          output: result.output,
        }));
      }
      
      if (!dontShowAgain) {
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      dispatch(setPredicting(false));
    }
  };

  const handleCloseSuccessDialog = () => {
    if (dontShowAgain) {
      localStorage.setItem('predictionDontShowAgain', 'true');
    }
    setShowSuccessDialog(false);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    
    const responses = [
      '根据当前监测数据，路基状态良好。回弹模量在正常范围内。',
      '建议继续关注含水率和温度变化，这些因素对回弹模量影响较大。',
      '如需了解具体传感器数据，请查看监控大屏页面。',
      '压实度是影响回弹模量的关键因素，建议保持压实度在95%以上。',
      '高温会导致路基软化，建议在高温季节加强监测频率。',
      '干湿循环会加速材料老化，建议定期检查排水系统。',
    ];
    
    setTimeout(() => {
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
    }, 500);
  };

  const getModelStatus = () => {
    if (processedData.length > 0) {
      return { label: '数据增强模式', color: 'success' as const, icon: <CheckCircle /> };
    }
    return { label: '基础模式', color: 'default' as const, icon: <Science /> };
  };

  const modelStatus = getModelStatus();
  const diagnosis = currentResult ? aiDiagnosisResult(currentResult.output.resilientModulus) : null;
  const isProblem = currentResult && currentResult.output.resilientModulus < THRESHOLD;

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
            智能评估与AI诊断
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
            基于物理信息神经网络的回弹模量精准预测与智能诊断
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
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 20,
              right: 20,
              height: 1,
              background: 'linear-gradient(90deg, transparent 0%, rgba(74, 144, 164, 0.3) 50%, transparent 100%)',
            },
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4A90A4 0%, #2D5A6B 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AutoGraph sx={{ color: '#FFFFFF', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                  输入参数 (共20项)
                </Typography>
              </Box>
              <Divider sx={{ mb: 3, borderColor: 'var(--border-subtle)' }} />

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="group-select-label" sx={{ color: '#FFFFFF' }}>选择固定参数组</InputLabel>
                  <Select
                    labelId="group-select-label"
                    value={selectedGroup}
                    label="选择固定参数组"
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    sx={{ 
                      color: '#FFFFFF',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border-subtle)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' },
                      '.MuiSvgIcon-root': { color: '#FFFFFF' },
                    }}
                  >
                    <MenuItem value="A">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="A" size="small" sx={{ bgcolor: '#8B9298', color: '#FFF' }} />
                        <Typography variant="body2">良好级配，高标准设计</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="B">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="B" size="small" sx={{ bgcolor: '#0EA5E9', color: '#FFF' }} />
                        <Typography variant="body2">一般级配，常规设计</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="C">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="C" size="small" sx={{ bgcolor: '#F59E0B', color: '#FFF' }} />
                        <Typography variant="body2">偏细级配，低限设计</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="D">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="D" size="small" sx={{ bgcolor: '#10B981', color: '#FFF' }} />
                        <Typography variant="body2">用于软弱地基处理</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ mb: 2 }}>
                  <Chip label="固定参数 (9项)" size="small" sx={{ mr: 1, bgcolor: 'rgba(139, 146, 152, 0.3)', color: '#8B9298', fontWeight: 600 }} />
                  <Chip label="可变参数 (11项)" size="small" sx={{ bgcolor: 'rgba(14, 165, 233, 0.3)', color: '#0EA5E9', fontWeight: 600 }} />
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ 
                    p: 2.5, 
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(139, 146, 152, 0.3)',
                  }}>
                    <Typography variant="body2" sx={{ color: '#8B9298', fontWeight: 600, mb: 2 }}>
                      固定参数 (组 {selectedGroup} - {fixedParamsLabel})
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>颗粒比重 (g/cm³)</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{fixedParams.particleDensity}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>最大干密度 (g/cm³)</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{fixedParams.maxDryDensity}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>最优含水率 (%)</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{fixedParams.optMoistureContent}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>不均匀系数</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{fixedParams.nonUniformityCoeff}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>曲率系数</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{fixedParams.curvatureCoeff}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>泊松比</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{fixedParams.poissonRatio}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>结构层厚度 (m)</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{fixedParams.layerThickness}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>设计压实度 (%)</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{fixedParams.initialCompactionStd}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>原始颗粒级配</Typography>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>{fixedParams.originalGradation || '-'}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>

                {variableInputFields.map(field => (
                  <Grid size={{ xs: 12, md: 6 }} key={field.key}>
                    <Box sx={{ 
                      p: 2.5, 
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#0EA5E9',
                        background: 'rgba(14, 165, 233, 0.05)',
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: '#0EA5E9', display: 'flex' }}>{field.icon}</Box>
                          <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.85rem' }}>{field.label}</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#0EA5E9', fontWeight: 600, fontSize: '0.7rem' }}>
                          {field.unit}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Slider
                          value={variableInputs[field.key]}
                          onChange={(_, value) => handleVariableInputChange(field.key, value as number)}
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          valueLabelDisplay="auto"
                          sx={{ 
                            flex: 1,
                            color: '#0EA5E9',
                            '& .MuiSlider-thumb': {
                              width: 16,
                              height: 16,
                              '&:hover': {
                                boxShadow: '0 0 12px rgba(14, 165, 233, 0.5)',
                              }
                            },
                            '& .MuiSlider-valueLabel': {
                              background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                            }
                          }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          value={variableInputs[field.key]}
                          onChange={e => handleVariableInputChange(field.key, parseFloat(e.target.value) || 0)}
                          inputProps={{ min: field.min, max: field.max, step: field.step }}
                          sx={{ 
                            width: 85,
                            '& .MuiOutlinedInput-root': {
                              background: 'rgba(0, 0, 0, 0.2)',
                              '& fieldset': { borderColor: 'var(--border-subtle)' },
                              '&:hover fieldset': { borderColor: '#0EA5E9' },
                              '&.Mui-focused fieldset': { borderColor: '#0EA5E9' },
                            },
                            '& .MuiInputBase-input': {
                              color: '#FFFFFF',
                              textAlign: 'center',
                              fontWeight: 600,
                              fontSize: '0.8rem',
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
                  onClick={() => setVariableInputs(defaultVariableInputs)}
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
            background: 'linear-gradient(135deg, #4A90A4 0%, #2D5A6B 100%)',
            color: '#FFFFFF',
            mb: 3,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(74, 144, 164, 0.3)',
            border: '1px solid rgba(74, 144, 164, 0.3)',
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
                  <Chip 
                    label={isProblem ? '⚠️ 不合格' : '✓ 合格'}
                    sx={{ 
                      bgcolor: isProblem ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
                    判定标准: 回弹模量 {isProblem ? '< ' : '≥ '}{THRESHOLD} MPa
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" sx={{ mt: 2, opacity: 0.8 }}>
                  请选择固定参数组并输入可变参数后点击评估
                </Typography>
              )}
            </CardContent>
          </Card>

          {currentResult && isProblem && diagnosis && (
            <Card sx={{ mb: 3, border: '2px solid #ef4444' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Lightbulb sx={{ color: '#ef4444', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#ef4444' }}>
                    AI智能诊断结果
                  </Typography>
                </Box>
                
                {diagnosis.map((item, idx) => (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <Alert 
                      severity="error"
                      icon={<ErrorIcon />}
                      sx={{ 
                        mb: 2,
                        bgcolor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#ef4444' }}>
                        {item.problem}
                      </Typography>
                    </Alert>
                    
                    <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Warning sx={{ fontSize: 16, color: '#F59E0B' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#F59E0B' }}>
                          问题原因
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        {item.cause}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Build sx={{ fontSize: 16, color: '#10B981' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>
                          解决方法
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        {item.solution}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {currentResult && !isProblem && (
            <Alert 
              severity="success"
              icon={<CheckCircle />}
              sx={{ 
                mb: 3,
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                '& .MuiAlert-icon': { color: '#10B981' },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>
                路基状况良好，回弹模量符合要求
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                建议按常规养护计划执行即可
              </Typography>
            </Alert>
          )}

          {currentResult && (
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
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 0.5, fontSize: '0.75rem' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: item.color, fontSize: '1rem' }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          <Card sx={{ mt: 3, maxHeight: 400, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <SmartToy sx={{ color: 'var(--primary)' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>AI智能对话</Typography>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => {
                    const simulatedModulus = 35 + Math.random() * 10;
                    const diagnosisNumber = Math.floor(Math.random() * 10) + 1;
                    setChatMessages(prev => [...prev, { 
                      role: 'assistant', 
                      content: `🔍 模拟诊断触发\n\n检测到回弹模量异常\n当前模拟回弹模量: ${simulatedModulus.toFixed(1)} MPa\n报警阈值: 50 MPa` 
                    }]);
                    setTimeout(() => {
                      const causes = [
                        '压实度不足，含水率偏高，导致路基强度下降',
                        '高温+高荷载导致材料疲劳损伤',
                        '饱和度偏高，排水不畅引起软化',
                        '干湿循环导致颗粒破碎和结构松散'
                      ];
                      const solutions = [
                        '补充压实，提高压实度至设计标准',
                        '优化排水设计，加强排水设施',
                        '实施注浆加固，提高整体稳定性',
                        '考虑换填或冷再生处理'
                      ];
                      setChatMessages(prev => [...prev, { 
                        role: 'assistant', 
                        content: `📋 诊断结果:\n\n主要原因: ${causes[diagnosisNumber % 4]}\n\n解决措施: ${solutions[diagnosisNumber % 4]}\n\n建议: 加强监测频率，必要时进行现场检测` 
                      }]);
                    }, 1000);
                  }}
                  sx={{ ml: 'auto', borderColor: '#ef4444', color: '#ef4444', fontSize: '0.75rem' }}
                >
                  模拟诊断
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: 250, overflow: 'auto', mb: 2 }}>
                {chatMessages.map((msg, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: msg.role === 'assistant' ? 'var(--primary)' : '#5A6168' }}>
                      {msg.role === 'assistant' ? <SmartToy sx={{ fontSize: 16 }} /> : <Person sx={{ fontSize: 16 }} />}
                    </Avatar>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      bgcolor: msg.role === 'assistant' ? 'rgba(0,217,165,0.1)' : 'rgba(255,255,255,0.05)',
                      maxWidth: '85%'
                    }}>
                      <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <div ref={chatEndRef} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="请输入您的问题..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.03)',
                    }
                  }}
                />
                <IconButton onClick={handleSendChat} sx={{ bgcolor: 'var(--primary)', color: '#fff', '&:hover': { bgcolor: 'var(--primary-dark)' } }}>
                  <Send />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
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
                        <TableCell>固定参数组</TableCell>
                        <TableCell>回弹模量(MPa)</TableCell>
                        <TableCell>状态</TableCell>
                        <TableCell>置信度</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.slice(-5).reverse().map((record) => (
                        <TableRow key={record.id}>
                          <TableCell sx={{ color: 'var(--text-secondary)' }}>{new Date(record.timestamp).toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip 
                              label="已记录"
                              size="small"
                              sx={{ bgcolor: 'rgba(139, 146, 152, 0.2)', color: '#8B9298' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: record.output.resilientModulus < THRESHOLD ? '#ef4444' : 'var(--primary)' }}>
                            {record.output.resilientModulus}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={record.output.resilientModulus < THRESHOLD ? '不合格' : '合格'}
                              size="small"
                              sx={{ 
                                bgcolor: record.output.resilientModulus < THRESHOLD ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: record.output.resilientModulus < THRESHOLD ? '#ef4444' : '#10B981',
                                fontSize: '0.7rem',
                              }}
                            />
                          </TableCell>
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

      <Dialog 
        open={showSuccessDialog} 
        onClose={handleCloseSuccessDialog}
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            p: 2,
            minWidth: 400,
          }
        }}
      >
        <Box sx={{ textAlign: 'center', py: 3, px: 2 }}>
          <CheckCircle sx={{ fontSize: 60, color: '#FFFFFF', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            评估完成
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
            恭喜您为节能减排做出了巨大贡献，<br />为推进新能源的发展迈出了重要一步！
          </Typography>
          <FormControlLabel
            control={
              <Checkbox 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                sx={{ color: '#FFFFFF', '&.Mui-checked': { color: '#FFFFFF' } }}
              />
            }
            label="本次使用不再出现"
            sx={{ color: '#FFFFFF', mb: 2 }}
          />
          <Button 
            variant="contained" 
            onClick={handleCloseSuccessDialog}
            sx={{ 
              bgcolor: '#FFFFFF', 
              color: '#10B981',
              fontWeight: 700,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
            }}
          >
            确定
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}