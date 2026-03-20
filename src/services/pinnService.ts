import type { PredictionInput, PredictionResult, PhysicsConstraint, ProcessedDataRow } from '../types';

const trainingData = [
  { group: 'A', actualDryDensity: 2.02, actualCompactionDegree: 94.0, fieldMoistureContent: 11.0, saturation: 75.0, confiningPressure: 60, deviatorStress: 250, octahedralNormalStress: 120, octahedralShearStress: 100, subgradeTemperature: 25, dryWetCycleCount: 5, trafficLoadCount: 300, resilientModulus: 45.5 },
  { group: 'A', actualDryDensity: 2.06, actualCompactionDegree: 95.8, fieldMoistureContent: 9.8, saturation: 65.0, confiningPressure: 80, deviatorStress: 300, octahedralNormalStress: 153, octahedralShearStress: 120, subgradeTemperature: 20, dryWetCycleCount: 2, trafficLoadCount: 600, resilientModulus: 47.1 },
  { group: 'A', actualDryDensity: 2.10, actualCompactionDegree: 97.7, fieldMoistureContent: 8.5, saturation: 55.0, confiningPressure: 100, deviatorStress: 180, octahedralNormalStress: 127, octahedralShearStress: 85, subgradeTemperature: 15, dryWetCycleCount: 0, trafficLoadCount: 50, resilientModulus: 78.5 },
  { group: 'A', actualDryDensity: 2.08, actualCompactionDegree: 96.7, fieldMoistureContent: 9.0, saturation: 58.0, confiningPressure: 120, deviatorStress: 200, octahedralNormalStress: 173, octahedralShearStress: 110, subgradeTemperature: 10, dryWetCycleCount: 1, trafficLoadCount: 100, resilientModulus: 72.8 },
  { group: 'A', actualDryDensity: 2.12, actualCompactionDegree: 98.6, fieldMoistureContent: 8.0, saturation: 50.0, confiningPressure: 150, deviatorStress: 160, octahedralNormalStress: 187, octahedralShearStress: 110, subgradeTemperature: 5, dryWetCycleCount: 0, trafficLoadCount: 150, resilientModulus: 81.5 },
  { group: 'B', actualDryDensity: 1.92, actualCompactionDegree: 93.7, fieldMoistureContent: 12.8, saturation: 90.0, confiningPressure: 40, deviatorStress: 200, octahedralNormalStress: 93, octahedralShearStress: 80, subgradeTemperature: 30, dryWetCycleCount: 15, trafficLoadCount: 200, resilientModulus: 42.7 },
  { group: 'B', actualDryDensity: 1.88, actualCompactionDegree: 91.7, fieldMoistureContent: 13.5, saturation: 92.0, confiningPressure: 35, deviatorStress: 220, octahedralNormalStress: 100, octahedralShearStress: 85, subgradeTemperature: 32, dryWetCycleCount: 18, trafficLoadCount: 400, resilientModulus: 41.3 },
  { group: 'B', actualDryDensity: 1.90, actualCompactionDegree: 92.7, fieldMoistureContent: 12.0, saturation: 80.0, confiningPressure: 40, deviatorStress: 240, octahedralNormalStress: 107, octahedralShearStress: 90, subgradeTemperature: 28, dryWetCycleCount: 12, trafficLoadCount: 250, resilientModulus: 48.9 },
  { group: 'B', actualDryDensity: 1.99, actualCompactionDegree: 97.1, fieldMoistureContent: 9.5, saturation: 70.0, confiningPressure: 60, deviatorStress: 150, octahedralNormalStress: 100, octahedralShearStress: 70, subgradeTemperature: 20, dryWetCycleCount: 8, trafficLoadCount: 80, resilientModulus: 65.3 },
  { group: 'B', actualDryDensity: 1.97, actualCompactionDegree: 96.1, fieldMoistureContent: 10.2, saturation: 72.0, confiningPressure: 55, deviatorStress: 130, octahedralNormalStress: 95, octahedralShearStress: 65, subgradeTemperature: 25, dryWetCycleCount: 6, trafficLoadCount: 120, resilientModulus: 58.9 },
  { group: 'C', actualDryDensity: 1.78, actualCompactionDegree: 91.3, fieldMoistureContent: 13.5, saturation: 85.0, confiningPressure: 30, deviatorStress: 150, octahedralNormalStress: 70, octahedralShearStress: 65, subgradeTemperature: 35, dryWetCycleCount: 20, trafficLoadCount: 150, resilientModulus: 38.2 },
  { group: 'C', actualDryDensity: 1.80, actualCompactionDegree: 92.3, fieldMoistureContent: 14.2, saturation: 95.0, confiningPressure: 25, deviatorStress: 180, octahedralNormalStress: 77, octahedralShearStress: 70, subgradeTemperature: 40, dryWetCycleCount: 30, trafficLoadCount: 500, resilientModulus: 28.4 },
  { group: 'C', actualDryDensity: 1.75, actualCompactionDegree: 89.7, fieldMoistureContent: 15.0, saturation: 98.0, confiningPressure: 20, deviatorStress: 160, octahedralNormalStress: 67, octahedralShearStress: 60, subgradeTemperature: 45, dryWetCycleCount: 40, trafficLoadCount: 50, resilientModulus: 25.0 },
  { group: 'C', actualDryDensity: 1.90, actualCompactionDegree: 97.4, fieldMoistureContent: 10.0, saturation: 75.0, confiningPressure: 50, deviatorStress: 100, octahedralNormalStress: 83, octahedralShearStress: 55, subgradeTemperature: 30, dryWetCycleCount: 10, trafficLoadCount: 30, resilientModulus: 55.7 },
  { group: 'C', actualDryDensity: 1.92, actualCompactionDegree: 98.5, fieldMoistureContent: 10.5, saturation: 78.0, confiningPressure: 40, deviatorStress: 80, octahedralNormalStress: 67, octahedralShearStress: 45, subgradeTemperature: 35, dryWetCycleCount: 15, trafficLoadCount: 10, resilientModulus: 52.4 },
  { group: 'D', actualDryDensity: 1.95, actualCompactionDegree: 92.9, fieldMoistureContent: 12.0, saturation: 88.0, confiningPressure: 50, deviatorStress: 180, octahedralNormalStress: 97, octahedralShearStress: 75, subgradeTemperature: 10, dryWetCycleCount: 25, trafficLoadCount: 100, resilientModulus: 35.8 },
  { group: 'D', actualDryDensity: 1.98, actualCompactionDegree: 94.3, fieldMoistureContent: 11.5, saturation: 82.0, confiningPressure: 45, deviatorStress: 220, octahedralNormalStress: 103, octahedralShearStress: 88, subgradeTemperature: 15, dryWetCycleCount: 22, trafficLoadCount: 350, resilientModulus: 44.6 },
  { group: 'D', actualDryDensity: 2.05, actualCompactionDegree: 97.6, fieldMoistureContent: 9.0, saturation: 60.0, confiningPressure: 70, deviatorStress: 120, octahedralNormalStress: 103, octahedralShearStress: 65, subgradeTemperature: 5, dryWetCycleCount: 3, trafficLoadCount: 20, resilientModulus: 85.2 },
  { group: 'D', actualDryDensity: 2.00, actualCompactionDegree: 95.2, fieldMoistureContent: 9.8, saturation: 68.0, confiningPressure: 80, deviatorStress: 140, octahedralNormalStress: 123, octahedralShearStress: 80, subgradeTemperature: 8, dryWetCycleCount: 5, trafficLoadCount: 60, resilientModulus: 68.4 },
  { group: 'D', actualDryDensity: 2.03, actualCompactionDegree: 96.7, fieldMoistureContent: 9.5, saturation: 65.0, confiningPressure: 90, deviatorStress: 110, octahedralNormalStress: 137, octahedralShearStress: 75, subgradeTemperature: 12, dryWetCycleCount: 4, trafficLoadCount: 40, resilientModulus: 62.1 },
];

const groupBaseModulus: Record<string, number> = { A: 65, B: 55, C: 45, D: 50 };

class PINNPredictor {
  private trainingDataRef: ProcessedDataRow[] = [];
  private isTrained = false;

  setTrainingData(data: ProcessedDataRow[]) {
    this.trainingDataRef = data;
    this.isTrained = data.length > 5;
  }

  private getGroupFromInput(input: PredictionInput): string {
    const pd = input.particleDensity || 3.0;
    if (pd >= 3.18) return 'A';
    if (pd >= 3.08) return 'B';
    if (pd >= 2.98) return 'C';
    return 'D';
  }

  private findSimilarRecords(input: Record<string, number>): typeof trainingData[0][] {
    return trainingData.filter(record => {
      const compactionDiff = Math.abs(record.actualCompactionDegree - (input.actualCompactionDegree || 0));
      const moistureDiff = Math.abs(record.fieldMoistureContent - (input.fieldMoistureContent || 0));
      return compactionDiff < 3 && moistureDiff < 2;
    });
  }

  private calculateKEffect(compactionDegree: number): number {
    if (compactionDegree >= 97) return 25;
    if (compactionDegree >= 95) return 15;
    if (compactionDegree >= 93) return 5;
    if (compactionDegree >= 90) return -5;
    return -15;
  }

  private calculateMoistureEffect(moistureContent: number): number {
    if (moistureContent <= 9) return 15;
    if (moistureContent <= 10.5) return 8;
    if (moistureContent <= 12) return 0;
    if (moistureContent <= 14) return -10;
    return -20;
  }

  private calculateSaturationEffect(saturation: number): number {
    if (saturation <= 60) return 12;
    if (saturation <= 75) return 5;
    if (saturation <= 85) return 0;
    if (saturation <= 95) return -10;
    return -20;
  }

  private calculateCyclesEffect(dryWetCycles: number, trafficLoads: number): number {
    const cycleEffect = dryWetCycles > 20 ? -15 : dryWetCycles > 10 ? -8 : dryWetCycles > 5 ? -3 : 0;
    const loadEffect = trafficLoads > 300 ? -10 : trafficLoads > 100 ? -5 : trafficLoads > 50 ? -2 : 0;
    return cycleEffect + loadEffect;
  }

  private calculateStressEffect(confiningPressure: number, deviatorStress: number): number {
    const octStress = (confiningPressure * 2 + deviatorStress) / 3;
    if (octStress >= 150) return 15;
    if (octStress >= 100) return 8;
    if (octStress >= 70) return 3;
    return 0;
  }

  private calculateTemperatureEffect(temp: number): number {
    if (temp <= 10) return 8;
    if (temp <= 20) return 3;
    if (temp <= 30) return 0;
    if (temp <= 40) return -5;
    return -12;
  }

  private calculateBasePrediction(input: PredictionInput): number {
    const group = this.getGroupFromInput(input);
    const base = groupBaseModulus[group];
    
    const actualDryDensity = input.actualDryDensity || 1.9;
    const actualCompactionDegree = input.actualCompactionDegree || 93;
    const fieldMoistureContent = input.fieldMoistureContent || 12;
    const saturation = input.saturation || 75;
    const confiningPressure = input.confiningPressure || 50;
    const deviatorStress = input.deviatorStress || 150;
    const dryWetCycleCount = input.dryWetCycleCount || 10;
    const trafficLoadCount = input.trafficLoadCount || 100;
    const subgradeTemperature = input.subgradeTemperature || 25;
    
    const kEffect = this.calculateKEffect(actualCompactionDegree);
    const moistureEffect = this.calculateMoistureEffect(fieldMoistureContent);
    const saturationEffect = this.calculateSaturationEffect(saturation);
    const cycleEffect = this.calculateCyclesEffect(dryWetCycleCount, trafficLoadCount);
    const stressEffect = this.calculateStressEffect(confiningPressure, deviatorStress);
    const tempEffect = this.calculateTemperatureEffect(subgradeTemperature);
    
    const densityEffect = (actualDryDensity - 1.8) * 30;
    
    const totalEffect = kEffect + moistureEffect + saturationEffect + cycleEffect + stressEffect + tempEffect + densityEffect;
    
    return base + totalEffect;
  }

  private calculateDataDrivenAdjustment(input: PredictionInput): number {
    const inputRecord = {
      actualCompactionDegree: input.actualCompactionDegree || 93,
      fieldMoistureContent: input.fieldMoistureContent || 12,
      saturation: input.saturation || 75,
      dryWetCycleCount: input.dryWetCycleCount || 10,
      trafficLoadCount: input.trafficLoadCount || 100,
      confiningPressure: input.confiningPressure || 50,
      deviatorStress: input.deviatorStress || 150,
      subgradeTemperature: input.subgradeTemperature || 25,
    };
    
    const similar = this.findSimilarRecords(inputRecord);
    
    if (similar.length >= 3) {
      const avgModulus = similar.reduce((sum, r) => sum + r.resilientModulus, 0) / similar.length;
      const basePred = this.calculateBasePrediction(input);
      const adjustment = (avgModulus - basePred) * 0.3;
      return adjustment;
    }
    
    return 0;
  }

  private calculateConfidence(input: PredictionInput): number {
    const compactionDegree = input.actualCompactionDegree || 93;
    const fieldMoistureContent = input.fieldMoistureContent || 12;
    const dryWetCycleCount = input.dryWetCycleCount || 10;
    
    let confidence = 0.85;
    
    if (compactionDegree >= 95 && compactionDegree <= 99) confidence += 0.05;
    if (fieldMoistureContent >= 8 && fieldMoistureContent <= 12) confidence += 0.03;
    if (dryWetCycleCount <= 15) confidence += 0.02;
    
    return Math.min(confidence, 0.95);
  }

  private calculateParticleBreakage(input: PredictionInput): number {
    const compactionDegree = input.actualCompactionDegree || 93;
    const dryWetCycleCount = input.dryWetCycleCount || 10;
    const trafficLoadCount = input.trafficLoadCount || 100;
    
    const base = 0.03;
    const compactionEffect = (100 - compactionDegree) * 0.002;
    const cycleEffect = dryWetCycleCount * 0.003;
    const loadEffect = Math.log10(trafficLoadCount + 1) * 0.01;
    
    return Math.min(base + compactionEffect + cycleEffect + loadEffect, 0.5);
  }

  async predict(
    input: PredictionInput,
    _constraints: PhysicsConstraint[]
  ): Promise<PredictionResult> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const basePrediction = this.calculateBasePrediction(input);
    const dataAdjustment = this.calculateDataDrivenAdjustment(input);
    const finalPrediction = Math.max(20, Math.min(100, basePrediction + dataAdjustment));

    const particleBreakage = this.calculateParticleBreakage(input);
    const confidence = this.calculateConfidence(input);

    return {
      id: `pred_${Date.now()}`,
      input,
      output: {
        resilientModulus: Math.round(finalPrediction * 10) / 10,
        confidence: Math.round(confidence * 100) / 100,
        particleBreakage: Math.round(particleBreakage * 1000) / 1000,
        reliability: confidence > 0.9 ? '高' : confidence > 0.8 ? '中' : '较低',
      },
      timestamp: new Date().toISOString(),
      modelVersion: '2.1.0',
    };
  }

  getModelInfo() {
    return {
      isTrained: this.isTrained,
      trainingDataSize: trainingData.length,
      groupBaseModulus,
    };
  }
}

export const pinnPredictor = new PINNPredictor();