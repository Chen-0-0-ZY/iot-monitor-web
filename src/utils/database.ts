import { SensorData } from '../types';

const STORAGE_KEY = 'iot_sensor_data';

interface StorageData {
  data: SensorData[];
  nextId: number;
}

const loadFromStorage = (): StorageData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading from storage:', error);
  }
  return { data: [], nextId: 1 };
};

const saveToStorage = (data: StorageData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

export const database = {
  async init(): Promise<void> {
    const data = loadFromStorage();
    saveToStorage(data);
  },

  async insertData(data: SensorData): Promise<number> {
    const storageData = loadFromStorage();
    const newData: SensorData = {
      ...data,
      id: storageData.nextId,
    };
    storageData.data.push(newData);
    storageData.nextId += 1;
    saveToStorage(storageData);
    return newData.id || 0;
  },

  async getRecentData(limit: number = 100): Promise<SensorData[]> {
    const storageData = loadFromStorage();
    return storageData.data.slice(-limit).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  },

  async getDataByDateRange(startDate: string, endDate: string): Promise<SensorData[]> {
    const storageData = loadFromStorage();
    return storageData.data.filter(item => 
      item.timestamp >= startDate && item.timestamp <= endDate
    ).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  },

  async deleteOldData(beforeDate: string): Promise<void> {
    const storageData = loadFromStorage();
    storageData.data = storageData.data.filter(item => item.timestamp >= beforeDate);
    saveToStorage(storageData);
  },

  async getAllData(): Promise<SensorData[]> {
    const storageData = loadFromStorage();
    return storageData.data.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  },

  async exportToCSV(data: SensorData[]): Promise<string> {
    const headers = ['ID', '温度1(°C)', '湿度1(%)', '温度2(°C)', '湿度2(%)', '时间'];
    const rows = data.map(item => [
      item.id || '',
      item.channel1.temperature.toFixed(1),
      item.channel1.humidity.toFixed(1),
      item.channel2.temperature.toFixed(1),
      item.channel2.humidity.toFixed(1),
      item.timestamp,
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csvContent;
  },

  async downloadCSV(data: SensorData[], filename: string = 'sensor_data.csv'): Promise<void> {
    const csvContent = await this.exportToCSV(data);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  async clearAllData(): Promise<void> {
    saveToStorage({ data: [], nextId: 1 });
  },
};