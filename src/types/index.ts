export interface ExperimentData {
  id: string;
  name: string;
  type: 'impact' | 'triaxial' | 'other';
  date: string;
  records: number;
  data: Record<string, any>[];
  fields: DataField[];
  status: 'pending' | 'processed' | 'ready';
}

export interface DataField {
  key: string;
  label: string;
  type: 'number' | 'string' | 'date';
  unit?: string;
  mappedTo?: string;
  statistics?: FieldStatistics;
}

export interface FieldStatistics {
  min: number;
  max: number;
  mean: number;
  std: number;
  count: number;
}

export interface RawDataRow {
  [key: string]: any;
}

export interface ProcessedData {
  id: string;
  rawData: RawDataRow[];
  processedData: ProcessedDataRow[];
  fields: DataField[];
  uploadTime: string;
  recordCount: number;
  fieldMappings: FieldMapping[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: 'none' | 'log' | 'sqrt' | 'normalize';
}

export interface ProcessedDataRow {
  particleSize?: number;
  stressLevel?: number;
  loadingRate?: number;
  moistureContent?: number;
  compactionDegree?: number;
  slagContent?: number;
  cyclicTimes?: number;
  resilientModulus?: number;
  particleBreakage?: number;
  [key: string]: number | undefined;
}

export interface PredictionInput {
  particleSize?: number;
  stressLevel?: number;
  loadingRate?: number;
  moistureContent?: number;
  compactionDegree?: number;
  slagContent?: number;
  cyclicTimes?: number;
  particleDensity?: number;
  maxDryDensity?: number;
  optMoistureContent?: number;
  nonUniformityCoeff?: number;
  curvatureCoeff?: number;
  poissonRatio?: number;
  layerThickness?: number;
  initialCompactionStd?: number;
  actualDryDensity?: number;
  actualCompactionDegree?: number;
  fieldMoistureContent?: number;
  saturation?: number;
  confiningPressure?: number;
  deviatorStress?: number;
  octahedralNormalStress?: number;
  octahedralShearStress?: number;
  subgradeTemperature?: number;
  dryWetCycleCount?: number;
  trafficLoadCount?: number;
}

export interface PredictionResult {
  id: string;
  input: PredictionInput;
  output: {
    resilientModulus: number;
    confidence: number;
    particleBreakage: number;
    reliability: string;
  };
  timestamp: string;
  modelVersion: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  version: string;
  accuracy: number;
  mse: number;
  r2: number;
  trainingDate: string;
  status: 'training' | 'ready' | 'deprecated';
}

export interface PhysicsConstraint {
  name: string;
  equation: string;
  weight: number;
  enabled: boolean;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  type: 'postgresql' | 'mysql' | 'mongodb';
}

export interface SensorData {
  id: string;
  name: string;
  position: number; // 桩号/里程 (米)
  status: 'normal' | 'warning' | 'critical';
  resilientModulus: number;
  thresholdMin: number;
  thresholdMax: number;
  lastUpdate: string;
  temperature?: number;
  humidity?: number;
}

export interface MaintenanceRecommendation {
  level: 'normal' | 'minor' | 'moderate' | 'serious';
  action: string;
  urgency: 'routine' | 'attention' | 'urgent';
}

export interface PhysicsParams {
  id: string;
  particleDensity: number;
  maxDryDensity: number;
  optimalMoisture: number;
  originalGradation: string;
  uniformityCoefficient: number;
  curvatureCoefficient: number;
  poissonRatio: number;
  structureLayerThickness: number;
  initialCompactionStandard: number;
  updatedAt: string;
}

export interface RealtimeSensorData {
  id: string;
  timestamp: string;
  locationId: string;
  locationName: string;
  type?: 'drainage' | 'safety' | 'auxiliary' | 'structure' | 'other';
  gpsCoordinates: {
    lat: number;
    lng: number;
  };
  actualDryDensity: number;
  actualCompactionDegree: number;
  fieldMoistureContent: number;
  saturation: number;
  confiningPressure: number;
  deviatorStress: number;
  octahedralNormalStress: number;
  octahedralShearStress: number;
  subgradeTemperature: number;
  dryWetCycleCount: number;
  trafficLoadCount: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface RoadSection {
  id: string;
  name: string;
  type: 'drainage' | 'safety' | 'auxiliary' | 'structure' | 'other';
  startStake: number;
  endStake: number;
  length: number;
  gpsCoordinates: {
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
  };
  status: 'normal' | 'warning' | 'critical';
  sensors: SectionSensor[];
}

export interface SectionSensor {
  id: string;
  name: string;
  type: string;
  position: number;
  lastData: RealtimeSensorData | null;
  isActive: boolean;
}

export interface MonitorDisplay {
  id: string;
  title: string;
  sectionType: 'drainage' | 'safety' | 'auxiliary' | 'structure' | 'other';
  roadSectionId: string;
  isExpanded: boolean;
}

export interface AIConversation {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface DiagnosisResult {
  reason: string;
  solution: string;
  severity: 'critical' | 'warning' | 'normal';
}

export const diagnosisRules: Record<number, DiagnosisResult> = {
  1: {
    reason: '水-热-载耦合软化 - 高含水率 + 路基升温 + 行车荷载的耦合作用',
    solution: '实施综合温湿度调控：强化排水降低含水率；高温期对重载车道洒水降温；极端天气时对重车进行交通管制',
    severity: 'critical'
  },
  2: {
    reason: '应力路径诱发结构退化 - 低围压 + 高偏应力 + 荷载作用次数',
    solution: '进行侧向约束补强：在路基边坡或薄弱区采用土工格栅等材料进行加筋包裹，提高有效侧限',
    severity: 'critical'
  },
  3: {
    reason: '干湿循环与盐分运移协同损伤 - 干湿循环次数 + 含水率 + 饱和度',
    solution: '采用毛细阻滞与防水封闭：在路基顶部铺设防水土工膜或沥青处治层，阻断水分和盐分迁移',
    severity: 'warning'
  },
  4: {
    reason: '疲劳破碎与级配细化正反馈 - 颗粒破碎 + 饱和度 + 剪应力',
    solution: '实施预防性养护与级配再生：破碎初期采用乳化沥青或微量水泥进行现场冷再生，胶结细颗粒',
    severity: 'critical'
  },
  5: {
    reason: '温度梯度与冻融损伤 - 路基温度 + 含水率',
    solution: '采用隔热与填料改良：铺设隔热层减少冻结深度，或换填为非冻敏性材料',
    severity: 'warning'
  },
  6: {
    reason: '不饱和吸力丧失与刚度衰减 - 含水率 + 饱和度',
    solution: '优化湿度设计与主动调控：通过渗管、通风管等主动设施调控路基湿度，维持有益吸力',
    severity: 'warning'
  },
  7: {
    reason: '交通荷载的"振动液化"效应 - 高饱和度 + 行车荷载',
    solution: '实施动力排水与临时管制：设置竖向排水体加速孔隙水排出；降雨饱和后对重车临时限行',
    severity: 'critical'
  },
  8: {
    reason: '压实度时程衰减与荷载侵入 - 实际压实度 + 温度变化 + 干湿循环 + 荷载',
    solution: '执行周期性再压实与表面封层：定期补充振动压实；加铺沥青碎石封层封闭裂缝',
    severity: 'warning'
  },
  9: {
    reason: '应力状态偏离设计包络线 - 围压 + 偏应力 + 荷载次数',
    solution: '进行基于监测的应力状态优化：通过调整路面结构层刚度或设置应力吸收层，优化应力分布',
    severity: 'warning'
  },
  10: {
    reason: '环境侵蚀与化学老化 - 温度 + 含水率 + 干湿循环',
    solution: '采取材料改性与环境隔离：掺加石灰或水泥稳定化学成分；设置防渗隔离层减少水汽侵入',
    severity: 'warning'
  }
};
