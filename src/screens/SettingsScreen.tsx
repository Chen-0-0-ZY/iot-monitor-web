import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { COLORS, DEFAULT_CONFIG } from '../types';

export const SettingsScreen: React.FC = () => {
  const { config, saveConfig, loadConfig } = useStore();
  const [formData, setFormData] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = () => {
    saveConfig(formData);
    alert('配置已保存！');
  };

  const handleReset = () => {
    if (confirm('确定要重置为默认配置吗？')) {
      saveConfig(DEFAULT_CONFIG);
      setFormData(DEFAULT_CONFIG);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: COLORS.background }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '20px', color: COLORS.text }}>
            设置
          </h1>

          <div style={{ backgroundColor: COLORS.surface, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: COLORS.text }}>
              阿里云 IoT 配置
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                AccessKey ID
              </label>
              <input
                type="text"
                value={formData.accessKeyId}
                onChange={(e) => setFormData({ ...formData, accessKeyId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="请输入 AccessKey ID"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                AccessKey Secret
              </label>
              <input
                type="password"
                value={formData.accessKeySecret}
                onChange={(e) => setFormData({ ...formData, accessKeySecret: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="请输入 AccessKey Secret"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                区域 (Region)
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="例如: cn-shanghai"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                Product Key
              </label>
              <input
                type="text"
                value={formData.productKey}
                onChange={(e) => setFormData({ ...formData, productKey: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="请输入 Product Key"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                Device Name
              </label>
              <input
                type="text"
                value={formData.deviceName}
                onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="请输入 Device Name"
              />
            </div>
          </div>

          <div style={{ backgroundColor: COLORS.surface, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: COLORS.text }}>
              数据刷新
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                刷新间隔 (秒)
              </label>
              <input
                type="number"
                value={formData.refreshInterval}
                onChange={(e) => setFormData({ ...formData, refreshInterval: parseInt(e.target.value) || 30 })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                min="5"
                max="300"
              />
            </div>
          </div>

          <div style={{ backgroundColor: COLORS.surface, borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: COLORS.text }}>
              阈值设置
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                  低温警告 (°C)
                </label>
                <input
                  type="number"
                  value={formData.tempWarningLow}
                  onChange={(e) => setFormData({ ...formData, tempWarningLow: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                  高温警告 (°C)
                </label>
                <input
                  type="number"
                  value={formData.tempWarningHigh}
                  onChange={(e) => setFormData({ ...formData, tempWarningHigh: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                  低温危险 (°C)
                </label>
                <input
                  type="number"
                  value={formData.tempDangerLow}
                  onChange={(e) => setFormData({ ...formData, tempDangerLow: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                  高温危险 (°C)
                </label>
                <input
                  type="number"
                  value={formData.tempDangerHigh}
                  onChange={(e) => setFormData({ ...formData, tempDangerHigh: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                  低湿警告 (%)
                </label>
                <input
                  type="number"
                  value={formData.humiWarningLow}
                  onChange={(e) => setFormData({ ...formData, humiWarningLow: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: COLORS.textSecondary, marginBottom: '6px' }}>
                  高湿警告 (%)
                </label>
                <input
                  type="number"
                  value={formData.humiWarningHigh}
                  onChange={(e) => setFormData({ ...formData, humiWarningHigh: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              保存配置
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '14px 20px',
                backgroundColor: 'white',
                color: COLORS.text,
                border: `1px solid ${COLORS.border}`,
                borderRadius: '12px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              重置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
