import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { COLORS } from '../types';
import dayjs from 'dayjs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

export const EnhancedTrendChart: React.FC = () => {
  const { historyData, loadHistoryData } = useStore();
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d' | 'custom' | 'all'>('24h');
  const [customStart, setCustomStart] = useState<string>(dayjs().subtract(24, 'hour').format('YYYY-MM-DDTHH:mm'));
  const [customEnd, setCustomEnd] = useState<string>(dayjs().format('YYYY-MM-DDTHH:mm'));
  const [visibleLines, setVisibleLines] = useState({
    temp1: true,
    humi1: true,
    temp2: true,
    humi2: true,
  });

  useEffect(() => {
    loadHistoryData();
  }, []);

  const filteredData = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    const now = dayjs();
    let filtered = historyData;

    switch (timeRange) {
      case '1h':
        filtered = historyData.filter(d => dayjs(d.timestamp).isAfter(now.subtract(1, 'hour')));
        break;
      case '6h':
        filtered = historyData.filter(d => dayjs(d.timestamp).isAfter(now.subtract(6, 'hour')));
        break;
      case '24h':
        filtered = historyData.filter(d => dayjs(d.timestamp).isAfter(now.subtract(24, 'hour')));
        break;
      case '7d':
        filtered = historyData.filter(d => dayjs(d.timestamp).isAfter(now.subtract(7, 'day')));
        break;
      case '30d':
        filtered = historyData.filter(d => dayjs(d.timestamp).isAfter(now.subtract(30, 'day')));
        break;
      case 'custom':
        const startTime = dayjs(customStart);
        const endTime = dayjs(customEnd);
        filtered = historyData.filter(d => {
          const time = dayjs(d.timestamp);
          return time.isAfter(startTime) && time.isBefore(endTime);
        });
        break;
    }

    return filtered.map(item => {
      const time = dayjs(item.timestamp);
      const showTime = timeRange === '30d' || timeRange === '7d' || timeRange === 'all' || timeRange === 'custom'
        ? time.format('MM-DD HH:mm')
        : time.format('HH:mm');
      return {
        time: showTime,
        fullTime: time.format('YYYY-MM-DD HH:mm:ss'),
        timestamp: time.valueOf(),
        temp1: item.channel1.temperature,
        humi1: item.channel1.humidity,
        temp2: item.channel2.temperature,
        humi2: item.channel2.humidity,
      };
    });
  }, [historyData, timeRange, customStart, customEnd]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;

    const temps1 = filteredData.map(d => d.temp1);
    const humis1 = filteredData.map(d => d.humi1);
    const temps2 = filteredData.map(d => d.temp2);
    const humis2 = filteredData.map(d => d.humi2);

    const avgTemp1 = temps1.reduce((a, b) => a + b, 0) / temps1.length;
    const avgHumi1 = humis1.reduce((a, b) => a + b, 0) / humis1.length;
    const avgTemp2 = temps2.reduce((a, b) => a + b, 0) / temps2.length;
    const avgHumi2 = humis2.reduce((a, b) => a + b, 0) / humis2.length;
    
    const maxTemp = Math.max(...temps1, ...temps2);
    const minTemp = Math.min(...temps1, ...temps2);
    const maxHumi = Math.max(...humis1, ...humis2);
    const minHumi = Math.min(...humis1, ...humis2);

    const temp1Trend = temps1.length > 1 ? temps1[temps1.length - 1] - temps1[0] : 0;
    const humi1Trend = humis1.length > 1 ? humis1[humis1.length - 1] - humis1[0] : 0;
    const temp2Trend = temps2.length > 1 ? temps2[temps2.length - 1] - temps2[0] : 0;
    const humi2Trend = humis2.length > 1 ? humis2[humis2.length - 1] - humis2[0] : 0;

    return {
      avgTemp1,
      avgHumi1,
      avgTemp2,
      avgHumi2,
      maxTemp,
      minTemp,
      maxHumi,
      minHumi,
      temp1Trend,
      humi1Trend,
      temp2Trend,
      humi2Trend,
      dataCount: filteredData.length,
    };
  }, [filteredData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const time = payload[0]?.payload?.fullTime || payload[0]?.payload?.time;
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          border: '1px solid #E5E6EB',
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#333' }}>{time}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(1)}
              {entry.name.includes('温度') ? '°C' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const Checkbox = ({ label, checked, onChange, color }: { label: string; checked: boolean; onChange: (v: boolean) => void; color: string }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          width: '16px',
          height: '16px',
          cursor: 'pointer',
          accentColor: color,
        }}
      />
      <span style={{ fontSize: '13px', color: COLORS.text }}>{label}</span>
    </label>
  );

  if (historyData.length === 0) {
    return (
      <div style={{
        backgroundColor: COLORS.surface,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <p style={{ fontSize: '16px', color: COLORS.textSecondary, margin: 0 }}>
          暂无数据，请先获取温湿度数据
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        backgroundColor: COLORS.surface,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: COLORS.text }}>
            📈 温湿度趋势分析
          </h3>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E5E6EB',
                backgroundColor: 'white',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="1h">1小时</option>
              <option value="6h">6小时</option>
              <option value="24h">24小时</option>
              <option value="7d">7天</option>
              <option value="30d">30天</option>
              <option value="custom">自定义</option>
              <option value="all">全部</option>
            </select>

            {timeRange === 'custom' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="datetime-local"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E6EB',
                    fontSize: '14px',
                  }}
                />
                <span style={{ color: COLORS.textSecondary }}>至</span>
                <input
                  type="datetime-local"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E6EB',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Checkbox
                label="通道一温度"
                checked={visibleLines.temp1}
                onChange={(v) => setVisibleLines(p => ({ ...p, temp1: v }))}
                color={COLORS.primary}
              />
              <Checkbox
                label="通道一湿度"
                checked={visibleLines.humi1}
                onChange={(v) => setVisibleLines(p => ({ ...p, humi1: v }))}
                color={COLORS.secondary}
              />
              <Checkbox
                label="通道二温度"
                checked={visibleLines.temp2}
                onChange={(v) => setVisibleLines(p => ({ ...p, temp2: v }))}
                color="#9333EA"
              />
              <Checkbox
                label="通道二湿度"
                checked={visibleLines.humi2}
                onChange={(v) => setVisibleLines(p => ({ ...p, humi2: v }))}
                color="#F59E0B"
              />
            </div>
          </div>
        </div>

        {timeRange === 'custom' && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#F0F9FF',
            borderRadius: '8px',
            border: '1px solid #0EA5E9',
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#0369A1' }}>
              📅 自定义时间范围：{dayjs(customStart).format('YYYY-MM-DD HH:mm')} 至 {dayjs(customEnd).format('YYYY-MM-DD HH:mm')}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#0284C7' }}>
              共找到 {filteredData.length} 条数据记录
            </p>
          </div>
        )}

        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E6EB" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: '#869095' }}
                tickLine={{ stroke: '#E5E6EB' }}
                axisLine={{ stroke: '#E5E6EB' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                yAxisId="temp"
                orientation="left"
                tick={{ fontSize: 12, fill: '#869095' }}
                tickLine={{ stroke: '#E5E6EB' }}
                axisLine={{ stroke: '#E5E6EB' }}
                domain={['dataMin - 5', 'dataMax + 5']}
                label={{ value: '温度 (°C)', angle: -90, position: 'insideLeft', fill: COLORS.primary }}
              />
              <YAxis 
                yAxisId="humi"
                orientation="right"
                tick={{ fontSize: 12, fill: '#869095' }}
                tickLine={{ stroke: '#E5E6EB' }}
                axisLine={{ stroke: '#E5E6EB' }}
                domain={[0, 100]}
                label={{ value: '湿度 (%)', angle: 90, position: 'insideRight', fill: COLORS.secondary }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <ReferenceLine yAxisId="temp" y={25} stroke="#FF6B6B" strokeDasharray="5 5" label="温度阈值" />

              {visibleLines.temp1 && (
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temp1"
                  name="通道一温度"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.primary, r: 3 }}
                  activeDot={{ r: 6, fill: COLORS.primary }}
                />
              )}
              {visibleLines.humi1 && (
                <Line
                  yAxisId="humi"
                  type="monotone"
                  dataKey="humi1"
                  name="通道一湿度"
                  stroke={COLORS.secondary}
                  strokeWidth={2}
                  dot={{ fill: COLORS.secondary, r: 3 }}
                  activeDot={{ r: 6, fill: COLORS.secondary }}
                  strokeDasharray="5 5"
                />
              )}
              {visibleLines.temp2 && (
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temp2"
                  name="通道二温度"
                  stroke="#9333EA"
                  strokeWidth={2}
                  dot={{ fill: '#9333EA', r: 3 }}
                  activeDot={{ r: 6, fill: '#9333EA' }}
                />
              )}
              {visibleLines.humi2 && (
                <Line
                  yAxisId="humi"
                  type="monotone"
                  dataKey="humi2"
                  name="通道二湿度"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', r: 3 }}
                  activeDot={{ r: 6, fill: '#F59E0B' }}
                  strokeDasharray="5 5"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats && (
        <div style={{
          backgroundColor: COLORS.surface,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: COLORS.text }}>
            📊 统计摘要
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {/* 通道一统计 */}
            <div style={{
              padding: '16px',
              backgroundColor: COLORS.primary + '08',
              borderRadius: '12px',
              border: `2px solid ${COLORS.primary}20`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: COLORS.primary 
                }} />
                <span style={{ fontSize: '16px', fontWeight: 600, color: COLORS.primary }}>通道一</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: COLORS.textSecondary }}>平均温度</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: COLORS.primary }}>
                    {stats.avgTemp1.toFixed(1)}°C
                  </p>
                  {stats.temp1Trend !== 0 && (
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: stats.temp1Trend > 0 ? '#EF4444' : '#22C55E' }}>
                      {stats.temp1Trend > 0 ? '↑' : '↓'} {Math.abs(stats.temp1Trend).toFixed(1)}°C
                    </p>
                  )}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: COLORS.textSecondary }}>平均湿度</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: COLORS.secondary }}>
                    {stats.avgHumi1.toFixed(1)}%
                  </p>
                  {stats.humi1Trend !== 0 && (
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: stats.humi1Trend > 0 ? '#3B82F6' : '#F59E0B' }}>
                      {stats.humi1Trend > 0 ? '↑' : '↓'} {Math.abs(stats.humi1Trend).toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 通道二统计 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#9333EA08',
              borderRadius: '12px',
              border: '2px solid #9333EA20',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#9333EA' 
                }} />
                <span style={{ fontSize: '16px', fontWeight: 600, color: '#9333EA' }}>通道二</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: COLORS.textSecondary }}>平均温度</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: '#9333EA' }}>
                    {stats.avgTemp2.toFixed(1)}°C
                  </p>
                  {stats.temp2Trend !== 0 && (
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: stats.temp2Trend > 0 ? '#EF4444' : '#22C55E' }}>
                      {stats.temp2Trend > 0 ? '↑' : '↓'} {Math.abs(stats.temp2Trend).toFixed(1)}°C
                    </p>
                  )}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: COLORS.textSecondary }}>平均湿度</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontWeight: 700, color: '#F59E0B' }}>
                    {stats.avgHumi2.toFixed(1)}%
                  </p>
                  {stats.humi2Trend !== 0 && (
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: stats.humi2Trend > 0 ? '#3B82F6' : '#F59E0B' }}>
                      {stats.humi2Trend > 0 ? '↑' : '↓'} {Math.abs(stats.humi2Trend).toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: COLORS.text, marginBottom: '12px' }}>
              📈 整体范围
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#FEE2E2', 
                  borderRadius: '8px',
                  fontSize: '18px',
                }}>
                  🌡️
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: COLORS.textSecondary }}>温度范围</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 600, color: '#EF4444' }}>
                    {stats.minTemp.toFixed(1)}°C ~ {stats.maxTemp.toFixed(1)}°C
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#DBEAFE', 
                  borderRadius: '8px',
                  fontSize: '18px',
                }}>
                  💧
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: COLORS.textSecondary }}>湿度范围</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '16px', fontWeight: 600, color: '#3B82F6' }}>
                    {stats.minHumi.toFixed(1)}% ~ {stats.maxHumi.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: COLORS.primary + '08',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontSize: '14px', color: COLORS.text }}>
              📊 共 <strong>{stats.dataCount}</strong> 条数据记录
            </span>
            <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>
              时间范围：{timeRange === 'custom' 
                ? `${dayjs(customStart).format('MM-DD HH:mm')} - ${dayjs(customEnd).format('MM-DD HH:mm')}` 
                : (timeRange === 'all' ? '全部' : timeRange)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};