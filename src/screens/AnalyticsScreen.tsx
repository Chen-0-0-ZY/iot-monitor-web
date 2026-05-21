import React, { useEffect } from 'react';
import { COLORS } from '../types';
import { EnhancedTrendChart } from '../components/EnhancedTrendChart';
import { useStore } from '../store/useStore';

export const AnalyticsScreen: React.FC = () => {
  const { config, fetchCurrentData } = useStore();

  useEffect(() => {
    if (config.refreshInterval > 0) {
      const interval = setInterval(async () => {
        // 先尝试获取新数据，然后刷新历史数据
        await fetchCurrentData();
      }, config.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [config.refreshInterval, fetchCurrentData]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: COLORS.background }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '20px', color: COLORS.text }}>
            数据分析
          </h1>
          
          <EnhancedTrendChart />
        </div>
      </div>
    </div>
  );
};
