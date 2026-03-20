import { Box, Card, CardContent, Typography, Grid, TextField, Button, Alert, Chip } from '@mui/material';
import { Save, Refresh, Science, Landscape, Speed, WaterDrop } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateParams, resetParams } from '../store/slices/physicsParamsSlice';

export default function MaterialParams() {
  const dispatch = useAppDispatch();
  const params = useAppSelector(state => state.physicsParams.params);

  const handleChange = (field: string, value: string | number) => {
    dispatch(updateParams({ [field]: value }));
  };

  const paramFields = [
    { key: 'particleDensity', label: '镍铁渣颗粒比重', unit: 'g/cm³', icon: <Science />, min: 2.0, max: 4.0, step: 0.01 },
    { key: 'maxDryDensity', label: '最大干密度', unit: 'g/cm³', icon: <Landscape />, min: 1.0, max: 2.5, step: 0.01 },
    { key: 'optimalMoisture', label: '最优含水率', unit: '%', icon: <WaterDrop />, min: 5, max: 25, step: 0.1 },
    { key: 'uniformityCoefficient', label: '不均匀系数', unit: '', icon: <Speed />, min: 1, max: 50, step: 0.1 },
    { key: 'curvatureCoefficient', label: '曲率系数', unit: '', icon: <Speed />, min: 0.1, max: 5, step: 0.1 },
    { key: 'poissonRatio', label: '材料泊松比', unit: '', icon: <Science />, min: 0, max: 0.5, step: 0.01 },
    { key: 'structureLayerThickness', label: '结构层厚度', unit: 'm', icon: <Landscape />, min: 0.1, max: 2.0, step: 0.05 },
    { key: 'initialCompactionStandard', label: '路基初始压实标准', unit: '%', icon: <Speed />, min: 90, max: 100, step: 0.5 },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, position: 'relative' }}>
        <Box sx={{ 
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(20px)',
        }} />
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          background: 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1.2,
          fontSize: '1.75rem',
          letterSpacing: '-0.02em',
          position: 'relative',
        }}>
          材料物理参数
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Science sx={{ fontSize: 18, color: 'var(--primary)', opacity: 0.7 }} />
          镍铁渣道路应用静态参数配置
        </Typography>
      </Box>

      <Alert severity="info" sx={{ 
        mb: 3,
        bgcolor: 'rgba(212, 175, 55, 0.1)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        color: 'var(--text-primary)',
        '& .MuiAlert-icon': { color: 'var(--gold)' }
      }}>
        以下参数为镍铁渣材料的长期基本不变物理特性，用于路基回弹模量评估的基准参考。
      </Alert>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 20, right: 20, height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.3) 50%, transparent 100%)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Science sx={{ color: 'var(--gold)' }} />
                颗粒特性参数
              </Typography>
              <Grid container spacing={2.5}>
                {paramFields.slice(0, 5).map((field) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={field.key}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: 'var(--gold)',
                        background: 'rgba(212, 175, 55, 0.05)',
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '8px',
                          background: 'rgba(212, 175, 55, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {field.icon}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {field.label}
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={params[field.key as keyof typeof params]}
                        onChange={(e) => handleChange(field.key, parseFloat(e.target.value) || 0)}
                        size="small"
                        inputProps={{ step: field.step, min: field.min, max: field.max }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)', mt: 0.5, display: 'block' }}>
                        单位: {field.unit || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 20, right: 20, height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.3) 50%, transparent 100%)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Landscape sx={{ color: 'var(--gold)' }} />
                结构与压实参数
              </Typography>
              <Grid container spacing={2.5}>
                {paramFields.slice(5).map((field) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={field.key}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        borderColor: 'var(--gold)',
                        background: 'rgba(212, 175, 55, 0.05)',
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '8px',
                          background: 'rgba(212, 175, 55, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {field.icon}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {field.label}
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        type="number"
                        value={params[field.key as keyof typeof params]}
                        onChange={(e) => handleChange(field.key, parseFloat(e.target.value) || 0)}
                        size="small"
                        inputProps={{ step: field.step, min: field.min, max: field.max }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)', mt: 0.5, display: 'block' }}>
                        单位: {field.unit || '-'}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
                
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Box sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '8px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Landscape sx={{ fontSize: 18, color: 'var(--gold)' }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                        原始颗粒级配
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      select
                      value={params.originalGradation}
                      onChange={(e) => handleChange('originalGradation', e.target.value)}
                      size="small"
                      SelectProps={{ native: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(0, 0, 0, 0.2)',
                        },
                      }}
                    >
                      <option value="良好级配">良好级配</option>
                      <option value="不良级配">不良级配</option>
                      <option value="均匀级配">均匀级配</option>
                      <option value="间断级配">间断级配</option>
                    </TextField>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ 
            background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.08) 0%, rgba(10, 14, 23, 0.8) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label="最近更新" 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(212, 175, 55, 0.15)',
                      color: 'var(--gold)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                    }} 
                  />
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    {new Date(params.updatedAt).toLocaleString('zh-CN')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => dispatch(resetParams())}
                    sx={{
                      borderColor: 'var(--border-light)',
                      color: 'var(--text-secondary)',
                      '&:hover': {
                        borderColor: 'var(--gold)',
                        color: 'var(--gold)',
                      }
                    }}
                  >
                    重置
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    sx={{
                      background: 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)',
                      boxShadow: '0 4px 20px rgba(139, 146, 152, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #9BA3A8 0%, #8B9298 100%)',
                      }
                    }}
                  >
                    保存参数
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
