import React from 'react';
import { COLORS } from '../types';

interface DataCardProps {
  value: number;
  unit: string;
  label: string;
  icon: string;
  status: 'normal' | 'warning' | 'danger';
}

export const DataCard: React.FC<DataCardProps> = ({ value, unit, label, icon, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'danger':
        return COLORS.danger;
      case 'warning':
        return COLORS.warning;
      default:
        return COLORS.normal;
    }
  };

  const renderIcon = () => {
    const color = getStatusColor();
    switch (icon) {
      case 'thermometer':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
          </svg>
        );
      case 'water-percent':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      backgroundColor: COLORS.surface,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '4px' }}>{label}</p>
          <h2 style={{ fontSize: '36px', fontWeight: '700', color: getStatusColor() }}>
            {value.toFixed(1)}
            <span style={{ fontSize: '18px', fontWeight: '500' }}>{unit}</span>
          </h2>
        </div>
        {renderIcon()}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
        }} />
        <span style={{ fontSize: '12px', color: COLORS.textSecondary, textTransform: 'capitalize' }}>
          {status === 'normal' ? '正常' : status === 'warning' ? '警告' : '危险'}
        </span>
      </div>
    </div>
  );
};
