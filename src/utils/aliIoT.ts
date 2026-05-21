import CryptoJS from 'crypto-js';
import { Config, SensorData } from '../types';

export interface HistoryQuery {
  startTime?: number;
  endTime?: number;
  pageSize?: number;
  currentPage?: number;
}

export interface HistoryDataPoint {
  timestamp: string;
  temperature1?: number;
  humidity1?: number;
  temperature2?: number;
  humidity2?: number;
}

export const aliIoT = {
  async fetchData(config: Config): Promise<SensorData | null> {
    try {
      if (!config.accessKeyId || !config.accessKeySecret || !config.productKey || !config.deviceName) {
        console.log('阿里云配置不完整，请在设置中配置');
        return null;
      }
      
      const deviceData = await this.queryDevicePropertyStatus(config);
      if (deviceData) {
        return {
          channel1: { temperature: deviceData.temperature1, humidity: deviceData.humidity1 },
          channel2: { temperature: deviceData.temperature2, humidity: deviceData.humidity2 },
          timestamp: new Date().toISOString(),
        };
      }
      
      console.log('尝试使用设备影子API...');
      const shadowData = await this.getDeviceShadow(config);
      if (shadowData) {
        return {
          channel1: { temperature: shadowData.temperature, humidity: shadowData.humidity },
          channel2: { temperature: shadowData.temperature, humidity: shadowData.humidity },
          timestamp: new Date().toISOString(),
        };
      }
      
      console.log('未能获取设备数据');
      return null;
    } catch (error) {
      console.error('获取数据失败:', error);
      return null;
    }
  },

  async queryHistoryData(config: Config, query: HistoryQuery = {}): Promise<HistoryDataPoint[]> {
    const { accessKeyId, accessKeySecret, productKey, deviceName, region } = config;
    
    const {
      startTime = Date.now() - 24 * 60 * 60 * 1000,
      endTime = Date.now(),
      pageSize = 100,
      currentPage = 1,
    } = query;

    try {
      const params: Record<string, string> = {
        Action: 'QueryDevicePropertyData',
        ProductKey: productKey,
        DeviceName: deviceName,
        Version: '2018-01-20',
        Format: 'JSON',
        AccessKeyId: accessKeyId,
        SignatureMethod: 'HMAC-SHA1',
        SignatureVersion: '1.0',
        Timestamp: this.getISO8601Timestamp(),
        SignatureNonce: this.generateSignatureNonce(),
        StartTime: startTime.toString(),
        EndTime: endTime.toString(),
        PageSize: pageSize.toString(),
        CurrentPage: currentPage.toString(),
        Asc: '1',
        Identifier: 'temperature_1,humidity_1,temperature_2,humidity_2',
      };

      const signature = this.generateSignature(params, accessKeySecret, 'GET');
      params.Signature = signature;

      const queryString = Object.keys(params)
        .sort()
        .map((key) => `${this.percentEncoder(key)}=${this.percentEncoder(params[key])}`)
        .join('&');

      const regionToUse = region || 'cn-shanghai';
      const url = `https://iot.${regionToUse}.aliyuncs.com/?${queryString}`;
      
      console.log('正在查询设备属性历史数据...');
      console.log('时间范围:', new Date(startTime).toLocaleString(), '至', new Date(endTime).toLocaleString());
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }
      
      const data = JSON.parse(responseText);
      
      console.log('阿里云API响应:', JSON.stringify(data, null, 2));
      
      if (data.Success && data.Data) {
        let listData = [];
        
        if (Array.isArray(data.Data)) {
          listData = data.Data;
        } else if (data.Data.List && Array.isArray(data.Data.List.PropertyInfo)) {
          listData = data.Data.List.PropertyInfo;
        } else if (Array.isArray(data.Data.List)) {
          listData = data.Data.List;
        } else if (Array.isArray(data.Data.PropertyInfo)) {
          listData = data.Data.PropertyInfo;
        } else if (data.Data.PropertyInfo && Array.isArray(data.Data.PropertyInfo.PropertyInfo)) {
          listData = data.Data.PropertyInfo.PropertyInfo;
        } else if (Array.isArray(data.Data.Data)) {
          listData = data.Data.Data;
        }
        
        if (!Array.isArray(listData)) {
          console.error('查询历史数据失败: 数据列表不是数组', data.Data);
          return [];
        }
        
        console.log('成功获取历史数据，共', listData.length, '条记录');
        
        const historyData: HistoryDataPoint[] = [];
        
        for (const item of listData) {
          const timestamp = item.Time || item.timestamp || item.CollectTime;
          if (!timestamp) continue;
          
          const propertyData = item.Data || item.data || item.PropertyValue || {};
          
          const dataPoint: HistoryDataPoint = {
            timestamp: typeof timestamp === 'number' ? new Date(timestamp).toISOString() : 
                       typeof timestamp === 'string' && !isNaN(parseInt(timestamp)) ? new Date(parseInt(timestamp)).toISOString() :
                       new Date(timestamp).toISOString(),
          };
          
          for (const prop of Object.keys(propertyData)) {
            const value = propertyData[prop];
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            
            if (prop === 'temperature_1' && typeof numValue === 'number') {
              dataPoint.temperature1 = numValue;
            } else if (prop === 'humidity_1' && typeof numValue === 'number') {
              dataPoint.humidity1 = numValue;
            } else if (prop === 'temperature_2' && typeof numValue === 'number') {
              dataPoint.temperature2 = numValue;
            } else if (prop === 'humidity_2' && typeof numValue === 'number') {
              dataPoint.humidity2 = numValue;
            }
          }
          
          if (Object.keys(dataPoint).length > 1) {
            historyData.push(dataPoint);
          }
        }
        
        return historyData.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      } else {
        console.error('查询历史数据失败:', data.Message || '未知错误');
        return [];
      }
    } catch (error) {
      console.error('查询历史数据失败:', error);
      return [];
    }
  },

  async queryDevicePropertyStatus(config: Config): Promise<{ temperature1: number; humidity1: number; temperature2: number; humidity2: number } | null> {
    const { accessKeyId, accessKeySecret, productKey, deviceName, region } = config;
    
    try {
      const params: Record<string, string> = {
        Action: 'QueryDevicePropertyStatus',
        ProductKey: productKey,
        DeviceName: deviceName,
        Version: '2018-01-20',
        Format: 'JSON',
        AccessKeyId: accessKeyId,
        SignatureMethod: 'HMAC-SHA1',
        SignatureVersion: '1.0',
        Timestamp: this.getISO8601Timestamp(),
        SignatureNonce: this.generateSignatureNonce(),
      };

      const signature = this.generateSignature(params, accessKeySecret, 'GET');
      params.Signature = signature;

      const queryString = Object.keys(params)
        .sort()
        .map((key) => `${this.percentEncoder(key)}=${this.percentEncoder(params[key])}`)
        .join('&');

      const regionToUse = region || 'cn-shanghai';
      const url = `https://iot.${regionToUse}.aliyuncs.com/?${queryString}`;
      
      console.log('正在查询设备属性状态...');
      console.log('请求URL:', url.substring(0, 150) + '...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('API响应状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
      }
      
      const data = JSON.parse(responseText);
      
      if (data.Success === true && data.Data && data.Data.List && data.Data.List.PropertyStatusInfo) {
        let temperature1: number | undefined;
        let humidity1: number | undefined;
        let temperature2: number | undefined;
        let humidity2: number | undefined;
        
        for (const item of data.Data.List.PropertyStatusInfo) {
          const identifier = item.Identifier || item.identifier;
          const value = item.Value || item.value;
          
          console.log('属性数据:', { identifier, value, valueType: typeof value });
          
          if (identifier === 'temperature_1') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (typeof numValue === 'number' && !isNaN(numValue)) {
              temperature1 = numValue;
            }
          } else if (identifier === 'humidity_1') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (typeof numValue === 'number' && !isNaN(numValue)) {
              humidity1 = numValue;
            }
          } else if (identifier === 'temperature_2') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (typeof numValue === 'number' && !isNaN(numValue)) {
              temperature2 = numValue;
            }
          } else if (identifier === 'humidity_2') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (typeof numValue === 'number' && !isNaN(numValue)) {
              humidity2 = numValue;
            }
          }
        }
        
        if (temperature1 !== undefined && humidity1 !== undefined && 
            temperature2 !== undefined && humidity2 !== undefined) {
          console.log('成功解析属性数据:', { temperature1, humidity1, temperature2, humidity2 });
          return { temperature1, humidity1, temperature2, humidity2 };
        } else {
          console.log('属性不完整:', { temperature1, humidity1, temperature2, humidity2 });
          console.log('可用属性列表:', data.Data.List.PropertyStatusInfo.map((item: any) => item.Identifier));
        }
      }
      
      if (data.Message) {
        console.error('属性状态API错误:', data.Message);
      }
      
      return null;
    } catch (error) {
      console.error('查询属性状态失败:', error);
      return null;
    }
  },

  async getDeviceShadow(config: Config): Promise<{ temperature: number; humidity: number } | null> {
    const { accessKeyId, accessKeySecret, productKey, deviceName, region } = config;
    
    try {
      const params: Record<string, string> = {
        Action: 'GetDeviceShadow',
        ProductKey: productKey,
        DeviceName: deviceName,
        Version: '2018-01-20',
        Format: 'JSON',
        AccessKeyId: accessKeyId,
        SignatureMethod: 'HMAC-SHA1',
        SignatureVersion: '1.0',
        Timestamp: this.getISO8601Timestamp(),
        SignatureNonce: this.generateSignatureNonce(),
      };

      const signature = this.generateSignature(params, accessKeySecret, 'GET');
      params.Signature = signature;

      const queryString = Object.keys(params)
        .sort()
        .map((key) => `${this.percentEncoder(key)}=${this.percentEncoder(params[key])}`)
        .join('&');

      const regionToUse = region || 'cn-shanghai';
      const url = `https://iot.${regionToUse}.aliyuncs.com/?${queryString}`;
      
      console.log('正在查询设备影子数据...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('设备影子API失败 - 状态:', response.status);
        return null;
      }
      
      const data = JSON.parse(responseText);
      
      if (data.Code === 'Success' && data.Data && data.Data.Shadow) {
        const reported = data.Data.Shadow.Reported || data.Data.Shadow.Desired || {};
        
        const temperature = reported.temperature !== undefined 
          ? reported.temperature 
          : reported.Temperature !== undefined 
            ? reported.Temperature 
            : reported.temp;
        
        const humidity = reported.humidity !== undefined 
          ? reported.humidity 
          : reported.Humidity !== undefined 
            ? reported.Humidity 
            : reported.humi;
        
        if (typeof temperature === 'number' && typeof humidity === 'number') {
          console.log('成功获取设备影子数据:', { temperature, humidity });
          return { temperature, humidity };
        }
      } else if (data.Message) {
        console.error('设备影子API错误:', data.Message);
      }
      
      return null;
    } catch (error) {
      console.error('获取设备影子失败:', error);
      return null;
    }
  },

  generateSignature(params: Record<string, string>, accessKeySecret: string, method: string): string {
    const sortedKeys = Object.keys(params).sort();
    const canonicalizedQueryString = sortedKeys
      .map((key) => this.percentEncoder(key) + '=' + this.percentEncoder(params[key]))
      .join('&');
    
    const stringToSign = `${method.toUpperCase()}&%2F&${this.percentEncoder(canonicalizedQueryString)}`;
    
    const hmac = CryptoJS.HmacSHA1(stringToSign, accessKeySecret + '&');
    const signature = CryptoJS.enc.Base64.stringify(hmac);
    
    return signature;
  },

  percentEncoder(str: string): string {
    return encodeURIComponent(str)
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\*/g, '%2A')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29');
  },

  getISO8601Timestamp(): string {
    const date = new Date();
    const yyyy = date.getUTCFullYear();
    const MM = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(date.getUTCDate()).padStart(2, '0');
    const HH = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}Z`;
  },

  generateSignatureNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },
};