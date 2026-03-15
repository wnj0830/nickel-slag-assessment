import type { PredictionInput, PredictionResult, PhysicsConstraint, ProcessedDataRow } from '../types';

class PINNPredictor {
  private modelWeights: number[][] = [];
  private biases: number[][] = [];
  private trainingData: ProcessedDataRow[] = [];
  private dataStatistics: Map<string, { min: number; max: number; mean: number; std: number }> = new Map();
  private isTrained = false;

  constructor() {
    this.initializeModel();
  }

  setTrainingData(data: ProcessedDataRow[]) {
    this.trainingData = data;
    this.calculateDataStatistics();
    this.isTrained = data.length > 0;
    
    if (this.isTrained) {
      this.retrainModel();
    }
  }

  private calculateDataStatistics() {
    const numericFields = ['particleSize', 'stressLevel', 'loadingRate', 'moistureContent', 
                          'compactionDegree', 'slagContent', 'cyclicTimes', 'resilientModulus'];
    
    for (const field of numericFields) {
      const values = this.trainingData
        .map(row => row[field])
        .filter(v => v !== undefined && !isNaN(v)) as number[];
      
      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
        this.dataStatistics.set(field, {
          min: Math.min(...values),
          max: Math.max(...values),
          mean,
          std
        });
      }
    }
  }

  private initializeModel() {
    this.modelWeights = [
      [0.23, -0.15, 0.08, -0.12, 0.18, -0.06, 0.10],
      [-0.08, 0.21, -0.14, 0.09, -0.17, 0.13, -0.05],
      [0.12, 0.07, -0.19, 0.15, -0.08, 0.11, -0.14],
      [-0.05, -0.13, 0.16, -0.09, 0.14, -0.12, 0.07],
      [0.09, -0.06, -0.11, 0.17, -0.10, 0.08, -0.13],
    ];
    
    this.biases = [
      [-0.03],
      [0.05],
      [-0.02],
      [0.04],
      [-0.01],
    ];
  }

  private calculateBasePrediction(input: PredictionInput): number {
    const n = this.normalizeInput(input);
    const w = this.modelWeights[0];
    const sum = w[0] * n[0] + w[1] * n[1] + w[2] * n[2] + w[3] * n[3] + 
                w[4] * n[4] + w[5] * n[5] + w[6] * n[6];
    
    const stressEffect = (input.stressLevel / 100) * 15;
    const compactionEffect = ((input.compactionDegree - 85) / 15) * 20;
    const moistureEffect = Math.abs(input.moistureContent - 12) * 0.5;
    const slagEffect = (input.slagContent / 100) * 10;
    const cyclicEffect = Math.log10(input.cyclicTimes + 1) * 5;
    const particleEffect = (input.particleSize / 25) * 8;
    
    const base = 80 + stressEffect + compactionEffect - moistureEffect + slagEffect - cyclicEffect + particleEffect;
    
    return Math.max(30, Math.min(350, base + sum * 20));
  }

  private retrainModel() {
    if (this.trainingData.length < 10) return;

    const inputs = this.trainingData.map(row => [
      this.normalizeValue(row.particleSize, 'particleSize'),
      this.normalizeValue(row.stressLevel, 'stressLevel'),
      this.normalizeValue(row.loadingRate, 'loadingRate'),
      this.normalizeValue(row.moistureContent, 'moistureContent'),
      this.normalizeValue(row.compactionDegree, 'compactionDegree'),
      this.normalizeValue(row.slagContent, 'slagContent'),
      this.normalizeValue(row.cyclicTimes, 'cyclicTimes'),
    ]);

    const outputs = this.trainingData
      .map(row => row.resilientModulus)
      .filter(v => v !== undefined) as number[];

    if (outputs.length < 10) return;

    const minMr = Math.min(...outputs);
    const maxMr = Math.max(...outputs);
    const normalizedOutputs = outputs.map(v => (v - minMr) / (maxMr - minMr));

    const inputDim = 7;
    const hiddenDim = 5;
    
    for (let i = 0; i < hiddenDim; i++) {
      for (let j = 0; j < inputDim; j++) {
        this.modelWeights[i][j] = (Math.random() - 0.5) * 0.3;
      }
      this.biases[i][0] = (Math.random() - 0.5) * 0.1;
    }

    const learningRate = 0.01;
    const epochs = 100;

    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let sampleIdx = 0; sampleIdx < inputs.length; sampleIdx++) {
        const input = inputs[sampleIdx];
        const target = normalizedOutputs[sampleIdx];
        
        let sum = this.biases[0][0];
        for (let j = 0; j < inputDim; j++) {
          sum += this.modelWeights[0][j] * input[j];
        }
        const hidden = this.sigmoid(sum);
        
        const output = hidden;
        const error = target - output;
        
        const gradient = error * this.sigmoidDerivative(sum);
        
        for (let j = 0; j < inputDim; j++) {
          this.modelWeights[0][j] += learningRate * gradient * input[j];
        }
        this.biases[0][0] += learningRate * gradient;
      }
    }
  }

  private normalizeValue(value: number | undefined, field: string): number {
    if (value === undefined || isNaN(value)) {
      return 0.5;
    }
    
    const stats = this.dataStatistics.get(field);
    if (!stats || stats.max === stats.min) {
      return 0.5;
    }
    
    return (value - stats.min) / (stats.max - stats.min);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
  }

  private sigmoidDerivative(x: number): number {
    const s = this.sigmoid(x);
    return s * (1 - s);
  }

  private forwardPass(normalizedInput: number[]): number {
    let current = normalizedInput;
    
    for (let i = 0; i < this.modelWeights.length; i++) {
      let sum = this.biases[i][0];
      for (let j = 0; j < current.length; j++) {
        sum += this.modelWeights[i][j] * current[j];
      }
      current = [this.sigmoid(sum)];
    }
    
    return current[0];
  }

  private applyPhysicsConstraints(
    basePrediction: number,
    input: PredictionInput,
    constraints: PhysicsConstraint[]
  ): number {
    let adjustedPrediction = basePrediction;
    let totalWeight = 0;

    for (const constraint of constraints) {
      if (!constraint.enabled) continue;

      let correction = 0;

      switch (constraint.name) {
        case '颗粒破碎演化方程':
          correction = this.calculateParticleBreakageCorrection(input);
          break;

        case '回弹模量与应力关系':
          correction = this.calculateStressModulusCorrection(input, basePrediction);
          break;

        case '损伤演化方程':
          correction = this.calculateDamageCorrection(input);
          break;

        default:
          break;
      }

      adjustedPrediction += correction * constraint.weight;
      totalWeight += constraint.weight;
    }

    if (totalWeight > 0) {
      const physicsWeight = Math.min(totalWeight * 0.1, 0.5);
      adjustedPrediction = basePrediction * (1 - physicsWeight) + adjustedPrediction * physicsWeight;
    }

    return Math.max(20, Math.min(500, adjustedPrediction));
  }

  private calculateParticleBreakageCorrection(input: PredictionInput): number {
    const B0 = 0.05;
    const Bmax = 0.85;
    const k = 0.0003;
    const N = input.cyclicTimes;
    const breakage = B0 + (Bmax - B0) * (1 - Math.exp(-k * N));
    
    const stressEffect = 1 + (input.stressLevel / 500) * 0.2;
    const compactionEffect = (input.compactionDegree - 85) / 15 * 0.1;
    
    const correction = -(breakage * stressEffect + compactionEffect) * 0.15;
    return correction;
  }

  private calculateStressModulusCorrection(input: PredictionInput, basePrediction: number): number {
    const k1 = this.isTrained ? (this.dataStatistics.get('resilientModulus')?.mean || 450) : 450;
    const k2 = 0.45;
    const pa = 101.3;
    const sigma3 = input.stressLevel;
    
    const mrFromStress = k1 * pa * Math.pow(sigma3 / pa, k2);
    const normalizedBase = basePrediction / 500;
    const normalizedStress = mrFromStress / 1000;
    
    return (normalizedStress - normalizedBase) * 0.2;
  }

  private calculateDamageCorrection(input: PredictionInput): number {
    const sigma = input.stressLevel;
    const sigma_c = 350;
    const m = 2.5;
    const damage = 1 - Math.exp(-Math.pow(sigma / sigma_c, m));
    
    const moistureEffect = 1 + Math.abs(input.moistureContent - 12) / 10;
    return -damage * moistureEffect * 0.1;
  }

  private calculateDataDrivenAdjustment(input: PredictionInput): number {
    if (!this.isTrained || this.trainingData.length < 5) {
      return 0;
    }

    let adjustment = 0;

    const similarRecords = this.trainingData.filter(row => {
      const particleDiff = Math.abs((row.particleSize || 0) - input.particleSize) / (input.particleSize || 1);
      const stressDiff = Math.abs((row.stressLevel || 0) - input.stressLevel) / (input.stressLevel || 1);
      return (particleDiff + stressDiff) < 0.3;
    });

    if (similarRecords.length > 0) {
      const avgMr = similarRecords.reduce((sum, r) => sum + (r.resilientModulus || 0), 0) / similarRecords.length;
      const baselineMr = this.dataStatistics.get('resilientModulus')?.mean || 250;
      
      const similarityWeight = Math.min(similarRecords.length / 10, 0.3);
      adjustment = ((avgMr - baselineMr) / baselineMr) * similarityWeight;
    }

    return adjustment;
  }

  async predict(
    input: PredictionInput,
    constraints: PhysicsConstraint[]
  ): Promise<PredictionResult> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const normalizedInput = this.normalizeInput(input);
    const basePrediction = this.calculateBasePrediction(input);

    const dataDrivenAdjustment = this.calculateDataDrivenAdjustment(input);
    const adjustedWithData = basePrediction * (1 + dataDrivenAdjustment);

    const physicsAdjustedPrediction = this.applyPhysicsConstraints(
      adjustedWithData,
      input,
      constraints
    );

    const particleBreakage = this.calculateParticleBreakage(input);
    const confidence = this.calculateConfidence(input);

    return {
      id: `pred_${Date.now()}`,
      input,
      output: {
        resilientModulus: Math.round(physicsAdjustedPrediction * 10) / 10,
        confidence: Math.round(confidence * 100) / 100,
        particleBreakage: Math.round(particleBreakage * 1000) / 1000,
        reliability: confidence > 0.9 ? '高' : confidence > 0.7 ? '中' : '较低',
      },
      timestamp: new Date().toISOString(),
      modelVersion: this.isTrained ? '2.0.0' : '1.0.0',
    };
  }

  private normalizeInput(input: PredictionInput): number[] {
    const maxValues = [50, 500, 100, 30, 100, 100, 10000];
    const minValues = [0.1, 10, 0.1, 5, 85, 0, 1];
    
    return [
      (input.particleSize - minValues[0]) / (maxValues[0] - minValues[0]),
      (input.stressLevel - minValues[1]) / (maxValues[1] - minValues[1]),
      (input.loadingRate - minValues[2]) / (maxValues[2] - minValues[2]),
      (input.moistureContent - minValues[3]) / (maxValues[3] - minValues[3]),
      (input.compactionDegree - minValues[4]) / (maxValues[4] - minValues[4]),
      (input.slagContent - minValues[5]) / (maxValues[5] - minValues[5]),
      Math.log10(input.cyclicTimes + 1) / 4,
    ];
  }

  private calculateParticleBreakage(input: PredictionInput): number {
    const B0 = 0.05;
    const Bmax = 0.85;
    const k = 0.0003;
    const stressFactor = input.stressLevel / 500;
    const breakage = B0 + (Bmax - B0) * (1 - Math.exp(-k * input.cyclicTimes * stressFactor));
    return Math.min(breakage, 1);
  }

  private calculateConfidence(input: PredictionInput): number {
    let confidence = this.isTrained ? 0.90 : 0.80;

    if (this.isTrained) {
      const stats = this.dataStatistics.get('resilientModulus');
      if (stats && stats.std > 0) {
        confidence += 0.05;
      }
    }

    if (input.compactionDegree >= 93) confidence += 0.03;
    if (input.moistureContent >= 8 && input.moistureContent <= 15) confidence += 0.02;
    if (input.cyclicTimes > 100 && input.cyclicTimes < 10000) confidence += 0.02;

    return Math.min(confidence, 0.98);
  }

  getModelInfo() {
    return {
      isTrained: this.isTrained,
      trainingDataSize: this.trainingData.length,
      statistics: Object.fromEntries(this.dataStatistics),
    };
  }
}

export const pinnPredictor = new PINNPredictor();
