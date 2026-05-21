import React from 'react';
import { COLORS } from '../types';

interface SimpleLineChartProps {
  data: { temperature: number; humidity: number; timestamp: string }[];
  height?: number;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  height = 200,
}) => {
  if (data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textSecondary }}>
        暂无数据
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = 800;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const temps = data.map(d => d.temperature);
  const humis = data.map(d => d.humidity);
  
  const tempMin = Math.min(...temps);
  const tempMax = Math.max(...temps);
  const humiMin = Math.min(...humis);
  const humiMax = Math.max(...humis);
  
  const tempRange = tempMax - tempMin || 1;
  const humiRange = humiMax - humiMin || 1;

  const tempPoints = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - ((item.temperature - tempMin) / tempRange) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const humiPoints = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - ((item.humidity - humiMin) / humiRange) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const yAxisLabels = [];
  const numLabels = 5;
  for (let i = 0; i < numLabels; i++) {
    const tempValue = tempMin + (tempRange * i) / (numLabels - 1);
    const y = padding.top + chartHeight - (i / (numLabels - 1)) * chartHeight;
    yAxisLabels.push({ value: tempValue.toFixed(1), y });
  }

  const xAxisLabels = [];
  const labelStep = Math.ceil(data.length / 5);
  for (let i = 0; i < data.length; i += labelStep) {
    xAxisLabels.push({
      label: data[i].timestamp.slice(11, 16),
      x: padding.left + (i / (data.length - 1 || 1)) * chartWidth,
    });
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width={width} height={height} style={{ minWidth: width }}>
        {yAxisLabels.map((item, index) => (
          <React.Fragment key={`y-${index}`}>
            <line
              x1={padding.left}
              y1={item.y}
              x2={width - padding.right}
              y2={item.y}
              stroke="#E5E6EB"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <text
              x={padding.left - 8}
              y={item.y + 4}
              fontSize="10"
              fill="#869095"
              textAnchor="end"
            >
              {item.value}
            </text>
          </React.Fragment>
        ))}

        <polyline
          points={tempPoints}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <polyline
          points={humiPoints}
          fill="none"
          stroke={COLORS.secondary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6"
        />

        {xAxisLabels.map((item, index) => (
          <text
            key={`x-${index}`}
            x={item.x}
            y={height - 15}
            fontSize="10"
            fill="#869095"
            textAnchor="middle"
          >
            {item.label}
          </text>
        ))}
      </svg>
    </div>
  );
};