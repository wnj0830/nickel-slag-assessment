import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  Slider,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleConstraint, updateConstraintWeight } from '../store/slices/modelSlice';
import { AccountTree, Functions, Speed, Science } from '@mui/icons-material';

export default function PhysicsConstraints() {
  const dispatch = useAppDispatch();
  const { currentModel, constraints } = useAppSelector(state => state.models);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          background: 'linear-gradient(135deg, #F9FAFB 0%, #9CA3AF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1,
        }}>
          物理约束配置
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
          物理信息神经网络(PINN) - 物理规律与数据驱动有机融合
        </Typography>
      </Box>

      <Alert severity="info" sx={{ 
        mb: 3,
        bgcolor: 'rgba(90, 97, 104, 0.1)',
        border: '1px solid rgba(90, 97, 104, 0.3)',
        color: 'var(--text-primary)',
        '& .MuiAlert-icon': { color: 'var(--secondary)' }
      }}>
        物理信息神经网络(PINN)通过将物理规律作为约束嵌入损失函数，实现数据驱动与物理机理的有机融合。
        以下是本模型中嵌入的物理约束方程及其权重配置。
      </Alert>

      <Grid container spacing={3}>
        {constraints.map((constraint, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={constraint.name}>
            <Card sx={{ 
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: constraint.enabled 
                  ? 'linear-gradient(135deg, #8B9298 0%, #5A6168 100%)'
                  : 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '10px',
                      background: constraint.enabled 
                        ? 'linear-gradient(135deg, rgba(139, 146, 152, 0.2) 0%, rgba(90, 97, 104, 0.15) 100%)'
                        : 'rgba(107, 114, 128, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {index === 0 ? <Science sx={{ color: constraint.enabled ? 'var(--primary)' : 'var(--text-muted)' }} /> :
                       index === 1 ? <Speed sx={{ color: constraint.enabled ? 'var(--primary)' : 'var(--text-muted)' }} /> :
                       index === 2 ? <Functions sx={{ color: constraint.enabled ? 'var(--primary)' : 'var(--text-muted)' }} /> :
                       <AccountTree sx={{ color: constraint.enabled ? 'var(--primary)' : 'var(--text-muted)' }} />}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{constraint.name}</Typography>
                      <Chip 
                        label={`约束 ${index + 1}`} 
                        size="small" 
                        sx={{ 
                          mt: 0.5,
                          background: constraint.enabled 
                            ? 'linear-gradient(135deg, rgba(139, 146, 152, 0.2) 0%, rgba(90, 97, 104, 0.15) 100%)'
                            : 'rgba(107, 114, 128, 0.2)',
                          border: `1px solid ${constraint.enabled ? 'rgba(139, 146, 152, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
                          color: constraint.enabled ? 'var(--primary)' : 'var(--text-muted)',
                        }} 
                      />
                    </Box>
                  </Box>
                  <Switch
                    checked={constraint.enabled}
                    onChange={() => dispatch(toggleConstraint(constraint.name))}
                    color="primary"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'var(--primary)',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'var(--primary)',
                      },
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2, borderColor: 'var(--border-subtle)' }} />

                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>
                  物理方程:
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'rgba(139, 146, 152, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    p: 2,
                    borderRadius: '12px',
                    mb: 3,
                    color: constraint.enabled ? 'var(--primary)' : 'var(--text-muted)',
                  }}
                >
                  {constraint.equation}
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  约束权重: <Box component="span" sx={{ color: 'var(--primary)', fontWeight: 600 }}>{constraint.weight.toFixed(2)}</Box>
                </Typography>
                <Slider
                  value={constraint.weight}
                  onChange={(_, value) => dispatch(updateConstraintWeight({
                    name: constraint.name,
                    weight: value as number,
                  }))}
                  min={0}
                  max={1}
                  step={0.05}
                  disabled={!constraint.enabled}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 0.5, label: '0.5' },
                    { value: 1, label: '1' },
                  ]}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                当前模型信息
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>模型名称</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{currentModel?.name}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>版本</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'var(--primary)' }}>v{currentModel?.version}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>训练日期</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{currentModel?.trainingDate}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>模型状态</Typography>
                    <Chip
                      label={currentModel?.status === 'ready' ? '就绪' : '训练中'}
                      color={currentModel?.status === 'ready' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ 
            bgcolor: 'rgba(139, 146, 152, 0.05)',
            border: '1px solid rgba(139, 146, 152, 0.2)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                PINN损失函数构成
              </Typography>
              <Typography variant="body1" sx={{ 
                fontFamily: 'monospace', 
                mb: 2,
                color: 'var(--primary)',
                p: 2,
                borderRadius: '12px',
                bgcolor: 'rgba(0, 0, 0, 0.2)',
              }}>
                L_total = L_data + λ₁L_physics₁ + λ₂L_physics₂ + ... + λₙL_physicsₙ
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                其中 <Box component="span" sx={{ color: 'var(--primary)', fontWeight: 500 }}>L_data</Box> 为数据驱动损失(预测值与真实值的误差)，
                <Box component="span" sx={{ color: 'var(--secondary)', fontWeight: 500 }}>L_physics</Box> 为物理约束损失(物理方程残差)。
                通过调整各约束权重 λ，可平衡数据拟合与物理一致性。
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
