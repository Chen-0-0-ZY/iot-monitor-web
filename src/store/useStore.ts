import { create } from 'zustand';
import { Config, SensorData, StatsData, DEFAULT_CONFIG, DataStatus } from '../types';
import { storage } from '../utils/storage';
import { database } from '../utils/database';
import { aliIoT } from '../utils/aliIoT';

interface AppState {
  config: Config;
  currentData: SensorData | null;
  historyData: SensorData[];
  isLoading: boolean;
  isSyncing: boolean;
  setConfig: (config: Partial<Config>) => Promise<void>;
  saveConfig: (config: Config) => Promise<void>;
  loadConfig: () => Promise<void>;
  fetchCurrentData: () => Promise<void>;
  loadHistoryData: (limit?: number) => Promise<void>;
  syncHistoryData: (startTime: number, endTime: number) => Promise<void>;
  clearAllData: () => Promise<void>;
  getStatus: () => DataStatus;
  getStats: () => StatsData | null;
}

export const useStore = create<AppState>((set, get) => ({
  config: DEFAULT_CONFIG,
  currentData: null,
  historyData: [],
  isLoading: false,
  isSyncing: false,

  setConfig: async (newConfig) => {
    const currentConfig = get().config;
    const updatedConfig = { ...currentConfig, ...newConfig };
    await storage.saveConfig(updatedConfig);
    set({ config: updatedConfig });
  },

  saveConfig: async (config) => {
    await storage.saveConfig(config);
    set({ config });
  },

  loadConfig: async () => {
    const savedConfig = await storage.getConfig();
    set({ config: savedConfig });
  },

  fetchCurrentData: async () => {
    set({ isLoading: true });
    try {
      const config = get().config;
      const data = await aliIoT.fetchData(config);
      if (data) {
        await database.insertData(data);
        const historyData = await database.getRecentData(500);
        set({ currentData: data, historyData });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadHistoryData: async (limit = 100) => {
    const data = await database.getRecentData(limit);
    set({ historyData: data });
  },

  syncHistoryData: async (startTime: number, endTime: number) => {
    set({ isSyncing: true });
    try {
      const config = get().config;
      const historyPoints = await aliIoT.queryHistoryData(config, {
        startTime,
        endTime,
        pageSize: 500,
        currentPage: 1,
      });

      console.log('获取到历史数据点:', historyPoints.length);

      for (const point of historyPoints) {
        const sensorData: SensorData = {
          channel1: {
            temperature: point.temperature1 || 0,
            humidity: point.humidity1 || 0,
          },
          channel2: {
            temperature: point.temperature2 || point.temperature1 || 0,
            humidity: point.humidity2 || point.humidity1 || 0,
          },
          timestamp: point.timestamp,
        };

        await database.insertData(sensorData);
      }

      await get().loadHistoryData(500);
      console.log('历史数据同步完成');
    } catch (error) {
      console.error('同步历史数据失败:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  clearAllData: async () => {
    await database.clearAllData();
    set({ historyData: [], currentData: null });
    console.log('所有数据已清空');
  },

  getStatus: () => {
    const { currentData, config } = get();
    if (!currentData) {
      return { temperature1: 'normal', humidity1: 'normal', temperature2: 'normal', humidity2: 'normal' };
    }
    return calculateDataStatus(currentData, config);
  },

  getStats: () => {
    const { historyData } = get();
    if (historyData.length === 0) return null;

    const temps1 = historyData.map(d => d.channel1.temperature);
    const humis1 = historyData.map(d => d.channel1.humidity);
    const temps2 = historyData.map(d => d.channel2.temperature);
    const humis2 = historyData.map(d => d.channel2.humidity);

    return {
      temp1Max: Math.max(...temps1),
      temp1Min: Math.min(...temps1),
      temp1Avg: temps1.reduce((a, b) => a + b, 0) / temps1.length,
      humi1Max: Math.max(...humis1),
      humi1Min: Math.min(...humis1),
      humi1Avg: humis1.reduce((a, b) => a + b, 0) / humis1.length,
      temp2Max: Math.max(...temps2),
      temp2Min: Math.min(...temps2),
      temp2Avg: temps2.reduce((a, b) => a + b, 0) / temps2.length,
      humi2Max: Math.max(...humis2),
      humi2Min: Math.min(...humis2),
      humi2Avg: humis2.reduce((a, b) => a + b, 0) / humis2.length,
    };
  },
}));

function calculateDataStatus(data: SensorData, config: Config): DataStatus {
  let temp1Status: 'normal' | 'warning' | 'danger' = 'normal';
  let humi1Status: 'normal' | 'warning' | 'danger' = 'normal';
  let temp2Status: 'normal' | 'warning' | 'danger' = 'normal';
  let humi2Status: 'normal' | 'warning' | 'danger' = 'normal';

  if (data.channel1.temperature <= config.tempDangerLow || data.channel1.temperature >= config.tempDangerHigh) {
    temp1Status = 'danger';
  } else if (data.channel1.temperature <= config.tempWarningLow || data.channel1.temperature >= config.tempWarningHigh) {
    temp1Status = 'warning';
  }

  if (data.channel1.humidity <= config.humiDangerLow || data.channel1.humidity >= config.humiDangerHigh) {
    humi1Status = 'danger';
  } else if (data.channel1.humidity <= config.humiWarningLow || data.channel1.humidity >= config.humiWarningHigh) {
    humi1Status = 'warning';
  }

  if (data.channel2.temperature <= config.tempDangerLow || data.channel2.temperature >= config.tempDangerHigh) {
    temp2Status = 'danger';
  } else if (data.channel2.temperature <= config.tempWarningLow || data.channel2.temperature >= config.tempWarningHigh) {
    temp2Status = 'warning';
  }

  if (data.channel2.humidity <= config.humiDangerLow || data.channel2.humidity >= config.humiDangerHigh) {
    humi2Status = 'danger';
  } else if (data.channel2.humidity <= config.humiWarningLow || data.channel2.humidity >= config.humiWarningHigh) {
    humi2Status = 'warning';
  }

  return { temperature1: temp1Status, humidity1: humi1Status, temperature2: temp2Status, humidity2: humi2Status };
}