import React from 'react';
import { COLORS } from '../types';

interface StatusIndicatorProps {
  status: 'normal' | 'warning' | 'danger';
  label: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'danger':
        return { color: COLORS.danger, bgColor: COLORS.danger + '10', text: '危险' };
      case 'warning':
        return { color: COLORS.warning, bgColor: COLORS.warning + '10', text: '警告' };
      default:
        return { color: COLORS.normal, bgColor: COLORS.normal + '10', text: '正常' };
    }
  };

  const info = getStatusInfo();

  return (
    <div style={{
      flex: 1,
      minWidth: '200px',
      backgroundColor: info.bgColor,
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: info.color + '20',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: info.color,
        }} />
      </div>
      <div>
        <p style={{ fontSize: '12px', color: COLORS.textSecondary, marginBottom: '4px' }}>{label}</p>
        <p style={{ fontSize: '16px', fontWeight: '600', color: info.color }}>{info.text}</p>
      </div>
    </div>
  );
};
