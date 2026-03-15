import { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import { History, Delete, TrendingUp } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearHistory, loadUserHistory } from '../store/slices/authSlice';

export default function HistoryPage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, history } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(loadUserHistory());
  }, [dispatch]);

  const handleClearHistory = () => {
    if (confirm('确定要清空所有历史记录吗?')) {
      dispatch(clearHistory());
    }
  };

  if (!isAuthenticated) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          请先登录以查看历史评估记录
        </Alert>
      </Box>
    );
  }

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
            历史评估记录
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
            查看您的历史预测和评估结果
          </Typography>
        </Box>
        {history.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<Delete />}
            onClick={handleClearHistory}
            sx={{
              borderColor: 'var(--border-light)',
              color: 'var(--text-secondary)',
              '&:hover': {
                borderColor: '#ef4444',
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
              }
            }}
          >
            清空记录
          </Button>
        )}
      </Box>

      {history.length === 0 ? (
        <Card sx={{
          background: 'linear-gradient(145deg, rgba(21, 29, 43, 0.95) 0%, rgba(10, 14, 23, 0.9) 100%)',
          border: '1px solid var(--border-subtle)',
        }}>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <Box sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: 'rgba(139, 146, 152, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}>
              <History sx={{ fontSize: 40, color: 'var(--primary)' }} />
            </Box>
            <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
              暂无评估记录
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              完成智能评估后，您的历史记录将显示在这里
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{
          background: 'linear-gradient(145deg, rgba(21, 29, 43, 0.95) 0%, rgba(10, 14, 23, 0.9) 100%)',
          border: '1px solid var(--border-subtle)',
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <History sx={{ color: '#FFFFFF', fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                  评估历史
                </Typography>
                <Chip 
                  label={`${history.length} 条记录`} 
                  size="small" 
                  sx={{ 
                    ml: 'auto',
                    background: 'rgba(139, 146, 152, 0.15)',
                    color: 'var(--primary)',
                  }} 
                />
              </Box>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>时间</TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>粒径(mm)</TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>围压(kPa)</TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>含水率(%)</TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>压实度(%)</TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>镍铁渣掺量(%)</TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>回弹模量(MPa)</TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>置信度</TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>可靠度</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((record, index) => (
                    <TableRow 
                      key={record.id || index}
                      sx={{ 
                        '&:hover': { background: 'rgba(139, 146, 152, 0.04)' },
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <TableCell sx={{ color: 'var(--text-secondary)' }}>
                        {new Date(record.timestamp).toLocaleString('zh-CN')}
                      </TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{record.input.particleSize}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{record.input.stressLevel}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{record.input.moistureContent}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{record.input.compactionDegree}</TableCell>
                      <TableCell sx={{ color: '#FFFFFF' }}>{record.input.slagContent}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TrendingUp sx={{ fontSize: 16, color: 'var(--primary)' }} />
                          <Typography sx={{ fontWeight: 600, color: 'var(--primary)' }}>
                            {record.output.resilientModulus}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${(record.output.confidence * 100).toFixed(1)}%`}
                          size="small"
                          sx={{ 
                            background: 'rgba(90, 97, 104, 0.15)',
                            color: 'var(--secondary)',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.output.reliability}
                          size="small"
                          sx={{ 
                            background: record.output.reliability === '高' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: record.output.reliability === '高' ? '#10B981' : '#F59E0B',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Card sx={{
            flex: 1,
            background: 'linear-gradient(145deg, rgba(21, 29, 43, 0.95) 0%, rgba(10, 14, 23, 0.9) 100%)',
            border: '1px solid var(--border-subtle)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary)', mb: 0.5 }}>
                    {history.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    总评估次数
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--secondary)', mb: 0.5 }}>
                    {(history.reduce((sum, r) => sum + r.output.resilientModulus, 0) / history.length).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    平均回弹模量(MPa)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10B981', mb: 0.5 }}>
                    {(history.reduce((sum, r) => sum + r.output.confidence, 0) * 100 / history.length).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    平均置信度
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
