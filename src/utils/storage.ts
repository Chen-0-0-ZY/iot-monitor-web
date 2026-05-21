import { Config, DEFAULT_CONFIG } from '../types';

const CONFIG_KEY = '@iot_config';

export const storage = {
  async getConfig(): Promise<Config> {
    try {
      const value = localStorage.getItem(CONFIG_KEY);
      if (value !== null) {
        return JSON.parse(value);
      }
      return DEFAULT_CONFIG;
    } catch (error) {
      console.error('Error getting config:', error);
      return DEFAULT_CONFIG;
    }
  },

  async saveConfig(config: Config): Promise<void> {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  },
};