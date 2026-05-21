import React, { useEffect, useState, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { DataCard } from '../components/DataCard';
import { COLORS } from '../types';
import dayjs from 'dayjs';

interface HomeScreenProps {
  onNavigateToSettings?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToSettings }) => {
  const { config, currentData, isLoading, getStatus, fetchCurrentData, loadConfig } = useStore();
  const status = getStatus();
  const [refreshing, setRefreshing] = useState(false);

  const isConfigured = config.accessKeyId && config.accessKeySecret && config.productKey && config.deviceName;

  useEffect(() => {
    loadConfig();
    if (!currentData) {
      fetchCurrentData();
    }
  }, []);

  useEffect(() => {
    if (config.refreshInterval > 0 && isConfigured) {
      const interval = setInterval(fetchCurrentData, config.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [config.refreshInterval, isConfigured]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCurrentData();
    setRefreshing(false);
  }, [fetchCurrentData]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: COLORS.background }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px', color: COLORS.text }}>
            实时监控
          </h1>
          {currentData && (
            <p style={{ fontSize: '14px', opacity: 0.7, color: COLORS.text }}>
              更新于: {dayjs(currentData.timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </p>
          )}
        </div>

        {!isConfigured && (
          <div 
            style={{ 
              margin: '0 16px 16px 16px',
              backgroundColor: COLORS.warning + '20',
              borderRadius: '12px',
              border: `1px solid ${COLORS.warning}40`,
              padding: '16px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.warning, marginBottom: '8px' }}>
              ⚠️ 未配置阿里云
            </h3>
            <p style={{ fontSize: '14px', color: COLORS.textSecondary, marginBottom: '12px' }}>
              请在设置页面配置阿里云IoT参数，否则无法获取真实数据
            </p>
            <button
              onClick={onNavigateToSettings}
              style={{
                backgroundColor: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              去配置
            </button>
          </div>
        )}

        {isLoading && !currentData ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid ' + COLORS.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ marginTop: '16px', fontSize: '16px', color: COLORS.text }}>获取数据中...</p>
          </div>
        ) : currentData ? (
          <>
            <div style={{ margin: '0 16px 16px 16px', backgroundColor: COLORS.surface, borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text, marginBottom: '16px' }}>📡 通道 1</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <DataCard
                  value={currentData.channel1.temperature}
                  unit="°C"
                  label="温度"
                  icon="thermometer"
                  status={status.temperature1}
                />
                <DataCard
                  value={currentData.channel1.humidity}
                  unit="%"
                  label="湿度"
                  icon="water-percent"
                  status={status.humidity1}
                />
              </div>
            </div>

            <div style={{ margin: '0 16px 16px 16px', backgroundColor: COLORS.surface, borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text, marginBottom: '16px' }}>📡 通道 2</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <DataCard
                  value={currentData.channel2.temperature}
                  unit="°C"
                  label="温度"
                  icon="thermometer"
                  status={status.temperature2}
                />
                <DataCard
                  value={currentData.channel2.humidity}
                  unit="%"
                  label="湿度"
                  icon="water-percent"
                  status={status.humidity2}
                />
              </div>
            </div>

            <div style={{ margin: '16px', backgroundColor: COLORS.surface, borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.text, marginBottom: '12px' }}>设备信息</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>产品Key:</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text }}>{config.productKey || '未配置'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>设备名称:</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text }}>{config.deviceName || '未配置'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>刷新间隔:</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: COLORS.text }}>{config.refreshInterval} 秒</span>
              </div>
            </div>
          </>
        ) : isConfigured ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', opacity: 0.8, color: COLORS.text, marginBottom: '8px' }}>无法获取数据</p>
            <p style={{ fontSize: '14px', opacity: 0.6, color: COLORS.text }}>请检查阿里云配置是否正确，或设备是否在线</p>
          </div>
        ) : null}

        <div style={{ padding: '20px' }}>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? COLORS.info : COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              width: '100%',
            }}
          >
            {isLoading ? '刷新中...' : refreshing ? '刷新中...' : '刷新数据'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};