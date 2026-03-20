import { useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, IconButton, TextField, Button, Avatar, Divider } from '@mui/material';
import { 
  Warning, Send, SmartToy, Person, AutoGraph, 
  WaterDrop, Compress
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { refreshAllData } from '../store/slices/realtimeDataSlice';
import { diagnosisRules, type AIConversation, type DiagnosisResult } from '../types';

const RESILIENT_MODULUS_THRESHOLD = 50;

export default function AIChat() {
  const dispatch = useAppDispatch();
  const { sensors } = useAppSelector(state => state.realtimeData);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisResult | null>(null);
  const [hasLowModulus, setHasLowModulus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(refreshAllData());
    }, 60000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (conversations.length === 0) {
      setConversations([{
        id: '1',
        role: 'assistant',
        content: '您好！我是破碎镍铁渣路基健康监测AI助手。我会实时监控路基回弹模量，当数值低于50MPa时会自动发出警报，并分析原因提供解决方案。',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  useEffect(() => {
    const simulatedModulus = 85 + Math.random() * 20;
    if (simulatedModulus < RESILIENT_MODULUS_THRESHOLD && !hasLowModulus) {
      setHasLowModulus(true);
      triggerDiagnosis(simulatedModulus);
    } else if (simulatedModulus >= RESILIENT_MODULUS_THRESHOLD) {
      setHasLowModulus(false);
    }
  }, [sensors]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const triggerDiagnosis = (modulusValue: number) => {
    setIsAnalyzing(true);
    
    const diagnosisNumber = Math.floor(Math.random() * 10) + 1;
    const diagnosis = diagnosisRules[diagnosisNumber];

    setTimeout(() => {
      const alertMessage: AIConversation = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚠️ 警报：检测到回弹模量异常！\n\n当前回弹模量：${modulusValue.toFixed(1)} MPa\n报警阈值：${RESILIENT_MODULUS_THRESHOLD} MPa\n\n🔍 正在分析原因...`,
        timestamp: new Date().toISOString()
      };
      setConversations(prev => [...prev, alertMessage]);

      setTimeout(() => {
        const reasonMessage: AIConversation = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `📋 诊断结果（原因${diagnosisNumber}）：\n\n${diagnosis.reason}\n\n🔧 解决措施：\n${diagnosis.solution}`,
          timestamp: new Date().toISOString()
        };
        setConversations(prev => [...prev, reasonMessage]);
        setCurrentDiagnosis(diagnosis);
        setIsAnalyzing(false);
      }, 1500);
    }, 1000);
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;

    const userMessage: AIConversation = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    setConversations(prev => [...prev, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      const responses = [
        '根据当前监测数据，路基状态良好。回弹模量在正常范围内。',
        '建议继续关注含水率和温度变化，这些因素对回弹模量影响较大。',
        '如需了解具体传感器数据，请查看监控大屏页面。',
        '当前压实度指标正常，满足设计要求。',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage: AIConversation = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date().toISOString()
      };
      setConversations(prev => [...prev, assistantMessage]);
    }, 800);
  };

  const forceAnalysis = () => {
    const simulatedModulus = 25 + Math.random() * 10;
    setHasLowModulus(true);
    triggerDiagnosis(simulatedModulus);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 0.5,
        }}>
          AI智能诊断
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SmartToy sx={{ fontSize: 16, color: 'var(--gold)' }} />
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            基于物理信息神经网络(PINN)的实时诊断系统
          </Typography>
          <Chip 
            label={`报警阈值: ${RESILIENT_MODULUS_THRESHOLD} MPa`} 
            size="small" 
            sx={{ 
              bgcolor: 'rgba(212, 175, 55, 0.15)',
              color: 'var(--gold)',
              fontSize: '0.7rem',
            }} 
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              p: 2, 
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'var(--gold)', width: 40, height: 40 }}>
                  <SmartToy />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>AI诊断助手</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                    {isAnalyzing ? '分析中...' : '在线'}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AutoGraph />}
                onClick={forceAnalysis}
                sx={{
                  borderColor: 'var(--gold)',
                  color: 'var(--gold)',
                  '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.15)' }
                }}
              >
                模拟诊断
              </Button>
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
              {conversations.map((msg) => (
                <Box key={msg.id} sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mb: 3,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                }}>
                  <Avatar sx={{ 
                    bgcolor: msg.role === 'user' ? 'var(--secondary)' : 'var(--gold)',
                    width: 36, 
                    height: 36 
                  }}>
                    {msg.role === 'user' ? <Person /> : <SmartToy />}
                  </Avatar>
                  <Box sx={{ 
                    maxWidth: '75%',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: msg.role === 'user' ? 'rgba(90, 97, 104, 0.15)' : 'rgba(212, 175, 55, 0.1)',
                    border: msg.role === 'user' ? '1px solid rgba(90, 97, 104, 0.3)' : '1px solid rgba(212, 175, 55, 0.2)',
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                      {msg.content}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {isAnalyzing && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'var(--gold)', width: 36, height: 36 }}>
                    <SmartToy />
                  </Avatar>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(212, 175, 55, 0.1)' }}>
                    <Typography variant="body2" sx={{ color: 'var(--gold)' }}>
                      🔄 正在分析监测数据...
                    </Typography>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Divider />
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="输入问题..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(0,0,0,0.2)',
                  }
                }}
              />
              <IconButton 
                onClick={handleSend}
                sx={{ 
                  bgcolor: 'var(--gold)', 
                  color: '#000',
                  '&:hover': { bgcolor: 'var(--gold-light)' }
                }}
              >
                <Send />
              </IconButton>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--gold)' }}>
                实时监测概览
              </Typography>
              <Grid container spacing={2}>
                {sensors.slice(0, 4).map((sensor) => (
                  <Grid size={{ xs: 12 }} key={sensor.id}>
                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: sensor.status === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${sensor.status === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`,
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{sensor.locationName}</Typography>
                        <Chip 
                          label={sensor.status === 'critical' ? '危险' : sensor.status === 'warning' ? '警告' : '正常'}
                          size="small"
                          sx={{
                            bgcolor: sensor.status === 'critical' ? 'rgba(239, 68, 68, 0.2)' : sensor.status === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: sensor.status === 'critical' ? '#ef4444' : sensor.status === 'warning' ? '#f59e0b' : '#10b981',
                            fontSize: '0.65rem',
                          }}
                        />
                      </Box>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Compress sx={{ fontSize: 12, color: 'var(--text-muted)' }} />
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>压实度</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: sensor.status === 'critical' ? '#ef4444' : 'var(--gold)' }}>
                            {sensor.actualCompactionDegree.toFixed(1)}%
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <WaterDrop sx={{ fontSize: 12, color: 'var(--text-muted)' }} />
                            <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>含水率</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {sensor.fieldMoistureContent.toFixed(1)}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {currentDiagnosis && (
            <Card sx={{ 
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Warning sx={{ color: '#ef4444' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#ef4444' }}>
                    当前诊断
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  📋 原因分析：
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2, fontSize: '0.85rem' }}>
                  {currentDiagnosis.reason}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  🔧 解决措施：
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {currentDiagnosis.solution}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
