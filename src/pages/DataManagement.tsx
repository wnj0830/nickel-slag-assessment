import React, { useState } from 'react';
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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  LinearProgress,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { Delete, Edit, Upload, Visibility, Close, Check, Warning } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addExperiment, setProcessedData, setCurrentMappings, setDataPreview } from '../store/slices/experimentSlice';
import { 
  parseExcelFile, 
  parseCsvFile, 
  analyzeFields, 
  suggestFieldMappings, 
  getAvailableTargetFields,
  applyFieldMappings,
  validateProcessedData,
  type ParsedData,
  type DataField,
  type FieldMapping
} from '../services/dataProcessor';
import type { ExperimentData } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const mockData: ExperimentData[] = [
  { id: '1', name: '冲击荷载试验数据-2024-01', type: 'impact', date: '2024-01-15', records: 1250, status: 'ready', data: [], fields: [] },
  { id: '2', name: '动三轴试验数据-2024-02', type: 'triaxial', date: '2024-02-20', records: 890, status: 'ready', data: [], fields: [] },
  { id: '3', name: '固结试验数据-2024-03', type: 'other', date: '2024-03-10', records: 560, status: 'pending', data: [], fields: [] },
  { id: '4', name: '颗粒破碎试验-2024-01', type: 'impact', date: '2024-01-25', records: 2100, status: 'ready', data: [], fields: [] },
  { id: '5', name: '回弹模量试验数据', type: 'triaxial', date: '2024-02-28', records: 780, status: 'ready', data: [], fields: [] },
];

export default function DataManagement() {
  const dispatch = useAppDispatch();
  const { processedData, currentMappings } = useAppSelector(state => state.experiments);
  
  const [data] = useState<ExperimentData[]>(mockData);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  
  const [activeStep, setActiveStep] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [analyzedFields, setAnalyzedFields] = useState<DataField[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; issues: string[]; completeness: number } | null>(null);
  const [dataTab, setDataTab] = useState(0);
  const [datasetName, setDatasetName] = useState('');
  const [datasetType, setDatasetType] = useState<'impact' | 'triaxial' | 'other'>('impact');

  const steps = ['上传文件', '字段映射', '数据预览', '确认导入'];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      let parsed: ParsedData;
      if (file.name.endsWith('.csv')) {
        parsed = await parseCsvFile(file);
      } else {
        parsed = await parseExcelFile(file);
      }

      setParsedData(parsed);
      const fields = analyzeFields(parsed.headers, parsed.rows);
      setAnalyzedFields(fields);
      
      const suggestions = suggestFieldMappings(parsed.headers);
      
      const initialMappings = suggestions.map(s => ({
        sourceField: s.field,
        targetField: s.confidence > 0.5 ? s.suggestedMapping : 'ignore',
        transform: 'none' as const,
      }));
      setMappings(initialMappings);
      
      setActiveStep(1);
    } catch (error) {
      console.error('文件解析失败:', error);
      alert('文件解析失败，请检查文件格式');
    }
  };

  const handleMappingChange = (sourceField: string, targetField: string) => {
    setMappings(prev => prev.map(m => 
      m.sourceField === sourceField ? { ...m, targetField } : m
    ));
  };

  const handleTransformChange = (sourceField: string, transform: 'none' | 'log' | 'sqrt' | 'normalize') => {
    setMappings(prev => prev.map(m => 
      m.sourceField === sourceField ? { ...m, transform } : m
    ));
  };

  const handlePreview = () => {
    if (!parsedData) return;
    
    const processed = applyFieldMappings(parsedData.rows, mappings);
    dispatch(setDataPreview(processed));
    
    const validation = validateProcessedData(processed);
    setValidationResult(validation);
    
    dispatch(setCurrentMappings(mappings));
    setActiveStep(2);
  };

  const handleConfirmImport = () => {
    if (!parsedData || !datasetName) return;
    
    const processed = applyFieldMappings(parsedData.rows, mappings);
    dispatch(setProcessedData(processed));
    
    const newExperiment: ExperimentData = {
      id: `exp_${Date.now()}`,
      name: datasetName,
      type: datasetType,
      date: new Date().toISOString().split('T')[0],
      records: parsedData.totalRows,
      data: parsedData.rows,
      fields: analyzedFields,
      status: 'ready',
    };
    
    dispatch(addExperiment(newExperiment));
    
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setUploadDialog(false);
    setFileName('');
    setActiveStep(0);
    setParsedData(null);
    setAnalyzedFields([]);
    setMappings([]);
    setValidationResult(null);
    setDatasetName('');
    setDatasetType('impact');
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      impact: '冲击荷载试验',
      triaxial: '动三轴试验',
      other: '其他试验',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'success';
      case 'processed': return 'info';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const targetFields = getAvailableTargetFields();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>数据管理</Typography>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setUploadDialog(true)}
        >
          上传数据
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: 'var(--text-primary)' }}>数据统计</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>已上传数据集</Typography>
              <Typography variant="h4" sx={{ color: 'var(--text-primary)' }}>{data.length}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>总记录数</Typography>
              <Typography variant="h4" sx={{ color: 'var(--text-primary)' }}>{data.reduce((sum, d) => sum + d.records, 0).toLocaleString()}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>可用预测数据</Typography>
              <Typography variant="h4" sx={{ color: 'var(--text-primary)' }}>{processedData.length}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>数据类型</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="冲击荷载" color="primary" size="small" />
                <Chip label="动三轴" color="secondary" size="small" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>数据集名称</TableCell>
                  <TableCell>数据类型</TableCell>
                  <TableCell>上传日期</TableCell>
                  <TableCell>记录数</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>
                      <Chip label={getTypeLabel(row.type)} color={row.type === 'impact' ? 'primary' : row.type === 'triaxial' ? 'secondary' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.records.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status === 'ready' ? '可用' : row.status === 'processed' ? '已处理' : '待处理'} 
                        color={getStatusColor(row.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small"><Visibility /></IconButton>
                      <IconButton size="small"><Edit /></IconButton>
                      <IconButton size="small" color="error"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog 
        open={uploadDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { minHeight: '70vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">导入试验数据</Typography>
          <IconButton onClick={handleCloseDialog}><Close /></IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outlined" component="span" sx={{ py: 2, px: 4 }}>
                  <Upload sx={{ mr: 1 }} /> 选择文件
                </Button>
              </label>
              <Typography variant="body2" sx={{ mt: 2, color: 'var(--text-secondary)' }}>
                支持 .xlsx, .xls, .csv 格式文件
              </Typography>
              {fileName && (
                <Alert severity="success" sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
                  已选择: {fileName}
                </Alert>
              )}
            </Box>
          )}

          {activeStep === 1 && parsedData && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                检测到 {parsedData.totalRows} 条数据记录，{parsedData.headers.length} 个字段
              </Alert>
              
              <Typography variant="subtitle1" gutterBottom>字段映射配置</Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>原始字段</TableCell>
                      <TableCell>检测类型</TableCell>
                      <TableCell>映射到</TableCell>
                      <TableCell>数据变换</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mappings.map((mapping) => {
                      const field = analyzedFields.find(f => f.key === mapping.sourceField);
                      return (
                        <TableRow key={mapping.sourceField}>
                          <TableCell>{mapping.sourceField}</TableCell>
                          <TableCell>
                            <Chip 
                              label={field?.type === 'number' ? '数值' : field?.type === 'date' ? '日期' : '文本'} 
                              size="small" 
                              color={field?.type === 'number' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <FormControl size="small" sx={{ minWidth: 180 }}>
                              <Select
                                value={mapping.targetField}
                                onChange={(e) => handleMappingChange(mapping.sourceField, e.target.value)}
                              >
                                {targetFields.map(tf => (
                                  <MenuItem key={tf.key} value={tf.key}>
                                    {tf.label} {tf.unit ? `(${tf.unit})` : ''}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <Select
                              size="small"
                              value={mapping.transform}
                              onChange={(e) => handleTransformChange(mapping.sourceField, e.target.value as any)}
                              sx={{ minWidth: 120 }}
                            >
                              <MenuItem value="none">无</MenuItem>
                              <MenuItem value="log">对数(log)</MenuItem>
                              <MenuItem value="sqrt">平方根</MenuItem>
                              <MenuItem value="normalize">归一化</MenuItem>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Tabs value={dataTab} onChange={(_, v) => setDataTab(v)} sx={{ mb: 2 }}>
                <Tab label="数据预览" />
                <Tab label="数据统计" />
                <Tab label="验证结果" />
              </Tabs>
              
              <TabPanel value={dataTab} index={0}>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {currentMappings.filter(m => m.targetField !== 'ignore').map(m => (
                          <TableCell key={m.targetField}>
                            {targetFields.find(tf => tf.key === m.targetField)?.label || m.targetField}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {useAppSelector(state => state.experiments.dataPreview).slice(0, 20).map((row, idx) => (
                        <TableRow key={idx}>
                          {currentMappings.filter(m => m.targetField !== 'ignore').map(m => (
                            <TableCell key={m.targetField}>
                              {row[m.targetField]?.toFixed(2) ?? '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Typography variant="body2" sx={{ mt: 1, color: 'var(--text-secondary)' }}>
                  显示前20条数据，共 {useAppSelector(state => state.experiments.dataPreview).length} 条
                </Typography>
              </TabPanel>
              
              <TabPanel value={dataTab} index={1}>
                <Grid container spacing={2}>
                  {currentMappings.filter(m => m.targetField !== 'ignore').map(m => {
                    const values = useAppSelector(state => state.experiments.dataPreview)
                      .map(r => r[m.targetField])
                      .filter(v => v !== undefined) as number[];
                    
                    if (values.length === 0) return null;
                    
                    const mean = values.reduce((a, b) => a + b, 0) / values.length;
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    
                    return (
                      <Grid size={{ xs: 12, md: 6 }} key={m.targetField}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2">
                              {targetFields.find(tf => tf.key === m.targetField)?.label}
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                              <Grid size={{ xs: 4 }}>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>最小值</Typography>
                                <Typography sx={{ color: 'var(--text-primary)' }}>{min.toFixed(2)}</Typography>
                              </Grid>
                              <Grid size={{ xs: 4 }}>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>平均值</Typography>
                                <Typography sx={{ color: 'var(--text-primary)' }}>{mean.toFixed(2)}</Typography>
                              </Grid>
                              <Grid size={{ xs: 4 }}>
                                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>最大值</Typography>
                                <Typography sx={{ color: 'var(--text-primary)' }}>{max.toFixed(2)}</Typography>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </TabPanel>
              
              <TabPanel value={dataTab} index={2}>
                {validationResult && (
                  <Box>
                    <Alert 
                      severity={validationResult.valid ? 'success' : 'error'} 
                      icon={validationResult.valid ? <Check /> : <Warning />}
                      sx={{ mb: 2 }}
                    >
                      {validationResult.valid 
                        ? `数据验证通过！完整度: ${validationResult.completeness.toFixed(1)}%` 
                        : '数据验证存在问题'}
                    </Alert>
                    
                    {validationResult.issues.map((issue, idx) => (
                      <Alert severity="warning" key={idx} sx={{ mb: 1 }}>
                        {issue}
                      </Alert>
                    ))}
                    
                    <Typography variant="subtitle2" sx={{ mt: 2, color: 'var(--text-primary)' }}>完整度</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={validationResult.completeness} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                      {Math.round(validationResult.completeness * useAppSelector(state => state.experiments.dataPreview).length / 100)} / {useAppSelector(state => state.experiments.dataPreview).length} 条有效数据
                    </Typography>
                  </Box>
                )}
              </TabPanel>
            </Box>
          )}

          {activeStep === 3 && (
            <Box sx={{ py: 2 }}>
              <TextField
                fullWidth
                label="数据集名称"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>数据类型</InputLabel>
                <Select
                  value={datasetType}
                  label="数据类型"
                  onChange={(e) => setDatasetType(e.target.value as any)}
                >
                  <MenuItem value="impact">冲击荷载试验</MenuItem>
                  <MenuItem value="triaxial">动三轴试验</MenuItem>
                  <MenuItem value="other">其他试验</MenuItem>
                </Select>
              </FormControl>
              
              <Alert severity="info">
                确认导入后将生成 {parsedData?.totalRows} 条有效记录到系统中
              </Alert>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          {activeStep > 0 && activeStep < 3 && (
            <Button onClick={() => setActiveStep(prev => prev - 1)}>上一步</Button>
          )}
          {activeStep === 1 && (
            <Button variant="contained" onClick={handlePreview}>
              预览数据
            </Button>
          )}
          {activeStep === 2 && (
            <Button variant="contained" onClick={() => setActiveStep(3)}>
              下一步
            </Button>
          )}
          {activeStep === 3 && (
            <>
              <Button onClick={() => setActiveStep(2)}>上一步</Button>
              <Button 
                variant="contained" 
                onClick={handleConfirmImport}
                disabled={!datasetName}
              >
                确认导入
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
