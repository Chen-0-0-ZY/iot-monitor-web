import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { COLORS } from '../types';
import dayjs from 'dayjs';

export const HistoryScreen: React.FC = () => {
  const { historyData, loadHistoryData, syncHistoryData, clearAllData, isSyncing, config, fetchCurrentData } = useStore();
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [selectedData, setSelectedData] = useState<any>(null);
  const [syncStartDate, setSyncStartDate] = useState<string>(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
  const [syncEndDate, setSyncEndDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    loadHistoryData();
  }, []);

  useEffect(() => {
    if (config.refreshInterval > 0) {
      const interval = setInterval(async () => {
        // 先尝试获取新数据，然后刷新历史数据
        await fetchCurrentData();
      }, config.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [config.refreshInterval, fetchCurrentData]);

  const filteredData = historyData.filter(item => {
    const itemDate = dayjs(item.timestamp);
    const now = dayjs();
    switch (filter) {
      case 'today':
        return itemDate.isSame(now, 'day');
      case 'week':
        return itemDate.isAfter(now.subtract(7, 'day'));
      case 'month':
        return itemDate.isAfter(now.subtract(30, 'day'));
      default:
        return true;
    }
  });

  const handleSync = async () => {
    const startTime = dayjs(syncStartDate).startOf('day').valueOf();
    const endTime = dayjs(syncEndDate).endOf('day').valueOf();
    await syncHistoryData(startTime, endTime);
    setShowSyncModal(false);
  };

  const handleClear = async () => {
    await clearAllData();
    setShowClearModal(false);
  };

  const exportData = () => {
    const csv = [
      '时间,温度1(°C),湿度1(%),温度2(°C),湿度2(%)',
      ...filteredData.map(item => 
        `${dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss')},${item.channel1.temperature},${item.channel1.humidity},${item.channel2.temperature},${item.channel2.humidity}`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `温湿度数据_${dayjs().format('YYYYMMDD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: COLORS.background }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px', color: COLORS.text }}>
            历史数据
          </h1>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowSyncModal(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid ' + COLORS.primary,
                backgroundColor: 'white',
                color: COLORS.primary,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              🔄 数据同步
            </button>

            {[
              { key: 'today' as const, label: '今天' },
              { key: 'week' as const, label: '本周' },
              { key: 'month' as const, label: '本月' },
              { key: 'all' as const, label: '全部' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${filter === item.key ? COLORS.primary : COLORS.border}`,
                  backgroundColor: filter === item.key ? COLORS.primary : 'white',
                  color: filter === item.key ? 'white' : COLORS.text,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={exportData}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid ' + COLORS.primary,
                backgroundColor: 'white',
                color: COLORS.primary,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              📥 导出CSV
            </button>
            <button
              onClick={() => setShowClearModal(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid ' + COLORS.danger,
                backgroundColor: 'white',
                color: COLORS.danger,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              🗑️ 清空数据
            </button>
          </div>

          <div style={{
            padding: '12px 16px',
            backgroundColor: COLORS.primary + '10',
            borderRadius: '8px',
            marginBottom: '16px',
            border: `1px solid ${COLORS.primary}30`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: COLORS.text }}>
                💾 本地存储: <strong>{historyData.length}</strong> 条记录
              </span>
              <span style={{ fontSize: '12px', color: COLORS.textSecondary }}>
                共 {filteredData.length} 条显示
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: COLORS.surface, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}`, fontWeight: '600', color: COLORS.text }}>
              <span>时间</span>
              <span style={{ textAlign: 'center' }}>温度1</span>
              <span style={{ textAlign: 'center' }}>湿度1</span>
              <span style={{ textAlign: 'center' }}>温度2</span>
              <span style={{ textAlign: 'center' }}>湿度2</span>
            </div>
            {filteredData.slice().reverse().map((item, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', 
                  padding: '12px 16px', 
                  borderBottom: index < filteredData.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedData(item)}
              >
                <span style={{ fontSize: '14px', color: COLORS.text }}>
                  {dayjs(item.timestamp).format('MM-DD HH:mm')}
                </span>
                <span style={{ fontSize: '14px', color: COLORS.text, textAlign: 'center' }}>
                  {item.channel1.temperature.toFixed(1)}°C
                </span>
                <span style={{ fontSize: '14px', color: COLORS.text, textAlign: 'center' }}>
                  {item.channel1.humidity.toFixed(1)}%
                </span>
                <span style={{ fontSize: '14px', color: COLORS.text, textAlign: 'center' }}>
                  {item.channel2.temperature.toFixed(1)}°C
                </span>
                <span style={{ fontSize: '14px', color: COLORS.text, textAlign: 'center' }}>
                  {item.channel2.humidity.toFixed(1)}%
                </span>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: COLORS.textSecondary }}>
                暂无数据，点击上方"数据同步"从阿里云获取历史数据
              </div>
            )}
          </div>
        </div>
      </div>

      {showSyncModal && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => !isSyncing && setShowSyncModal(false)}
        >
          <div 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px',
              minWidth: '350px',
              maxWidth: '90vw',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: COLORS.text }}>
              🔄 从阿里云同步历史数据
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '8px' }}>
                开始日期
              </label>
              <input
                type="date"
                value={syncStartDate}
                onChange={(e) => setSyncStartDate(e.target.value)}
                disabled={isSyncing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E6EB',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '8px' }}>
                结束日期
              </label>
              <input
                type="date"
                value={syncEndDate}
                onChange={(e) => setSyncEndDate(e.target.value)}
                disabled={isSyncing}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E6EB',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{
              padding: '12px',
              backgroundColor: '#FEF3C7',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#92400E' }}>
                ⚠️ 阿里云默认保留最近30天的数据。同步的数据将保存到本地存储，可用于数据分析。
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSyncModal(false)}
                disabled={isSyncing}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #E5E6EB',
                  backgroundColor: 'white',
                  color: COLORS.text,
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  opacity: isSyncing ? 0.6 : 1,
                }}
              >
                取消
              </button>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: COLORS.primary,
                  color: 'white',
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  opacity: isSyncing ? 0.6 : 1,
                }}
              >
                {isSyncing ? '同步中...' : '开始同步'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearModal && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowClearModal(false)}
        >
          <div 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px',
              minWidth: '350px',
              maxWidth: '90vw',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: COLORS.text }}>
              🗑️ 确认清空数据
            </h3>
            <div style={{
              padding: '12px',
              backgroundColor: '#FEF2F2',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#991B1B' }}>
                ⚠️ 此操作将删除本地存储的所有数据，且无法恢复。请确保已导出重要数据后再执行此操作。
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowClearModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #E5E6EB',
                  backgroundColor: 'white',
                  color: COLORS.text,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                取消
              </button>
              <button
                onClick={handleClear}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: COLORS.danger,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedData && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedData(null)}
        >
          <div 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px',
              minWidth: '300px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: COLORS.text }}>
              数据详情
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ color: COLORS.textSecondary, fontSize: '14px' }}>时间: </span>
              <span style={{ color: COLORS.text, fontSize: '14px' }}>
                {dayjs(selectedData.timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: COLORS.primary + '10', borderRadius: '8px' }}>
              <span style={{ color: COLORS.textSecondary, fontSize: '14px' }}>通道 1: </span>
              <span style={{ color: COLORS.text, fontSize: '14px' }}>
                {selectedData.channel1.temperature.toFixed(1)}°C / {selectedData.channel1.humidity.toFixed(1)}%
              </span>
            </div>
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: COLORS.secondary + '10', borderRadius: '8px' }}>
              <span style={{ color: COLORS.textSecondary, fontSize: '14px' }}>通道 2: </span>
              <span style={{ color: COLORS.text, fontSize: '14px' }}>
                {selectedData.channel2.temperature.toFixed(1)}°C / {selectedData.channel2.humidity.toFixed(1)}%
              </span>
            </div>
            <button 
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={() => setSelectedData(null)}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
