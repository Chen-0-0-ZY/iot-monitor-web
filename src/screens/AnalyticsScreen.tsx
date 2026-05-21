import React, { useEffect } from 'react';
import { COLORS } from '../types';
import { EnhancedTrendChart } from '../components/EnhancedTrendChart';
import { useStore } from '../store/useStore';

export const AnalyticsScreen: React.FC = () => {
  const { config, loadHistoryData } = useStore();

  useEffect(() => {
    if (config.refreshInterval > 0) {
      const interval = setInterval(() => {
        loadHistoryData();
      }, config.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [config.refreshInterval, loadHistoryData]);

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