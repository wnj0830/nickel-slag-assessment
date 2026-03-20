import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { Speed, AutoGraph, Bolt } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const impactChartOption = {
  title: { 
    text: '冲击荷载与颗粒破碎关系', 
    left: 'center',
    textStyle: { color: '#9CA3AF', fontSize: 14 }
  },
  tooltip: { 
    trigger: 'axis',
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderColor: 'rgba(139, 146, 152, 0.3)',
    textStyle: { color: '#F9FAFB' }
  },
  grid: { top: 60, right: 30, bottom: 40, left: 50 },
  xAxis: { 
    type: 'category', 
    data: ['0', '5', '10', '15', '20', '25', '30'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: '#9CA3AF' }
  },
  yAxis: { 
    type: 'value', 
    name: '颗粒破碎率(%)',
    nameTextStyle: { color: '#9CA3AF' },
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: '#9CA3AF' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
  },
  series: [
    {
      data: [2.1, 8.5, 18.3, 32.5, 48.2, 65.8, 78.5],
      type: 'line',
      smooth: true,
      lineStyle: { color: '#8B9298', width: 3 },
      areaStyle: { 
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(139, 146, 152, 0.3)' },
            { offset: 1, color: 'rgba(139, 146, 152, 0)' }
          ]
        }
      },
      itemStyle: { color: '#8B9298' },
    },
  ],
};

const triaxialChartOption = {
  title: { 
    text: '动三轴试验回弹模量变化', 
    left: 'center',
    textStyle: { color: '#9CA3AF', fontSize: 14 }
  },
  tooltip: { 
    trigger: 'axis',
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderColor: 'rgba(139, 146, 152, 0.3)',
    textStyle: { color: '#F9FAFB' }
  },
  legend: { data: ['围压50kPa', '围压100kPa', '围压200kPa'], top: 30, textStyle: { color: '#9CA3AF' } },
  grid: { top: 80, right: 30, bottom: 40, left: 50 },
  xAxis: { 
    type: 'category', 
    data: ['100', '500', '1000', '2000', '5000', '10000'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: '#9CA3AF' }
  },
  yAxis: { 
    type: 'value', 
    name: '回弹模量(MPa)',
    nameTextStyle: { color: '#9CA3AF' },
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: '#9CA3AF' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
  },
  series: [
    { name: '围压50kPa', type: 'line', data: [85, 78, 72, 65, 58, 52], smooth: true, itemStyle: { color: '#8B9298' }, lineStyle: { width: 2 } },
    { name: '围压100kPa', type: 'line', data: [120, 108, 98, 88, 78, 70], smooth: true, itemStyle: { color: '#5A6168' }, lineStyle: { width: 2 } },
    { name: '围压200kPa', type: 'line', data: [165, 148, 135, 122, 108, 96], smooth: true, itemStyle: { color: '#F59E0B' }, lineStyle: { width: 2 } },
  ],
};

const stressStrainOption = {
  title: { 
    text: '应力-应变曲线', 
    left: 'center',
    textStyle: { color: '#9CA3AF', fontSize: 14 }
  },
  tooltip: { 
    trigger: 'axis',
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    borderColor: 'rgba(139, 146, 152, 0.3)',
    textStyle: { color: '#F9FAFB' }
  },
  grid: { top: 60, right: 30, bottom: 40, left: 50 },
  xAxis: { 
    type: 'value', 
    name: '应变(%)',
    nameTextStyle: { color: '#9CA3AF' },
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: '#9CA3AF' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
  },
  yAxis: { 
    type: 'value', 
    name: '应力(MPa)',
    nameTextStyle: { color: '#9CA3AF' },
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: '#9CA3AF' },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
  },
  series: [
    {
      type: 'line',
      data: [[0, 0], [0.5, 15], [1.0, 28], [1.5, 38], [2.0, 45], [2.5, 50]],
      smooth: true,
      lineStyle: { color: '#10B981', width: 3 },
      areaStyle: { 
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
          ]
        }
      },
      itemStyle: { color: '#10B981' },
    },
  ],
};

export default function Experiments() {
  const [tabValue, setTabValue] = useState(0);

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
          试验数据分析
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
          冲击荷载试验、动三轴试验及颗粒破碎分析可视化
        </Typography>
      </Box>

      <Card sx={{ position: 'relative', '&::before': { content: '""', position: 'absolute', top: 0, left: 20, right: 20, height: 1, background: 'linear-gradient(90deg, transparent 0%, rgba(139, 146, 152, 0.3) 50%, transparent 100%)' } }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, v) => setTabValue(v)}
            sx={{ 
              px: 3,
              borderBottom: '1px solid var(--border-subtle)',
              '& .MuiTab-root': {
                color: 'var(--text-secondary)',
                '&.Mui-selected': {
                  color: 'var(--primary)',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'var(--primary)',
              }
            }}
          >
            <Tab label="冲击荷载试验" icon={<Bolt />} iconPosition="start" />
            <Tab label="动三轴试验" icon={<Speed />} iconPosition="start" />
            <Tab label="颗粒破碎分析" icon={<AutoGraph />} iconPosition="start" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3} sx={{ p: 3 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card variant="outlined" sx={{ bgcolor: 'transparent' }}>
                  <CardContent>
                    <ReactECharts option={impactChartOption} style={{ height: 350 }} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ bgcolor: 'transparent', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      试验参数
                    </Typography>
                    {[
                      { label: '冲击能量', value: '0-30 kJ' },
                      { label: '落锤高度', value: '1-6 m' },
                      { label: '试验样本数', value: '128 组' },
                      { label: '数据精度', value: '高精度', isChip: true },
                    ].map(item => (
                      <Box key={item.label} sx={{ mb: 2.5 }}>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>
                          {item.label}
                        </Typography>
                        {item.isChip ? (
                          <Chip label={item.value} color="success" size="small" />
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {item.value}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3} sx={{ p: 3 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card variant="outlined" sx={{ bgcolor: 'transparent' }}>
                  <CardContent>
                    <ReactECharts option={triaxialChartOption} style={{ height: 350 }} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ bgcolor: 'transparent', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      试验参数
                    </Typography>
                    {[
                      { label: '围压范围', value: '50-200 kPa' },
                      { label: '加载频率', value: '0.1-2 Hz' },
                      { label: '循环次数', value: '1-10000 次' },
                      { label: '试验样本数', value: '96 组' },
                    ].map(item => (
                      <Box key={item.label} sx={{ mb: 2.5 }}>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3} sx={{ p: 3 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Card variant="outlined" sx={{ bgcolor: 'transparent' }}>
                  <CardContent>
                    <ReactECharts option={stressStrainOption} style={{ height: 350 }} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ bgcolor: 'transparent', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      破碎指标
                    </Typography>
                    {[
                      { label: '相对破碎率Br', value: 0.65, color: '#8B9298' },
                      { label: '破碎势Bp', value: 0.82, color: '#F59E0B' },
                      { label: '能量破碎指数', value: 0.45, color: '#10B981' },
                    ].map(item => (
                      <Box key={item.label} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                            {item.label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: item.color }}>
                            {item.value}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.value * 100} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: item.color,
                              boxShadow: `0 0 10px ${item.color}60`,
                            }
                          }} 
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}
