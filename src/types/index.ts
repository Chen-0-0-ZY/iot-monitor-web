export interface Config {
  accessKeyId: string;
  accessKeySecret: string;
  region: string;
  productKey: string;
  deviceName: string;
  topic: string;
  refreshInterval: number;
  tempWarningLow: number;
  tempWarningHigh: number;
  tempDangerLow: number;
  tempDangerHigh: number;
  humiWarningLow: number;
  humiWarningHigh: number;
  humiDangerLow: number;
  humiDangerHigh: number;
}

export interface SingleSensorData {
  temperature: number;
  humidity: number;
}

export interface SensorData {
  id?: number;
  channel1: SingleSensorData;
  channel2: SingleSensorData;
  timestamp: string;
}

export interface DataStatus {
  temperature1: 'normal' | 'warning' | 'danger';
  humidity1: 'normal' | 'warning' | 'danger';
  temperature2: 'normal' | 'warning' | 'danger';
  humidity2: 'normal' | 'warning' | 'danger';
}

export interface StatsData {
  temp1Max: number;
  temp1Min: number;
  temp1Avg: number;
  humi1Max: number;
  humi1Min: number;
  humi1Avg: number;
  temp2Max: number;
  temp2Min: number;
  temp2Avg: number;
  humi2Max: number;
  humi2Min: number;
  humi2Avg: number;
}

export const COLORS = {
  primary: '#165DFF',
  secondary: '#36CFC9',
  success: '#00B42A',
  warning: '#FF7D00',
  danger: '#F53F3F',
  info: '#869095',
  normal: '#00B42A',
  background: '#F7F8FA',
  surface: '#FFFFFF',
  text: '#1D2129',
  textSecondary: '#869095',
  border: '#E5E6EB',
};

export const DEFAULT_CONFIG: Config = {
  accessKeyId: '',
  accessKeySecret: '',
  region: 'cn-shanghai',
  productKey: '',
  deviceName: '',
  topic: '',
  refreshInterval: 30,
  tempWarningLow: 15,
  tempWarningHigh: 30,
  tempDangerLow: 10,
  tempDangerHigh: 35,
  humiWarningLow: 30,
  humiWarningHigh: 70,
  humiDangerLow: 20,
  humiDangerHigh: 80,
};