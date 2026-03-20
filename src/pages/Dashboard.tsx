import { Box, Grid, Card, CardContent, Typography, LinearProgress } from '@mui/material';
import { TrendingUp, Assessment, Science, AutoGraph, Psychology, Timeline, DataArray } from '@mui/icons-material';
import { useAppSelector } from '../store/hooks';
import ReactECharts from 'echarts-for-react';

export default function Dashboard() {
  const experiments = useAppSelector(state => state.experiments.items);
  const predictions = useAppSelector(state => state.predictions.history);
  const currentModel = useAppSelector(state => state.models.currentModel);

  const defaultData = [
    { output: { resilientModulus: 85.2 } },
    { output: { resilientModulus: 92.5 } },
    { output: { resilientModulus: 78.3 } },
    { output: { resilientModulus: 95.8 } },
    { output: { resilientModulus: 88.6 } },
    { output: { resilientModulus: 102.3 } },
    { output: { resilientModulus: 91.2 } },
    { output: { resilientModulus: 87.5 } },
    { output: { resilientModulus: 98.6 } },
    { output: { resilientModulus: 94.2 } },
  ];

  const displayData = predictions.length > 0 ? predictions.slice(0, 10).reverse() : defaultData;

  const chartOption = {
    title: { 
      text: '近30天预测趋势', 
      left: 'center',
      textStyle: { color: '#94A3B8', fontSize: 14, fontWeight: 500 }
    },
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(6, 10, 18, 0.95)',
      borderColor: 'rgba(139, 146, 152, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      extraCssText: 'backdrop-filter: blur(10px); border-radius: 8px;'
    },
    grid: { top: 55, right: 25, bottom: 35, left: 55 },
    xAxis: {
      type: 'category',
      data: displayData.map((_, i) => `第${i + 1}次`),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisLabel: { color: '#64748B', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: { 
      type: 'value', 
      name: '回弹模量 (MPa)',
      nameTextStyle: { color: '#64748B', fontSize: 11 },
      axisLine: { show: false },
      axisLabel: { color: '#64748B', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }
    },
    series: [{
      data: displayData.map(p => p.output.resilientModulus),
      type: 'line',
      smooth: 0.4,
      lineStyle: { color: '#8B9298', width: 3, shadowColor: 'rgba(139, 146, 152, 0.3)', shadowBlur: 10 },
      areaStyle: { 
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(139, 146, 152, 0.25)' },
            { offset: 0.5, color: 'rgba(139, 146, 152, 0.05)' },
            { offset: 1, color: 'rgba(139, 146, 152, 0)' }
          ]
        }
      },
      itemStyle: { color: '#8B9298', borderWidth: 2, borderColor: '#FFFFFF' },
      showSymbol: true,
      symbol: 'circle',
      symbolSize: 8,
    }],
  };

  const pieOption = {
    title: { 
      text: '数据来源分布', 
      left: 'center',
      textStyle: { color: '#94A3B8', fontSize: 14, fontWeight: 500 }
    },
    tooltip: { 
      trigger: 'item',
      backgroundColor: 'rgba(6, 10, 18, 0.95)',
      borderColor: 'rgba(139, 146, 152, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#F8FAFC', fontSize: 12 },
      extraCssText: 'backdrop-filter: blur(10px); border-radius: 8px;'
    },
    legend: { bottom: 15, textStyle: { color: '#64748B', fontSize: 11 }, itemGap: 20 },
    series: [{
      type: 'pie',
      radius: ['48%', '72%'],
      center: ['50%', '45%'],
      itemStyle: {
        borderRadius: 10,
        borderColor: '#FFFFFF',
        borderWidth: 3
      },
      label: { show: false },
      labelLine: { show: false },
      data: [
        { value: 35, name: '冲击荷载试验', itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#8B9298' }, { offset: 1, color: '#5A6168' }] } } },
        { value: 28, name: '动三轴试验', itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#0EA5E9' }, { offset: 1, color: '#0284C7' }] } } },
        { value: 20, name: '固结试验', itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#F59E0B' }, { offset: 1, color: '#D97706' }] } } },
        { value: 17, name: '其他试验', itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 1, colorStops: [{ offset: 0, color: '#8B5CF6' }, { offset: 1, color: '#7C3AED' }] } } },
      ],
    }],
  };

  const statCards = [
    { title: '试验数据总量', value: experiments.length || 128, unit: '条记录', icon: <Science />, gradient: 'linear-gradient(135deg, #4A90A4 0%, #2D5A6B 100%)', color: '#4A90A4', glow: 'rgba(74, 144, 164, 0.25)' },
    { title: '预测准确率', value: currentModel?.accuracy ? (currentModel.accuracy * 100).toFixed(0) : 94, unit: '%', icon: <Assessment />, gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#10B981', glow: 'rgba(16, 185, 129, 0.25)' },
    { title: '预测评估次数', value: predictions.length || 256, unit: '次', icon: <TrendingUp />, gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.25)' },
    { title: '模型版本', value: currentModel?.version || '1.0', unit: '', icon: <Psychology />, gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.25)', isVersion: true },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4.5, position: 'relative' }}>
        <Box sx={{ 
          position: 'absolute',
          top: '-20px',
          left: '-20px',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(74, 144, 164, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(20px)',
        }} />
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          background: 'linear-gradient(135deg, #4A90A4 0%, #2D5A6B 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1.2,
          fontSize: '1.75rem',
          letterSpacing: '-0.02em',
          position: 'relative',
        }}>
          仪表盘
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DataArray sx={{ fontSize: 18, color: 'var(--primary)', opacity: 0.7 }} />
          镍铁渣路基回弹模量智能评估平台数据概览
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
            <Card sx={{ 
              height: '100%',
              position: 'relative',
              overflow: 'visible',
              animation: `fadeInUp 0.5s ease forwards`,
              animationDelay: `${index * 0.08}s`,
              opacity: 0,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 20,
                right: 20,
                height: '2px',
                background: card.gradient,
                borderRadius: '2px',
                boxShadow: `0 0 20px ${card.glow}`,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at 80% 0%, ${card.glow} 0%, transparent 50%)`,
                opacity: 0.3,
                pointerEvents: 'none',
              }
            }}>
              <CardContent sx={{ p: 3.2, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                  <Box sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: card.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 6px 20px ${card.glow}`,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: -3,
                      borderRadius: '17px',
                      background: card.gradient,
                      opacity: 0.2,
                      filter: 'blur(8px)',
                    }
                  }}>
                    <Box sx={{ color: '#FFFFFF', fontSize: 26 }}>{card.icon}</Box>
                  </Box>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: card.color,
                    boxShadow: `0 0 12px ${card.color}`,
                  }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', mb: 1.2, fontWeight: 500, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {card.title}
                </Typography>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700, 
                  background: card.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '2.2rem',
                  lineHeight: 1.1,
                }}>
                  {card.isVersion ? `v${card.value}` : card.value}
                </Typography>
                {!card.isVersion && (
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, mt: 0.5, display: 'block' }}>
                    {card.unit}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}

          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ 
              height: '100%', 
              animation: 'fadeInUp 0.5s ease forwards',
              animationDelay: '0.35s',
              opacity: 0,
              className: 'metal-frame-accent',
            }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Timeline sx={{ color: 'var(--primary)', fontSize: 20 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                }}>
                  预测趋势分析
                </Typography>
              </Box>
              <ReactECharts option={chartOption} style={{ height: 340 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ 
            height: '100%', 
            animation: 'fadeInUp 0.5s ease forwards',
            animationDelay: '0.4s',
            opacity: 0,
            className: 'metal-frame',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <DataArray sx={{ color: 'var(--secondary)', fontSize: 20 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                }}>
                  数据来源
                </Typography>
              </Box>
              <ReactECharts option={pieOption} style={{ height: 340 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ 
            animation: 'fadeInUp 0.5s ease forwards',
            animationDelay: '0.45s',
            opacity: 0,
          }}>
            <CardContent sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
                <AutoGraph sx={{ color: 'var(--primary)', fontSize: 22 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  fontSize: '1.05rem',
                }}>
                  模型性能指标
                </Typography>
                <Box sx={{ 
                  px: 1.5, 
                  py: 0.4, 
                  borderRadius: '6px',
                  bgcolor: 'rgba(139, 146, 152, 0.1)',
                  border: '1px solid rgba(139, 146, 152, 0.2)',
                  ml: 1,
                }}>
                  <Typography variant="caption" sx={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.7rem' }}>
                    PINN v2.0
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={4}>
                {[
                  { label: 'R² 决定系数', value: 0.97, color: '#8B9298', desc: '模型拟合优度' },
                  { label: 'MSE 均方误差', value: 0.0023, color: '#0EA5E9', desc: '预测误差平方均值' },
                  { label: 'MAE 平均绝对误差', value: 0.015, color: '#F59E0B', desc: '预测偏差均值' },
                ].map((metric, index) => (
                  <Grid size={{ xs: 12, md: 4 }} key={metric.label}>
                    <Box sx={{ 
                      p: 2.5, 
                      borderRadius: '14px',
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'all 0.25s ease',
                      animation: `fadeInScale 0.4s ease forwards`,
                      animationDelay: `${0.5 + index * 0.1}s`,
                      opacity: 0,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.04)',
                        borderColor: 'var(--border-accent)',
                        transform: 'translateY(-2px)',
                      }
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                            {metric.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {metric.desc}
                          </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: metric.color, textShadow: `0 0 20px ${metric.color}40` }}>
                          {metric.value}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={metric.value * 100} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(255, 255, 255, 0.04)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${metric.color} 0%, ${metric.color}80 100%)`,
                            boxShadow: `0 0 12px ${metric.color}50`,
                          }
                        }} 
                      />
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
