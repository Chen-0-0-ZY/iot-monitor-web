import React from 'react';
import { COLORS } from '../types';
import { EnhancedTrendChart } from '../components/EnhancedTrendChart';

export const AnalyticsScreen: React.FC = () => {
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